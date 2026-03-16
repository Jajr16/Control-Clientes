import { BaseController } from "../../controllers/base.controller.js";
import AdeudoService from './adeudo.service.js'

class AdeudoController extends BaseController {
    constructor() {
        super(new AdeudoService());
    }

    async createAdeudo(req, res, next) {
        try {
            const result = await this.service.createAdeudo(req.body)
            return this.sendSuccess(res, result, "Adeudo registrado correctamente", 201);
        } catch (error) {
            next(error)
        }
    }
}

const adeudoController = new AdeudoController();
export default adeudoController;

export const createAdeudo = adeudoController.createAdeudo.bind(adeudoController);