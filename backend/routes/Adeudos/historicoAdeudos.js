import express from "express";
import ClienteController from "../controllers/ClienteController.js";

const router = express.Router();
const clienteController = new ClienteController();

// Rutas para operaciones CRUD
router.get('/', (req, res) => clienteController.infoClientes(req, res));

export default router;