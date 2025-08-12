// services/LiquidacionService.js
import { pool } from "../config/db.js";

export const crearLiquidacionFinal = async ({ empresa_cif, honorarios_sin_iva }) => {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        
        // 1. Obtener el próximo número de liquidación
        const nextNumQuery = `
            SELECT COALESCE(MAX(num_liquidacion), 0) + 1 as next_num 
            FROM honorario 
            WHERE empresa_cif = $1
        `;
        const nextNumResult = await client.query(nextNumQuery, [empresa_cif]);
        const num_liquidacion = nextNumResult.rows[0].next_num;
        
        // 2. Calcular IVA de honorarios
        const iva_honorarios = honorarios_sin_iva * 0.21;
        
        // 3. Insertar en tabla honorario
        const insertHonorarioQuery = `
            INSERT INTO honorario (empresa_cif, num_liquidacion, honorario, iva, num_factura)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;
        
        // Crear un número de factura único para los honorarios
        const num_factura_honorario = `HON-${empresa_cif}-${num_liquidacion}-${new Date().getFullYear()}`;
        
        const honorarioResult = await client.query(insertHonorarioQuery, [
            empresa_cif,
            num_liquidacion,
            honorarios_sin_iva,
            iva_honorarios,
            num_factura_honorario
        ]);
        
        // 4. Obtener TODOS los adeudos pendientes (sin liquidación) de la empresa
        const adeudosPendientesQuery = `
            SELECT num_factura 
            FROM adeudo 
            WHERE empresa_cif = $1 AND num_liquidacion IS NULL
        `;
        
        const adeudosPendientesResult = await client.query(adeudosPendientesQuery, [empresa_cif]);
        const facturasPendientes = adeudosPendientesResult.rows.map(row => row.num_factura);
        
        console.log(`Liquidando ${facturasPendientes.length} adeudos pendientes para empresa ${empresa_cif}`);
        
        // 5. Actualizar TODOS los adeudos pendientes con el número de liquidación
        if (facturasPendientes.length > 0) {
            const updateAdeudosQuery = `
                UPDATE adeudo 
                SET num_liquidacion = $1 
                WHERE num_factura = ANY($2::varchar[]) AND empresa_cif = $3 AND num_liquidacion IS NULL
            `;
            
            const updateResult = await client.query(updateAdeudosQuery, [
                num_liquidacion,
                facturasPendientes,
                empresa_cif
            ]);
            
            console.log(`${updateResult.rowCount} adeudos actualizados con liquidación N° ${num_liquidacion}`);
        } else {
            console.log('No hay adeudos pendientes para liquidar');
        }
        
        // 6. Obtener resumen de la liquidación creada con datos reales
        const resumenQuery = `
            SELECT 
                h.num_liquidacion,
                h.empresa_cif,
                h.honorario,
                h.iva as iva_honorarios,
                h.num_factura as factura_honorarios,
                COUNT(a.num_factura) as total_adeudos_liquidados,
                COALESCE(SUM(a.importe + a.iva - a.retencion + COALESCE(p.cs_iva, 0)), 0) as total_adeudos_importe,
                COALESCE(MAX(an.anticipo), 0) as anticipo,
                (COALESCE(SUM(a.importe + a.iva - a.retencion + COALESCE(p.cs_iva, 0)), 0) + h.honorario + h.iva - COALESCE(MAX(an.anticipo), 0)) as adeudo_final
            FROM honorario h
            LEFT JOIN adeudo a ON h.num_liquidacion = a.num_liquidacion AND h.empresa_cif = a.empresa_cif
            LEFT JOIN protocolo p ON a.num_factura = p.num_factura
            LEFT JOIN anticipo an ON h.empresa_cif = an.empresa_cif
            WHERE h.num_liquidacion = $1 AND h.empresa_cif = $2
            GROUP BY h.num_liquidacion, h.empresa_cif, h.honorario, h.iva, h.num_factura
        `;
        
        const resumenResult = await client.query(resumenQuery, [num_liquidacion, empresa_cif]);
        
        await client.query('COMMIT');
        
        return {
            success: true,
            num_liquidacion,
            datos: resumenResult.rows[0],
            facturas_liquidadas: facturasPendientes,
            total_facturas_liquidadas: facturasPendientes.length,
            mensaje: `Liquidación N° ${num_liquidacion} creada exitosamente. ${facturasPendientes.length} adeudos liquidados.`
        };
        
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error al crear liquidación:', error);
        throw error;
    } finally {
        client.release();
    }
};

export const obtenerLiquidacionesPorEmpresa = async (empresa_cif) => {
    const query = `
        SELECT 
            h.num_liquidacion,
            h.empresa_cif,
            h.honorario,
            h.iva as iva_honorarios,
            h.num_factura as factura_honorarios,
            COUNT(a.num_factura) as total_adeudos,
            COALESCE(SUM(a.importe + a.iva - a.retencion), 0) as total_adeudos_importe,
            COALESCE(MAX(an.anticipo), 0) as anticipo,
            (COALESCE(SUM(a.importe + a.iva - a.retencion), 0) + (h.honorario + h.iva) - COALESCE(MAX(an.anticipo), 0)) as adeudo_pendiente
        FROM honorario h
        LEFT JOIN adeudo a ON h.num_liquidacion = a.num_liquidacion AND h.empresa_cif = a.empresa_cif
        LEFT JOIN anticipo an ON h.empresa_cif = an.empresa_cif
        WHERE h.empresa_cif = $1
        GROUP BY h.num_liquidacion, h.empresa_cif, h.honorario, h.iva, h.num_factura
        ORDER BY h.num_liquidacion DESC
    `;
    
    const result = await pool.query(query, [empresa_cif]);
    return result.rows;
};

export const obtenerDetallesLiquidacion = async (empresa_cif, num_liquidacion) => {
    const query = `
        SELECT 
            a.num_factura,
            a.concepto,
            a.proveedor,
            a.ff,
            a.importe,
            a.iva,
            a.retencion,
            a.num_liquidacion,
            a.empresa_cif,
            COALESCE(p.protocolo_entrada, '') AS protocolo_entrada,
            COALESCE(p.cs_iva, 0) AS cs_iva,
            (a.importe + a.iva - a.retencion + COALESCE(p.cs_iva, 0)) AS total
        FROM adeudo a
        LEFT JOIN protocolo p ON a.num_factura = p.num_factura
        WHERE a.empresa_cif = $1 AND a.num_liquidacion = $2
        ORDER BY a.ff
    `;
    
    const result = await pool.query(query, [empresa_cif, num_liquidacion]);
    return result.rows;
};