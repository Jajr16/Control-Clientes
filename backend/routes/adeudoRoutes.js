// routes/adeudoRoutes.js - ACTUALIZADO
import express from "express";
import { 
    createAdeudo, 
    getAdeudosByEmpresa,
    getAdeudosPendientesByEmpresa,
    checkAdeudosPendientes,
    getEmpresasAdeudos,
    updateAdeudos,
    deleteAdeudos,
    createRecord,
} from "../controllers/AdeudoController.js";

const router = express.Router();

// Crear adeudo (siempre se crea como PENDIENTE)
router.post("/", createAdeudo);

/** 
 *  Obtener adeudos de una empresa
 * Query params:
 * incluir_liquidados = 'true' | 'false'   (default: true)
 * agrupado = 'true' | 'false'             (default: false)
 **/
router.get("/empresa/:empresa_cif", getAdeudosByEmpresa);

// Obtener SOLO adeudos PENDIENTES de una empresa
router.get("/empresa/:empresa_cif/pendientes", getAdeudosPendientesByEmpresa);

// Verificar si hay adeudos pendientes para una empresa
router.get("/empresa/:empresa_cif/check-pendientes", checkAdeudosPendientes);

// Obtener un listado de las empresas
router.get("/empresa_adeudo", getEmpresasAdeudos);

// Actualizar adeudos
router.post('/update', updateAdeudos);

// Eliminar adeudos
router.post('/delete', deleteAdeudos);

router.get('/historial/:empresa_cif', createRecord)

export default router;