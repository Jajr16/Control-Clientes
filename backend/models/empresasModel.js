import { pool } from '../config/db.js'

// Crear tabla si no existe
export const createTableEmpresa = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS empresa (
                cif VARCHAR(9) PRIMARY KEY,
                clave VARCHAR(3),
                nombre VARCHAR(300),
                propietario VARCHAR(9),
                direccion INTEGER REFERENCES direccion(id),
                dato_registral INTEGER REFERENCES dato_registral(id_dr),
                telefono VARCHAR(9),
                FOREIGN KEY (propietario) REFERENCES propietario(nie)
                ON DELETE CASCADE ON UPDATE CASCADE
            );
        `);
        console.log("Tabla 'empresa' creada");
    } catch (error) {
        console.error("Error creando la tabla:", error.message);
    }
};

// Función para insertar una empresa
export const agregarEmpresa = async (cif, clave, nombre, propietario, direccion, dato_registral, telefono) => {
    try {
        const result = await pool.query(
            `INSERT INTO empresa (cif, clave, nombre, propietario, direccion, dato_registral, telefono) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) 
             RETURNING *`,
            [cif, clave, nombre, propietario, direccion, dato_registral, telefono]
        );
        console.log("Empresa agregada:", result.rows[0]);
        return result.rows[0];
    } catch (error) {
        throw new Error("Error al agregar empresa: " + error.message);
    }
};

// Función para obtener empresas
export const obtenerEmpresas = async () => {
    try {
        const result = await pool.query("SELECT * FROM empresa");
        return result.rows;
    } catch (error) {
        throw new Error("Error al obtener clientes: " + error.message);
    }
};
