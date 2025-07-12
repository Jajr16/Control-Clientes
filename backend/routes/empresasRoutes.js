import express from 'express';
import { agregarEmpresa, obtenerEmpresas } from '../models/empresasModel.js';

const router = express.Router();

// Definir rutas ANTES de imprimir el `router.stack`
router.get('/', async (req, res) => {
    console.log("GET / ejecutado");
    try {
        const clientes = await obtenerEmpresas();
        res.json(clientes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/adeudos', async (req, res) => {
    console.log("GET / ejecutado");
    try {
        const clientes = await obtenerEmpresasAdeudos();
        res.json(clientes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/', async (req, res) => {
    console.log("POST / ejecutado");

    const { empresa, direccion, propietario, datoRegistral } = req.body;

    if (!empresa || !direccion || !propietario || !datoRegistral) {
        return res.status(400).json({ error: "Faltan bloques de datos (empresa, direccion, etc.)" });
    }

    try {
        const nuevaEmpresa = await agregarEmpresa({ empresa, direccion, propietario, datoRegistral });
        res.status(201).json(nuevaEmpresa);
    } catch (error) {
        console.error("Error al agregar empresa:", error.message);
        res.status(400).json({ error: error.message });
    }
});


//Debug para confirmar que las rutas están registradas
// console.log("Rutas registradas en clienteRoutes al final:");
console.log(router.stack.map(r => r.route?.path));

export default router;
