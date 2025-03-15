import { pool } from '../config/db.js'

// Crear tabla si no existe
export const createTable = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS clientes (
                id SERIAL PRIMARY KEY,
                nombre VARCHAR(100) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL
            );
        `);
        console.log("Tabla 'clientes' creada");
    } catch (error) {
        console.error("Error creando la tabla:", error.message);
    }
};

// Función para insertar un cliente
export const agregarCliente = async (nombre, email) => {
    try {
        const result = await pool.query(
            "INSERT INTO clientes (nombre, email) VALUES ($1, $2) RETURNING *",
            [nombre, email]
        );
        return result.rows[0];
    } catch (error) {
        throw new Error("Error al agregar cliente: " + error.message);
    }
};

// Función para obtener clientes
export const obtenerClientes = async () => {
    try {
        const result = await pool.query("SELECT * FROM clientes");
        return result.rows;
    } catch (error) {
        throw new Error("Error al obtener clientes: " + error.message);
    }
};
