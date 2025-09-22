import express from "express";
import {
    getClientes,
    getClienteByCif,
    createCliente,
    updateCliente,
    deleteCliente
} from "../controllers/ClienteController.js";

const router = express.Router();

// Obtener todos los clientes (con toda su información relacionada)
router.get("/", getClientes);

// Obtener un cliente específico por CIF (con toda su información)
router.get("/:cif", getClienteByCif);

// Crear un nuevo cliente completo (empresa + propietario + dirección + dato registral)
router.post("/", createCliente);

// Actualizar un cliente completo
router.put("/:cif", updateCliente);

// Eliminar un cliente (con eliminación en cascada de sus relaciones)
router.delete("/:cif", deleteCliente);

export default router;