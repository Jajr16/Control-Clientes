import { BaseController } from "./BaseController.js";
import HomeService from "../services/HomeService.js";

class HomeController extends BaseController {
    constructor() {
        super(new HomeService())
    }

    async obtenerDatosHome(req, res) {
        try {
            const result = await this.service.obtenerDatosHome();
            return this.sendSuccess(res, result)
        } catch (error) {
            return this.handleError(error, res, "Error al obtener datos del home");
        }
    }
}

const homeController = new HomeController();
export default homeController;