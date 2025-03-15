import express from 'express';
import { agregarCliente, obtenerClientes } from '../models/clienteModel.js';

const router = express.Router();

console.log("clienteRoutes.js se está ejecutando");

// 🔹 Definir rutas ANTES de imprimir el `router.stack`
router.get('/', async (req, res) => {
    console.log("GET / ejecutado");
    try {
        const clientes = await obtenerClientes();
        res.json(clientes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/', async (req, res) => {
    console.log("POST / ejecutado");
    const { nombre, email } = req.body;
    if (!nombre || !email) {
        return res.status(400).json({ error: "Nombre y email son obligatorios" });
    }

    try {
        const cliente = await agregarCliente(nombre, email);
        res.status(201).json(cliente);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 🔹 Debug para confirmar que las rutas están registradas
console.log("Rutas registradas en clienteRoutes al final:");
console.log(router.stack.map(r => r.route?.path));

export default router;
