import { pool } from '../config/db.js'

export const createTableMovimiento = async () => {
    const query = `
        CREATE TABLE IF NOT EXISTS movimiento(
            id_movimiento SERIAL PRIMARY KEY,
            accion VARCHAR(50) NOT NULL, 
            datos JSONB,
            fecha TIMESTAMP DEFAULT NOW()
        );
    `;
    try {
        await pool.query(query);
        console.log('Tabla "Movimiento" creada o ya existente');
    } catch (error) {
        console.error('Error al crear la tabla Movimiento:', error);
        throw error;
    }
}