import { pool } from '../config/db.js'

export const createTableInmuebleSeguro = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS inmueble_seguro(
                clave_catastral NVARCHAR(25),
                empresa_seguro NVARCHAR(300),
                PRIMARY KEY (clave_catastral, empresa_seguro),
                FOREIGN KEY (clave_catastral) REFERENCES inmueble(clave_catastral),
                FOREIGN KEY (empresa_seguro) REFERENCES seguro(empresa_seguro)
            );
        `)
    } catch (error) {
        console.error("Error creando la tabla:", error.message)
    }
}