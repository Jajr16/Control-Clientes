import express from 'express'
import {
    createCliente,
    getInfoClientes,
    updateCliente 
} from './cliente.controller.js';
import { validateSchema } from '../../middleware/validateSchema.js';
import { createSchemaCliente } from './cliente.schema.js';

const router = express.Router();

router.post('/', validateSchema(createSchemaCliente), createCliente);
router.get('/', getInfoClientes);
router.put('/:cif', updateCliente);

export default router;