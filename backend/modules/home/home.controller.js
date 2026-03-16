import { BaseController } from "../../controllers/base.controller.js";
import HomeService from "./home.service.js";

class HomeController extends BaseController {
    constructor() {
        super(new HomeService())
    }

    async obtenerDatosHome(req, res, next) {
        try {
            const result = await this.service.obtenerDatosHome();
            return this.sendSuccess(res, result)
        } catch (error) {
            next(error)
        }
    }
}

const homeController = new HomeController();
export default homeController;

export const obtenerDatosHome = homeController.obtenerDatosHome.bind(homeController)