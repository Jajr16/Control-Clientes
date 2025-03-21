import { pool } from '../config/db.js'

export const createTableProveedor = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS proveedor (
                clave VARCHAR(30) PRIMARY KEY,
                nombre VARCHAR(255),
                telefono VARCHAR(10),
                email VARCHAR(255),
                tipo_servicio VARCHAR(50)
            );
        `)
        console.log("Table 'proveedor' creada")
    } catch (error) {
        console.error("Error creando la tabla:", error.message)
    }
}