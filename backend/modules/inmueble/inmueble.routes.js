import express from 'express'
import {
    obtenerInmueblesEmpresa,
    crearInmueble,
    actualizarInmueble
} from './inmueble.controller.js'
import { validateSchema } from '../../middleware/validateSchema.js'
import { inmuebleSchema } from '../inmueble/inmueble.schema.js'

const router = express.Router();

router.post('/', validateSchema(inmuebleSchema), crearInmueble)
router.get('/:cif', obtenerInmueblesEmpresa)
router.patch('/:claveCatastral', validateSchema(inmuebleSchema), actualizarInmueble)

export default router;