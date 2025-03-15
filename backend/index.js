import express from 'express';
import clienteRoutes from './routes/clienteRoutes.js'; // ✅ Importación correcta
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
        app.use('/api/clientes', clienteRoutes);


        // Ruta de prueba
        app.get('/test', (req, res) => {
            res.send("Ruta de prueba funcionando");
        });

        // Mostrar rutas registradas (Debug)
        setTimeout(() => {
            console.log("\Rutas registradas en Express:");
            app._router.stack.forEach((r) => {
                if (r.route && r.route.path) {
                    console.log(`Ruta: ${r.route.path} - Métodos: ${Object.keys(r.route.methods).join(", ")}`);
                } else if (r.name === 'router') {
                    r.handle.stack.forEach((nested) => {
                        if (nested.route) {
                            console.log(`Ruta (anidada): /api/clientes${nested.route.path} - Métodos: ${Object.keys(nested.route.methods).join(", ")}`);
                        }
                    });
                }
            });
        }, 1000);
        

        // Iniciar servidor solo si la BD se conectó
        app.listen(PORT, () => {
            console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
        });
        
    } catch (error) {
        console.error("❌ Error al iniciar el servidor:", error);
        process.exit(1); // 🔴 Detiene la ejecución en caso de fallo
    }
};

// Llamar función para iniciar el servidor
iniciarServidor();
