import { BaseService } from "../../../services/base.service.js";
import Repositorio from "../../../repositories/global.repository.js";
import { ConflictError, NotFoundError } from "../../../errors/AppError.js"

export default class DatoRegistralService extends BaseService {
    constructor() {
        super({
            datoRegistral: new Repositorio('dato_registral', 'id_dr'),
        })
    }

    async crearDatoRegistral(data, client = null) {
        return this.execWithClient(async (conn) => {
            await this.validarExistencia('datoRegistral', {
                num_protocolo: data.num_protocolo,
                folio: data.folio,
                hoja: data.hoja,
                inscripcion: data.inscripcion,
                fecha_inscripcion: data.fecha_inscripcion
            }, conn);

            return await this.crearAuto('datoRegistral', data, conn);
        }, client);
    }

    async actualizarDatoRegistral(data, client = null) {
        return this.execWithClient(async (conn) => {
            return await this.actualizar('datoRegistral', { id_dr: data.id_dr }, data, conn)
        }, client)
    }

    async upsertDatoRegistral(data, client = null) {
        return this.execWithClient(async (conn) => {
            if (data.id_dr) return await this.actualizarDatoRegistral(data, conn);

            return await this.crearDatoRegistral(data, conn);
        }, client)
    }

}