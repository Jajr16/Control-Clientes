import Repositorio from "../repositories/globalPersistence.js";
import { pool } from "../config/db.js";

const adeudoRepo = new Repositorio('adeudo', 'num_factura');
const protocoloRepo = new Repositorio('protocolo', 'num_factura');
const anticipoRepo = new Repositorio('anticipo', 'empresa_cif');
const ajusteRepo = new Repositorio('ajuste', 'num_factura');

export const insertarAdeudoCompleto = async ({ adeudo, protocolo, ajuste }) => {
  const client = await pool.connect();  

  try {
        await client.query('BEGIN');

        // 1. Insertar adeudo SIN num_liquidacion (queda como NULL = pendiente)
        const adeudoInsertado = await adeudoRepo.insertar(adeudo, client);
        console.log('Adeudo insertado como PENDIENTE:', adeudoInsertado);

        // 2. Insertar protocolo
        if (protocolo && Object.keys(protocolo).length > 0) {
            await protocoloRepo.insertar(protocolo, client);
            console.log('Protocolo insertado');
        }

        // 3. Usar anticipo existente si hay
        const anticipoExistente = await anticipoRepo.ObtenerPorId({ empresa_cif: adeudo.empresa_cif });
        if (anticipoExistente) {
            console.log('Usando anticipo existente:', anticipoExistente);
        } else {
            console.log('No existe anticipo para esta empresa');
        }

        // 4. Insertar ajuste
        if (ajuste && Object.keys(ajuste).length > 0) {
            await ajusteRepo.insertar(ajuste, client);
            console.log('Ajuste insertado');
        }

        await client.query('COMMIT');
        return adeudoInsertado;
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error en la transacción de insertarAdeudoCompleto:', error);
        throw error;
    } finally {
        client.release();
    }
};

// NUEVA FUNCIÓN: Obtener todos los adeudos con estado
export const obtenerTodosAdeudosPorEmpresa = async (empresa_cif) => {
    console.log("Buscando TODOS los adeudos para empresa:", empresa_cif);
    
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
            COALESCE(p.protocolo_entrada, '') AS protocolo_entrada,
            COALESCE(p.cs_iva, 0) AS cs_iva,
            (COALESCE(a.importe,0) + COALESCE(a.iva,0) - COALESCE(a.retencion,0) + COALESCE(p.cs_iva,0)) AS total,
            COALESCE(an.anticipo, 0) AS anticipo,
            COALESCE(h.honorario, 0) AS honorarios_base,
            COALESCE(h.iva, 0) AS honorarios_iva,
            a.empresa_cif,
            CASE 
                WHEN a.num_liquidacion IS NULL THEN 'PENDIENTE'
                ELSE 'LIQUIDADO'
            END as estado,
            h.fecha_creacion as fecha_liquidacion
        FROM adeudo a
        LEFT JOIN protocolo p ON a.num_factura = p.num_factura
        LEFT JOIN anticipo an ON a.empresa_cif = an.empresa_cif
        LEFT JOIN honorario h ON a.num_liquidacion = h.num_liquidacion AND a.empresa_cif = h.empresa_cif
        WHERE a.empresa_cif = $1
        ORDER BY 
            CASE WHEN a.num_liquidacion IS NULL THEN 0 ELSE 1 END,
            COALESCE(a.num_liquidacion, 999999) DESC, 
            a.ff ASC;
    `;

    const result = await pool.query(query, [empresa_cif]);
    console.log("Total adeudos encontrados:", result.rows.length);
    
    // Separar por estado para estadísticas
    const pendientes = result.rows.filter(r => r.estado === 'PENDIENTE').length;
    const liquidados = result.rows.filter(r => r.estado === 'LIQUIDADO').length;
    
    console.log(`- Pendientes: ${pendientes}`);
    console.log(`- Liquidados: ${liquidados}`);
    
    return result.rows;
};

// NUEVA FUNCIÓN: Solo adeudos pendientes
export const obtenerAdeudosPendientes = async (empresa_cif) => {
    console.log("Buscando adeudos PENDIENTES para empresa:", empresa_cif);
    
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
            COALESCE(p.protocolo_entrada, '') AS protocolo_entrada,
            COALESCE(p.cs_iva, 0) AS cs_iva,
            (COALESCE(a.importe,0) + COALESCE(a.iva,0) - COALESCE(a.retencion,0) + COALESCE(p.cs_iva,0)) AS total,
            COALESCE(an.anticipo, 0) AS anticipo,
            a.empresa_cif,
            'PENDIENTE' as estado
        FROM adeudo a
        LEFT JOIN protocolo p ON a.num_factura = p.num_factura
        LEFT JOIN anticipo an ON a.empresa_cif = an.empresa_cif
        WHERE a.empresa_cif = $1 AND a.num_liquidacion IS NULL
        ORDER BY a.ff ASC;
    `;

    const result = await pool.query(query, [empresa_cif]);
    console.log("Adeudos PENDIENTES encontrados:", result.rows.length);
    return result.rows;
};

// FUNCIÓN ACTUALIZADA: Verificar adeudos pendientes
export const verificarAdeudosPendientes = async (empresa_cif) => {
    const query = `
        SELECT COUNT(*) as total_pendientes
        FROM adeudo 
        WHERE empresa_cif = $1 AND num_liquidacion IS NULL
    `;
    
    const result = await pool.query(query, [empresa_cif]);
    const totalPendientes = parseInt(result.rows[0].total_pendientes);
    
    console.log(`Empresa ${empresa_cif} tiene ${totalPendientes} adeudos pendientes`);
    
    return {
        hay_pendientes: totalPendientes > 0,
        total_pendientes: totalPendientes
    };
};

// MANTENER LA FUNCIÓN ORIGINAL PARA COMPATIBILIDAD (pero actualizada)
export const obtenerAdeudosPorEmpresa = async (empresa_cif) => {
    console.log("DEPRECADO: Usar obtenerTodosAdeudosPorEmpresa en su lugar");
    return await obtenerTodosAdeudosPorEmpresa(empresa_cif);
};