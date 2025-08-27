import { pool } from '../config/db.js';

export const createTableAdeudo = async () => {
    const query = `
        CREATE TABLE IF NOT EXISTS adeudo (
            num_factura VARCHAR(50),
            concepto VARCHAR(200) NOT NULL,
            proveedor VARCHAR(50) NOT NULL,
            ff DATE NOT NULL,
            importe NUMERIC NOT NULL,
            iva NUMERIC NOT NULL,
            retencion NUMERIC NOT NULL,
            num_liquidacion INT,
            empresa_cif VARCHAR(9) NOT NULL,
            fecha_creacion TIMESTAMP DEFAULT NOW(),
            PRIMARY KEY (num_factura, empresa_cif),
            FOREIGN KEY (empresa_cif) REFERENCES empresa(cif)
                ON DELETE CASCADE
                ON UPDATE CASCADE,
            FOREIGN KEY (empresa_cif, num_liquidacion) REFERENCES honorario(empresa_cif, num_liquidacion)
                ON DELETE CASCADE
                ON UPDATE CASCADE
        );
    `;

    try {
        await pool.query(query);
        console.log('Tabla adeudo creada o ya existente');
    } catch (error) {
        console.error('Error al crear la tabla adeudo:', error);
        throw error;
    }
};

export const createTableHonorario = async () => {
    const query = `
        CREATE TABLE IF NOT EXISTS honorario(
            empresa_cif VARCHAR(9) NOT NULL,
            num_liquidacion INT NOT NULL,
            honorario NUMERIC NOT NULL,
            iva NUMERIC NOT NULL,
            num_factura VARCHAR(50) NOT NULL UNIQUE,
            fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY(empresa_cif, num_liquidacion),
            FOREIGN KEY (empresa_cif) REFERENCES empresa(cif)
                ON DELETE CASCADE
                ON UPDATE CASCADE
        );
    `;

    try {
        await pool.query(query);
        console.log('Tabla honorario creada o ya existente');
    } catch (error) {
        console.error('Error al crear la tabla honorario:', error);
        throw error;
    }
};

export const createTableProtocolo = async () => {
    const query = `
        CREATE TABLE IF NOT EXISTS protocolo(
            num_factura VARCHAR(50),
            empresa_cif VARCHAR(9),
            protocolo_entrada VARCHAR(50) NOT NULL,
            cs_iva NUMERIC NOT NULL, 
            PRIMARY KEY (num_factura, empresa_cif),
            FOREIGN KEY (num_factura, empresa_cif) REFERENCES adeudo(num_factura, empresa_cif)
                ON DELETE CASCADE
                ON UPDATE CASCADE
        );
    `;

    try {
        await pool.query(query);
        console.log('Tabla protocolo creada o ya existente');
    } catch (error) {
        console.error('Error al crear la tabla protocolo:', error);
        throw error;
    }
}

export const createTableAjuste = async () => {
    const query = `
        CREATE TABLE IF NOT EXISTS ajuste(
            num_factura VARCHAR(50),
            empresa_cif VARCHAR(9),
            diferencia NUMERIC NOT NULL,
            PRIMARY KEY (num_factura, empresa_cif),
            FOREIGN KEY (num_factura, empresa_cif) REFERENCES adeudo(num_factura, empresa_cif)
                ON DELETE CASCADE
                ON UPDATE CASCADE
        );
    `;

    try {
        await pool.query(query);
        console.log('Tabla ajuste creada o ya existente');
    } catch (error) {
        console.error('Error al crear la tabla ajuste:', error);
        throw error;
    }
}

export const createTableAnticipo = async () => {
    const query = `
        CREATE TABLE IF NOT EXISTS anticipo(
            empresa_cif VARCHAR(9) PRIMARY KEY,
            anticipo NUMERIC NOT NULL,
            FOREIGN KEY (empresa_cif) REFERENCES empresa(cif)
                ON DELETE CASCADE
                ON UPDATE CASCADE
        );
    `;

    try {
        await pool.query(query);
        console.log('Tabla anticipo creada o ya existente');
    } catch (error) {
        console.error('Error al crear la tabla anticipo:', error);
        throw error;
    }
}

// 2. Función para obtener SOLO adeudos pendientes (sin liquidar)
export const obtenerAdeudosPendientes = async (empresa_cif) => {
    console.log("Buscando adeudos PENDIENTES (sin liquidar) para empresa:", empresa_cif);

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

// 3. Función para obtener SOLO adeudos liquidados
export const obtenerAdeudosLiquidados = async (empresa_cif) => {
    console.log("Buscando adeudos LIQUIDADOS para empresa:", empresa_cif);

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
            'LIQUIDADO' as estado,
            h.fecha_creacion as fecha_liquidacion
        FROM adeudo a
        LEFT JOIN protocolo p ON a.num_factura = p.num_factura
        LEFT JOIN anticipo an ON a.empresa_cif = an.empresa_cif
        LEFT JOIN honorario h ON a.num_liquidacion = h.num_liquidacion AND a.empresa_cif = h.empresa_cif
        WHERE a.empresa_cif = $1 AND a.num_liquidacion IS NOT NULL
        ORDER BY a.num_liquidacion DESC, a.ff ASC;
    `;

    const result = await pool.query(query, [empresa_cif]);
    console.log("Adeudos LIQUIDADOS encontrados:", result.rows.length);
    return result.rows;
};

// 4. Función para obtener TODOS los adeudos con su estado
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

// 5. Función para verificar si hay adeudos pendientes antes de liquidar
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