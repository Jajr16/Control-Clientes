import { BaseService } from "./BaseService.js";
import Repositorio from "../repositories/globalPersistence.js";

export default class DatoRegistralService extends BaseService {
    constructor() {
        super({
            datoRegistral: new Repositorio('dato_registral', 'id_dr')
        })
    }

    async crearDatoRegistral(data, client = null) {
        const existente = await this.repositories.datoRegistral.BuscarPorFiltros({
            num_protocolo: data.num_protocolo,
            folio: data.folio,
            hoja: data.hoja,
            inscripcion: data.inscripcion,
            fecha_inscripcion: data.fecha_inscripcion
        }, 1, client)
        
        if (existente.length > 0) throw new Error(`El dato registral ingresado ya existe`)

        return await this.repositories.datoRegistral.insertar(data, client)
    }
}