import { BaseService } from "./base.service.js";
import Repositorio from "../repositories/global.repository.js";

export default class MovimientoService extends BaseService {
    constructor() {
        super({
            movimiento: new Repositorio("movimiento", "id")
        });
    }

    async crearMovimiento({ accion, datos }, client = null) {
        return await this.repositories.movimiento.registrarMovimiento({ accion, datos }, client);
    }
}