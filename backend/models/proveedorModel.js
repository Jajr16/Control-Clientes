import { pool } from '../config/db.js'

export const createTableProveedor = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS proveedor (
                clave NVARCHAT(30) PRIMARY KEY,
                nombre NVARCHAR(255),
                telefono NVARCHAR(10),
                email NVARCHAR(255),
                tipo_servicio NVARCHAR(50)
            );
        `)
        console.log("Table proveedor creada")
    } catch (error) {
        console.error("Error creando la tabla:", error.message)
    }
}