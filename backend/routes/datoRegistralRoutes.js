import express from 'express';
import { agregarDatoRegistral, obtenerDatoRegistral } from '../models/datoRegistralModel.js';

const router = express.Router();

// Definir rutas ANTES de imprimir el `router.stack`
router.get('/', async (req, res) => {
    console.log("GET / ejecutado");
    try {
        const clientes = await obtenerDatoRegistral();
        res.json(clientes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/', async (req, res) => {
    console.log("POST / ejecutado");
    const { num_protocolo, folio, hoja, inscripcion, notario, fecha_inscripcion } = req.body;
    if (!num_protocolo || !folio || !hoja || !inscripcion || !notario || !fecha_inscripcion  ) {
        return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    try {
        const empresa = await agregarDatoRegistral(num_protocolo, folio, hoja, inscripcion, notario, fecha_inscripcion);
        res.status(201).json(empresa);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//Debug para confirmar que las rutas están registradas
// console.log("Rutas registradas en clienteRoutes al final:");
console.log(router.stack.map(r => r.route?.path));

export default router;
