import { pool } from '../config/db.js'

export const createTableMovimiento = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS movimiento(
                id_movimiento SERIAL PRIMARY KEY,
                accion VARCHAR(50) NOT NULL, 
                datos JSONB,
                fecha TIMESTAMP DEFAULT NOW()
            );
        `);
        console.log("Tabla 'Movimiento' creada")
    } catch (error) {
        console.error("Error creando la tabla 'Movimiento': ", error)
    }
}