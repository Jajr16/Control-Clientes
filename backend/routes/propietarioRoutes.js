import express from 'express';
import { agregarPropietario,  obtenerPropietario } from '../models/propietarioModel.js';

const router = express.Router();

// Definir rutas ANTES de imprimir el `router.stack`
router.get('/', async (req, res) => {
    console.log("GET / ejecutado");
    try {
        const clientes = await obtenerPropietario();
        res.json(clientes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/', async (req, res) => {
    console.log("POST / ejecutado");
    const { nie, nombre, email, telefono } = req.body;
    if (!nie || !nombre || !email || !telefono  ) {
        return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    try {
        const empresa = await agregarPropietario(nie, nombre, email, telefono);
        res.status(201).json(empresa);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//Debug para confirmar que las rutas están registradas
// console.log("Rutas registradas en clienteRoutes al final:");
console.log(router.stack.map(r => r.route?.path));

export default router;
