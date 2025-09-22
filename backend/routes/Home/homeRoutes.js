// routes/adeudoRoutes.js - ACTUALIZADO
import express from "express";
import homeController from "../../controllers/HomeController.js";

const router = express.Router();

// Crear adeudo (siempre se crea como PENDIENTE)
router.get("/", homeController.obtenerDatosHome.bind(homeController));


export default router;