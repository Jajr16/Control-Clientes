import app from './app.js'
import { connectDB } from './config/db.js'


const PORT = process.env.PORT

// Conexión a la BD
connectDB()

// Ejecutar servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto: ${PORT}`)
})