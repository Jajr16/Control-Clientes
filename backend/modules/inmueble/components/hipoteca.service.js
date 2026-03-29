import { BaseService } from "../../../services/base.service.js";
import Repositorio from "../../../repositories/global.repository.js";

export default class HipotecaService extends BaseService {
    constructor() {
        super({
            hipoteca: new Repositorio("hipoteca", "clave_catastral"),
        })
    }

    async crearHipoteca(data, client = null) {
        return await this.crear('hipoteca', { clave_catastral: data.clave_catastral }, data, client);
    }

    async actualizarHipoteca(clave_catastral, data, client = null) {
        return await this.execWithClient(async (conn) => {
            return await this.actualizar('hipoteca', { clave_catastral }, data, conn);
        }, client);
    }

    async upsertHipoteca(data, clave_catastral, client = null) {
        return await this.execWithClient(async (conn) => {
            if (clave_catastral) return await this.actualizarHipoteca(clave_catastral, data, conn);

            return await this.crearHipoteca(data, conn);
        }, client)
    }
}