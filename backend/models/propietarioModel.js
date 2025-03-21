import { pool } from '../config/db.js'

// Crear tabla si no existe
export const createTablePropietario = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS propietario (
                nie VARCHAR(9) PRIMARY KEY,
                nombre VARCHAR(255),
                apellido_p VARCHAR(255),
                apellido_m VARCHAR(255),
                email VARCHAR(255),
                telefono VARCHAR(9)
            );
        `);
        console.log("Tabla 'Propietario' creada");
    } catch (error) {
        console.error("Error creando la tabla:", error.message);
    }
};

export const agregarPropietario = async (nie, nombre, apellido_p, apellido_m, email, telefono) => {
    try {
        const result = await pool.query(
            `INSERT INTO propietario (nie, nombre, apellido_p, apellido_m, email, telefono) 
             VALUES ($1, $2, $3, $4, $5, $6) 
             RETURNING *`,
            [nie, nombre, apellido_p, apellido_m, email, telefono]
        );
        console.log("Propietario agregada:", result.rows[0]);
        return result.rows[0];
    } catch (error) {
        throw new Error("Error al agregar Propietario: " + error.message);
    }
};

export const obtenerPropietario = async () => {
    try {
        const result = await pool.query("SELECT * FROM propietario");
        return result.rows;
    } catch (error) {
        throw new Error("Error al obtener propietarios: " + error.message);
    }
};
