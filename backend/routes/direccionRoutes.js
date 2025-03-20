import express from 'express';
import { agregarDireccion, obtenerDirecciones } from '../models/direccionModel.js';

const router = express.Router();

// Definir rutas ANTES de imprimir el `router.stack`
router.get('/', async (req, res) => {
    console.log("GET / ejecutado");
    try {
        const clientes = await obtenerDirecciones();
        res.json(clientes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/', async (req, res) => {
    console.log("POST / ejecutado");
    const { calle, numero, piso, codigo_postal, localidad } = req.body;
    if (!calle || !numero || !piso || !codigo_postal || !localidad  ) {
        return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    try {
        const empresa = await agregarDireccion(calle, numero, piso, codigo_postal, localidad);
        res.status(201).json(empresa);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//Debug para confirmar que las rutas están registradas
// console.log("Rutas registradas en clienteRoutes al final:");
console.log(router.stack.map(r => r.route?.path));

export default router;
