import express from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import cors from 'cors';
import routes from './routes.js'

import { errorHandler } from './middleware/errorHandler.js';

// Configurar dotenv para acceder a las variables de entorno
dotenv.config();

const app = express();
// Middleware de logging de peticiones
app.use(morgan('dev'));

// Permitir solicitudes desde el frontend
app.use(cors(
    // {
    // origin: 'http://localhost:5173', // Permite el acceso solo desde el frontend
    // methods: 'GET,POST,PUT,DELETE', // Métodos permitidos
    // allowedHeaders: 'Content-Type,Authorization' // Headers permitidos
// }
));

// Middleware para JSON
app.use(express.json());

// Definir las rutas de la API
routes(app);

// Middleware global de errores
app.use(errorHandler);

export default app;