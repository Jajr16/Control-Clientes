import express from 'express';
import empresasRoutes from './routes/empresasRoutes.js';
import direccionRoutes from './routes/direccionRoutes.js';
import propietarioRoutes from './routes/propietarioRoutes.js';
import datoRegistralRoutes from './routes/datoRegistralRoutes.js';
import { connectDB } from './config/db.js';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

//Permitir solicitudes desde el frontend
app.use(cors({
    origin: 'http://localhost:5173', // Permite el acceso solo desde el frontend
    methods: 'GET,POST,PUT,DELETE', // Métodos permitidos
    allowedHeaders: 'Content-Type,Authorization' // Headers permitidos
}));

// Middleware para JSON
app.use(express.json());

// Conectar a la BD antes de iniciar el servidor
const iniciarServidor = async () => {
    try {
        await connectDB(); // Esperar conexión antes de continuar

        // Usar rutas de clientes correctamente
        console.log("Middleware de /api/clientes se está ejecutando");
        app.use('/api/empresas', empresasRoutes);
        app.use('/api/direcciones', direccionRoutes);
        app.use('/api/propietario', propietarioRoutes);
        app.use('/api/datoRegistral', datoRegistralRoutes);

        // Iniciar servidor solo si la BD se conectó
        app.listen(PORT, () => {
            console.log(`Servidor corriendo en http://localhost:${PORT}`);
        });
        
    } catch (error) {
        console.error("Error al iniciar el servidor:", error);
        process.exit(1); // Detiene la ejecución en caso de fallo
    }
};

// Llamar función para iniciar el servidor
iniciarServidor();
