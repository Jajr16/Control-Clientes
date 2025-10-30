import { pool } from '../config/db.js'

export const createTableEmpresaInmueble = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS empresa_inmueble(
                cif VARCHAR(9),
                clave_catastral VARCHAR(25),
                valor_adquisicion INTEGER,
                fecha_adquisicion DATE,
                PRIMARY KEY (cif, clave_catastral),
                FOREIGN KEY (cif) REFERENCES empresa(cif) 
                ON DELETE CASCADE ON UPDATE CASCADE,
                FOREIGN KEY (clave_catastral) REFERENCES inmueble(clave_catastral) 
                ON DELETE CASCADE ON UPDATE CASCADE
            );
        `)
        console.log("Tabla 'empresa_inmueble' creada")
    } catch (error) {
        console.error("Error creando la tabla:", error.message)
    }
}