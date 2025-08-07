import { pool } from '../config/db.js'

export const createTableHipoteca = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS hipoteca(
                id SERIAL PRIMARY KEY,
                prestamo INTEGER,
                banco_prestamo VARCHAR(255),
                fecha_hipoteca DATE,
                cuota_hipoteca INTEGER
            );
        `)
        console.log("Tabla 'hipoteca' creada")
    } catch (error) {
        console.error("Error creando la tabla: ", error.message)
    }
}