import express from "express";
import liquidacionController from "../controllers/LiquidacionController.js";

const router = express.Router();

// POST /api/liquidaciones - Crear nueva liquidación
router.post("/", liquidacionController.createLiquidacion.bind(liquidacionController));

// GET /api/liquidaciones/empresa/:empresa_cif - Obtener liquidaciones por empresa
router.get("/empresa/:empresa_cif", liquidacionController.getLiquidacionesByEmpresa.bind(liquidacionController));

// GET /api/liquidaciones/:empresa_cif/:num_liquidacion - Obtener detalles de una liquidación específica
router.get("/:empresa_cif/:num_liquidacion", liquidacionController.getDetallesLiquidacion.bind(liquidacionController));

export default router;