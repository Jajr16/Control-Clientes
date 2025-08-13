// routes/adeudoRoutes.js - ACTUALIZADO
import express from "express";
import { 
    createAdeudo, 
    getAdeudosByEmpresa,
    getAdeudosPendientesByEmpresa,
    checkAdeudosPendientes,
    getEmpresasAdeudos
} from "../controllers/AdeudoController.js";

const router = express.Router();

// Crear adeudo (siempre se crea como PENDIENTE)
router.post("/", createAdeudo);

// Obtener TODOS los adeudos de una empresa (pendientes + liquidados)
router.get("/empresa/:empresa_cif", getAdeudosByEmpresa);

// Obtener SOLO adeudos PENDIENTES de una empresa
router.get("/empresa/:empresa_cif/pendientes", getAdeudosPendientesByEmpresa);

// Verificar si hay adeudos pendientes para una empresa
router.get("/empresa/:empresa_cif/check-pendientes", checkAdeudosPendientes);

router.get("/empresa_adeudo", getEmpresasAdeudos);

export default router;