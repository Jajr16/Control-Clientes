import { pool } from '../config/db.js'

// Crear tabla si no existe
export const createTableDireccion = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS direccion (
                id SERIAL PRIMARY KEY,
                calle VARCHAR(300),
                numero INTEGER,
                piso VARCHAR(50),
                codigo_postal INTEGER,
                localidad VARCHAR(300)
            );
        `);
        console.log("Tabla 'Direccion' creada");
    } catch (error) {
        console.error("Error creando la tabla:", error.message);
    }
};

export const agregarDireccion = async (calle, numero, piso, codigo_postal, localidad) => {
    try {
        const result = await pool.query(
            `INSERT INTO direccion (calle, numero, piso, codigo_postal, localidad) 
             VALUES ($1, $2, $3, $4, $5) 
             RETURNING *`,
            [calle, numero, piso, codigo_postal, localidad]
        );
        console.log("Direccion agregada:", result.rows[0]);
        return result.rows[0];
    } catch (error) {
        throw new Error("Error al agregar Direccion: " + error.message);
    }
};

export const obtenerDirecciones = async () => {
    try {
        const result = await pool.query("SELECT * FROM direccion");
        return result.rows;
    } catch (error) {
        throw new Error("Error al obtener direcciones: " + error.message);
    }
};
