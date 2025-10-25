import { pool } from '../config/db.js'

export const createTableSeguro = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS seguro(
                empresa_seguro VARCHAR(300) PRIMARY KEY,
                tipo_seguro VARCHAR(50),
                telefono VARCHAR(9),
                email VARCHAR(255),
                poliza VARCHAR(255)
            );    
        `)
        console.log("Tabla 'seguro' creada")
    } catch (error) {
        console.error("Error creando la tabla:", error.message)
    }
}