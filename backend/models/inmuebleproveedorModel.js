import { pool } from '../config/db.js'

export const createTableInmuebleProveedor = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS inmueble_proveedor(
                clave_catastral VARCHAR(25),
                clave VARCHAR(30),
                PRIMARY KEY (clave_catastral, clave),
                FOREIGN KEY (clave_catastral) REFERENCES inmueble(clave_catastral)
                ON DELETE CASCADE ON UPDATE CASCADE,
                FOREIGN KEY (clave) REFERENCES proveedor(clave)
                ON DELETE CASCADE ON UPDATE CASCADE
            );    
        `)
        console.log("Tabla 'inmueble_proveedor' creada")
    } catch (error) {
        console.error("Error creando la tabla:", error.message)
    }
}