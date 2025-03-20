import { pool } from '../config/db.js'

export const createTableSeguro = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS seguro(
                empresa_seguro NVARCHAR(300) PRIMARY KEY,
                tipo_seguro NVARCHAR(50),
                telefono NVARCHAR(9),
                email NVARCHAR(255),
                poliza NVARCHAR(255)
            );    
        `)
    } catch (error) {
        console.error("Error creando la tabla:", error.message)
    }
}