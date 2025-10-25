import express from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import cors from 'cors';

// Importar rutas
import empresasRoutes from './routes/empresasRoutes.js';
import direccionRoutes from './routes/direccionRoutes.js';
import propietarioRoutes from './routes/propietarioRoutes.js';
import datoRegistralRoutes from './routes/datoRegistralRoutes.js';
import inmuebleRoutes from './routes/InmuebleRoutes.js'
import clienteRouter from './routes/Clientes/clienteRoutes.js'
import adeudoRoutes from './routes/adeudoRoutes.js';
import liquidacionRoutes from './routes/LiquidacionRoutes.js';
import HomeRoutes from './routes/Home/homeRoutes.js'

import './config/handleErrors.js'; 
import { handleError } from './config/handleErrors.js';

// Configurar dotenv para acceder a las variables de entorno
dotenv.config();

const app = express();
// Middleware de logging de peticiones
app.use(morgan('dev'));

// Permitir solicitudes desde el frontend
app.use(cors({
    origin: 'http://localhost:5173', // Permite el acceso solo desde el frontend
    methods: 'GET,POST,PUT,DELETE', // Métodos permitidos
    allowedHeaders: 'Content-Type,Authorization' // Headers permitidos
}));

// Middleware para JSON
app.use(express.json());

// Definir las rutas de la API
app.use('/api/empresas', empresasRoutes);
app.use('/api/direcciones', direccionRoutes);
app.use('/api/propietario', propietarioRoutes);
app.use('/api/datoRegistral', datoRegistralRoutes);
app.use('/api/inmueble', inmuebleRoutes);
app.use('/api/cliente', clienteRouter);
app.use('/api/adeudos', adeudoRoutes);
app.use('/api/liquidaciones', liquidacionRoutes);
app.use('/api/home', HomeRoutes);

// Middleware global de errores
app.use(async (err, req, res, next) => {
    console.error(err); // log en consola
    await handleError(err); // guarda en txt y manda correo
    res.status(500).json({ message: "Ocurrió un error interno" });
});

export default app;