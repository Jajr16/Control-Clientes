import express from 'express'
import InmuebleController from '../controllers/InmuebleController.js'

const router = express.Router();
const inmuebleController = new InmuebleController();

// Rutas para operaciones CRUD
router.post('/', inmuebleController.insertar.bind(inmuebleController));
router.post('/componentes/', inmuebleController.agregarComponentes.bind(inmuebleController));
router.get('/inmueblesList/:cif', inmuebleController.getInmuebleDetails.bind(inmuebleController));
router.get('/inmueblesProveedoresSeguros/:cc', inmuebleController.getProveedoresSegurosDetails.bind(inmuebleController));
router.get('/hipotecas/:cc', inmuebleController.getHipotecas.bind(inmuebleController));

// Rutas para actualizar datos
router.put('/:claveCatastral', inmuebleController.updateInmueble.bind(inmuebleController)); 
router.put('/seguro/:cc/:empresaSeguro', inmuebleController.updateSeguro.bind(inmuebleController));
router.put('/hipoteca/:cc/:idHipoteca', inmuebleController.updateHipoteca.bind(inmuebleController));
router.put('/proveedor/:cc/:nombre', inmuebleController.updateProveedor.bind(inmuebleController));  
router.put('/datosRegistrales/:cc', inmuebleController.updateDatosRegistrales.bind(inmuebleController));

// Rutas para eliminar datos
router.delete('/:claveCatastral', inmuebleController.deleteInmueble.bind(inmuebleController));
router.delete('/seguro/:cc/:empresaSeguro', inmuebleController.deleteSeguro.bind(inmuebleController));
router.delete('/proveedor/:cc/:nombre', inmuebleController.deleteProveedor.bind(inmuebleController));
router.delete('/hipoteca/:cc/:idHipoteca', inmuebleController.deleteHipoteca.bind(inmuebleController));

export default router;