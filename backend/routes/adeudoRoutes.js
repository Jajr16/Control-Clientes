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

  // 👇 nuevos handlers
  crearEntradaRmmPendiente,
  getEntradaRmm,
  finalizarRmm,
} from "../controllers/AdeudoController.js";

const router = express.Router();

// Crear adeudo NORMAL (PK exige num_factura)
router.post("/", createAdeudo);

// 🔵 Crear entrada RMM PENDIENTE (sin factura todavía)
router.post("/rmm/entrada", crearEntradaRmmPendiente);

// 🟢 Finalizar RMM (crear adeudo y enlazar entrada_rmm.num_factura_final)
router.post("/rmm/finalizar", finalizarRmm);

// 🔎 Obtener una entrada RMM por empresa_cif + num_entrada
router.get("/rmm/entrada/:empresa_cif/:num_entrada", getEntradaRmm);

// (Opcional) Alias para llamadas antiguas
router.get("/rm-entrada/:empresa_cif/:num_entrada", getEntradaRmm);

/** 
 * Obtener adeudos de una empresa
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

// Export de Excel del histórico
router.get('/historial/:empresa_cif', createRecord);

export default router;
