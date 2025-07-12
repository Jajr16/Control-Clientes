import { pool } from '../config/db.js';

export const createTableAdeudo = async () => {
    const query = `
        CREATE TABLE IF NOT EXISTS adeudo (
            id_adeudo SERIAL PRIMARY KEY,
            concepto VARCHAR(200) NOT NULL,
            proveedor VARCHAR(50) NOT NULL,
            ff DATE NOT NULL,
            num_factura VARCHAR(50) NOT NULL,
            protocolo_entrada VARCHAR(50) NOT NULL,
            importe NUMERIC NOT NULL,
            iva NUMERIC NOT NULL,
            retencion NUMERIC NOT NULL,
            csiniva NUMERIC NOT NULL,
            total NUMERIC NOT NULL,
            total_adeudos NUMERIC NOT NULL,
            anticipo_cliente NUMERIC NOT NULL,
            honorarios NUMERIC NOT NULL,
            adeudo_pendiente NUMERIC NOT NULL,
            empresa_cif VARCHAR(9) NOT NULL,
            FOREIGN KEY (empresa_cif) REFERENCES empresa(cif)
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
