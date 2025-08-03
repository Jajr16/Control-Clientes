import { pool } from '../config/db.js';

export const createTableAdeudo = async () => {
    const query = `
        CREATE TABLE IF NOT EXISTS adeudo (
            num_factura VARCHAR(50) PRIMARY KEY,
            concepto VARCHAR(200) NOT NULL,
            proveedor VARCHAR(50) NOT NULL,
            ff DATE NOT NULL,
            importe NUMERIC NOT NULL,
            iva NUMERIC NOT NULL,
            retencion NUMERIC NOT NULL,
            num_liquidacion INT NOT NULL,
            empresa_cif VARCHAR(9) NOT NULL,
            FOREIGN KEY (empresa_cif) REFERENCES empresa(cif)
                ON DELETE CASCADE
                ON UPDATE CASCADE,
            FOREIGN KEY (num_liquidacion) REFERENCES honorario(num_liquidacion)
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
            num_liquidacion SERIAL PRIMARY KEY,
            importe NUMERIC NOT NULL,
            iva NUMERIC NOT NULL,
            num_factura VARCHAR(50) NOT NULL
        );
    `;

    try {
        await pool.query(query);
        console.log('Tabla honorario creada o ya existente')
    } catch (error) {
        console.error('Error al crear la tabla honorario:', error)
    }
}

export const createTableProtocolo = async () => {
    const query = `
        CREATE TABLE IF NOT EXISTS protocolo(
            num_factura VARCHAR(50) PRIMARY KEY, 
            protocolo_entrada VARCHAR(50) NOT NULL,
            cs_iva NUMERIC NOT NULL, 
            FOREIGN KEY (num_factura) REFERENCES adeudo(num_factura)
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
            num_factura VARCHAR(50) PRIMARY KEY, 
            diferencia NUMERIC NOT NULL,
            FOREIGN KEY (num_factura) REFERENCES adeudo(num_factura)
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
            importe NUMERIC NOT NULL,
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