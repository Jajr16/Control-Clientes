import express from "express";
import { 
    createLiquidacion, 
    getLiquidacionesByEmpresa, 
    getDetallesLiquidacion 
} from "../controllers/LiquidacionController.js";

const router = express.Router();

// POST /api/liquidaciones - Crear nueva liquidación
router.post("/", createLiquidacion);

// GET /api/liquidaciones/empresa/:empresa_cif - Obtener liquidaciones por empresa
router.get("/empresa/:empresa_cif", getLiquidacionesByEmpresa);

// GET /api/liquidaciones/:empresa_cif/:num_liquidacion - Obtener detalles de una liquidación específica
router.get("/:empresa_cif/:num_liquidacion", getDetallesLiquidacion);

export default router;