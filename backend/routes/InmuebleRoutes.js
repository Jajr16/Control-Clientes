import express from 'express'
import InmuebleController from '../controllers/InmuebleController.js'

const router = express.Router();
const inmuebleController = new InmuebleController();

// Rutas para operaciones CRUD
router.post('/', inmuebleController.insertar.bind(inmuebleController));
router.get('/inmueblesList/:cif', inmuebleController.getInmuebleDetails.bind(inmuebleController));

export default router;