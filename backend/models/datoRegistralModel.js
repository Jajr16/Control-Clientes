import { pool } from '../config/db.js'

// Crear tabla si no existe
export const createTableDatoRegistral = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS dato_registral (
                id_dr SERIAL PRIMARY KEY,
                num_protocolo INTEGER,
                folio INTEGER,
                hoja INTEGER,
                inscripcion INTEGER,
                notario VARCHAR(500),
                fecha_inscripcion DATE
            );
        `);
        console.log("Tabla 'datoRegistral' creada");
    } catch (error) {
        console.error("Error creando la tabla:", error.message);
    }
};

export const agregarDatoRegistral = async (num_protocolo, folio, hoja, inscripcion, notario, fecha_inscripcion) => {
    try {
        const result = await pool.query(
            `INSERT INTO dato_registral (num_protocolo, folio, hoja, inscripcion, notario, fecha_inscripcion) 
            VALUES ($1, $2, $3, $4, $5, $6) 
             RETURNING *`,
            [num_protocolo, folio, hoja, inscripcion, notario, fecha_inscripcion]
        );
        console.log("Propietario agregada:", result.rows[0]);
        return result.rows[0];
    } catch (error) {
        throw new Error("Error al agregar datosRegistrales: " + error.message);
    }
};

export const obtenerDatoRegistral = async () => {
    try {
        const result = await pool.query("SELECT * FROM dato_registral");
        return result.rows;
    } catch (error) {
        throw new Error("Error al obtener datosRegistrales: " + error.message);
    }
};
