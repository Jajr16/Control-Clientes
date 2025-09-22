import express from "express";
import {
    getClientes,
    getClienteByCif,
    createCliente,
    updateCliente,
    deleteCliente
} from "../controllers/ClienteController.js";

const router = express.Router();

// Obtener todos los clientes
router.get("/", getClientes);

// Obtener un cliente específico por CIF
router.get("/:cif", getClienteByCif);

// Crear un nuevo cliente
router.post("/", createCliente);

// Actualizar un cliente
router.put("/:cif", updateCliente);

// Eliminar un cliente
router.delete("/:cif", deleteCliente);

export default router;