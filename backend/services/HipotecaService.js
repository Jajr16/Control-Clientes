import { BaseService } from "./BaseService.js";
import Repositorio from "../repositories/globalPersistence.js";

export default class HipotecaService extends BaseService {
    constructor() {
        super({
            hipoteca: new Repositorio("hipoteca", "id"),
            inmuebleHipoteca: new Repositorio("inmueble_hipoteca", ['clave_catastral', 'id_hipoteca'])
        })
    }

    async crearHipoteca(data, client = null) {
        return await this.repositories.hipoteca.insertar(data, client);
    }

    async vincularHipotecaAInmueble(hipoteca, claveCatastral, client) {
        const nuevaHipoteca = await this.repositories.hipoteca.insertar(hipoteca, client);

        const relacion = {
            clave_catastral: claveCatastral,
            id_hipoteca: nuevaHipoteca.id
        };

        await this.repositories.inmuebleHipoteca.insertar(relacion, client);

        return { success: true, message: `Hipoteca vinculada a ${claveCatastral}` };
    }
}