import express from "express";
import AdeudoController from "../controllers/AdeudoController.js";

const router = express.Router();

router.get("/", AdeudoController.getAdeudos);
router.post("/", AdeudoController.createAdeudo);

export default router;
