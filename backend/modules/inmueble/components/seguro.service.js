import { BaseService } from "../../../services/base.service.js";
import Repositorio from "../../../repositories/global.repository.js";
import { AppError } from "../../../errors/AppError.js";

export default class SeguroService extends BaseService {
    constructor() {
        super({
            seguro: new Repositorio('seguro', 'poliza')
        })
    }

    async crearSeguro(data, client = null) {
        return await this.execWithClient(async (conn) => {
            return await this.crear('seguro', { poliza: data.poliza }, data, conn)
        }, client)
    }

    async actualizarSeguro(poliza, clave, data, client = null) {
        return this.execWithClient(async (conn) => {

            const existente = await this.repositories.seguro.ObtenerPorId({ poliza }, conn);

            if (!existente) throw new NotFoundError("Seguro no existe");
            if (existente.clave_catastral !== clave)
                throw new AppError("Este seguro no pertenece al inmueble", 409);

            return await this.actualizar('seguro', { poliza }, data, conn);
        }, client);
    }

    async upsertSeguro(data, client = null) {
        return await this.execWithClient(async (conn) => {
            if (data.original) return await this.actualizarSeguro(data.original.poliza, data.data, conn);

            return await this.crearSeguro(data.data, conn);
        }, client)
    }
}