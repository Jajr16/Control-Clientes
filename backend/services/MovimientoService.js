import { BaseService } from "./BaseService.js";
import Repositorio from "../repositories/globalPersistence.js";

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