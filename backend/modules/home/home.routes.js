import express from 'express'
import { obtenerDatosHome } from './home.controller.js'

const router = express.Router();

router.get('/', obtenerDatosHome)

export default router;