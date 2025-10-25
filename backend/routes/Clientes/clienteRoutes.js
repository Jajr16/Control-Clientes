import express from 'express'
import {
    createCliente,
    getInfoClientes
} from '../../controllers/ClienteController.js';

const router = express.Router();

router.post('/', createCliente)

router.get('/', getInfoClientes);

export default router;