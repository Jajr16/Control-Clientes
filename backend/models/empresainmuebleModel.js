import { pool } from '../config/db.js'

export const createTableEmpresaInmueble = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS empresa_inmueble(
                cif NVARCHAR(9),
                clave_catastral NVARCHAR(25),
                valor_adquisicion INTEGER,
                fecha_adquisicion DATE,
                PRIMARY KEY (cif, clave_catastral),
                FOREIGN KEY (cif) REFERENCES empresa(cif),
                FOREIGN KEY (clave_catastral) REFERENCES inmueble(clave_catastral)
            );
        `)
    } catch (error) {
        console.error("Error creando la tabla:", error.message)
    }
}