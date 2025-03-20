import { pool } from '../config/db.js'

export const createTableInmuebleProveedor = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS inmueble_proveedor(
                clave_catastral NVARCHAR(25),
                clave NVARCHAT(30),
                PRIMARY KEY (clave_catastral, clave),
                FOREIGN KEY (clave_catastral) REFERENCES inmueble(clave_catastral),
                FOREIGN KEY (clave) REFERENCES proveedor(clave)
            );    
        `)
    } catch (error) {
        console.error("Error creando la tabla:", error.message)
    }
}