import express from 'express'
import {
    obtenerInmueblesEmpresa,
    crearInmueble,
    actualizarInmueble,
    eliminarInmueble
} from './inmueble.controller.js'
import { validateSchema } from '../../middleware/validateSchema.js'
import { inmuebleSchema } from '../inmueble/inmueble.schema.js'

const router = express.Router();

router.post('/', validateSchema(inmuebleSchema), crearInmueble)
router.get('/:cif', obtenerInmueblesEmpresa)
router.patch('/:claveCatastral', validateSchema(inmuebleSchema), actualizarInmueble)
router.delete('/:claveCatastral', eliminarInmueble)

export default router;