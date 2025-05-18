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
                telefono VARCHAR(10)
            );
        `);
        console.log("Tabla 'Propietario' creada");
    } catch (error) {
        console.error("Error creando la tabla:", error.message);
    }
};

export const agregarPropietario = async (nie, nombre, apellido_p, apellido_m, email, telefono) => {
    try {
        // Validaciones de longitud
        if (nie.length > 9) throw new Error("El campo 'nie' no puede tener más de 9 caracteres.");
        if (telefono.length > 11) throw new Error("El campo 'telefono' no puede tener más de 10s caracteres.");

        // Validación de unicidad del NIE
        const existe = await pool.query("SELECT nie FROM propietario WHERE nie = $1", [nie]);
        if (existe.rows.length > 0) {
            throw new Error(`Ya existe un propietario con el NIE: ${nie}`);
        }

        const result = await pool.query(
            `INSERT INTO propietario (nie, nombre, apellido_p, apellido_m, email, telefono) 
             VALUES ($1, $2, $3, $4, $5, $6) 
             RETURNING *`,
            [nie, nombre, apellido_p, apellido_m, email, telefono]
        );

        console.log("Propietario agregado:", result.rows[0]);
        return result.rows[0];
    } catch (error) {
        throw new Error("Error al agregar propietario: " + error.message);
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
