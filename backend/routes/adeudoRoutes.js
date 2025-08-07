import express from "express";
import { createAdeudo, getAdeudosByEmpresa } from "../controllers/AdeudoController.js";

const router = express.Router();

router.post("/", createAdeudo);
router.get("/empresa/:empresa_cif", getAdeudosByEmpresa);

export default router;

