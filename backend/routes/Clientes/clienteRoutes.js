import express from 'express'
import {
    createCliente,
    getInfoClientes,
    updateCliente  // ← AGREGAR ESTA IMPORTACIÓN
} from '../../controllers/ClienteController.js';
import { validateSchema } from '../../middleware/validateSchema.js';
import { createSchemaCliente } from '../../schemas/clienteSchema.js';

const router = express.Router();

router.post('/', validateSchema(createSchemaCliente), createCliente);
router.get('/', getInfoClientes);
router.put('/:cif', updateCliente); // ← CAMBIAR ESTA LÍNEA

export default router;