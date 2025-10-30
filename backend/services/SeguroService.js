import { BaseService } from "./BaseService.js";
import Repositorio from "../repositories/globalPersistence.js";

export default class SeguroService extends BaseService {
    constructor() {
        super({
            seguro: new Repositorio('seguro', 'poliza'),
            inmuebleSeguro: new Repositorio('inmueble_seguro', ['clave_catastral', 'poliza'])
        })
    }

    async vincularSeguroAInmueble(seguro, claveCatastral, client) {
        let existente = await this.repositories.seguro.ExistePorId({ poliza: seguro.poliza }, client);
        
        if (!existente) {
            existente = await this.repositories.seguro.insertar(seguro, client);
        }

        const relacion = {
            clave_catastral: claveCatastral,
            poliza: seguro.poliza
        };

        await this.repositories.inmuebleSeguro.insertar(relacion, client);

        return { success: true, message: `Seguro vinculado a ${claveCatastral}` };
    }
}