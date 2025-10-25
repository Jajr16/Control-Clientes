import { pool } from '../config/db.js'

export const createTableInmuebleHipoteca = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS inmueble_hipoteca(
                clave_catastral VARCHAR(25),
                id_hipoteca INTEGER, 
                PRIMARY KEY (clave_catastral, id_hipoteca),
                FOREIGN KEY (clave_catastral) REFERENCES inmueble(clave_catastral)
                ON DELETE CASCADE ON UPDATE CASCADE,
                FOREIGN KEY (id_hipoteca) REFERENCES hipoteca(id) 
                ON DELETE CASCADE ON UPDATE CASCADE
            );    
        `)
        console.log("Tabla 'inmueble_hipoteca' creada")
    } catch (error) {
        console.error("Error creando la tabla: ", error.message)
    }
}