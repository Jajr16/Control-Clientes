import { pool } from '../config/db.js'

// CREAR TABLA SI NO EXISTE
export const createTableInmueble = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS inmueble (
                clave_catastral NVARCHAR(25) PRIMARY KEY,
                direccion INTEGER REFERENCES direccion(id),
                dato_registral INTEGER REFERENCES dato_registral(id_dr)
            );
        `)
            console.log("Tabla inmueble creada")
    } catch (error) {
        console.error("Error creando la tabla:", error.message);
    }
}