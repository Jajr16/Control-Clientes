import { pool } from '../config/db.js'

export const createTableInmuebleSeguro = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS inmueble_seguro(
                clave_catastral VARCHAR(25),
                poliza VARCHAR(255),
                PRIMARY KEY (clave_catastral, poliza),
                FOREIGN KEY (clave_catastral) REFERENCES inmueble(clave_catastral)
                ON DELETE CASCADE ON UPDATE CASCADE,
                FOREIGN KEY (poliza) REFERENCES seguro(poliza)
                ON DELETE CASCADE ON UPDATE CASCADE
            );
        `)
        console.log("Tabla 'inmueble_seguro' creada")
    } catch (error) {
        console.error("Error creando la tabla:", error.message)
    }
}