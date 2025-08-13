import express from "express";
import clienteController from "../controllers/ClienteController.js";

const router = express.Router();

// Rutas para operaciones CRUD
router.get('/', (req, res) => clienteController.infoClientes(req, res));

export default router;