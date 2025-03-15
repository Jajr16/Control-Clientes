import pg from 'pg'

const { Pool }= pg

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: 5432
})

export const connectDB = async () => {
    try {
        const client =  await pool.connect(); // Conectar
        console.log("Conexión a la BD establecida")
        client.release() // Cerrar proceso
    } catch (err) {
        console.error("Error al conectar con la base de datos: ", err.message)
    }
}