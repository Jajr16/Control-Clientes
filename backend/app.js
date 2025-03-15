import express from 'express' // Express para el servidor 
import dotenv from 'dotenv' // Dependencia para variables globales en archivo .env
import morgan from 'morgan' // Dependencia para visualizar por consola las peticiones que llegan

dotenv.config() // Configurar dotenv

const app = express()

app.use(morgan('dev'))

export default app