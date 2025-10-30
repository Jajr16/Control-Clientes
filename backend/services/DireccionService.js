import { BaseService } from "./BaseService.js";
import Repositorio from "../repositories/globalPersistence.js";

export default class DireccionService extends BaseService {
    constructor() {
        super({
            direccion: new Repositorio('direccion', 'id'),
        })
    }

    async crearDireccion(data, client = null) {
        console.log(data)
        const existente = await this.repositories.direccion.BuscarPorFiltros({
            calle: data.calle, 
            numero: data.numero,
            piso: data.piso, 
            codigo_postal: data.cp, 
            localidad: data.localidad
        }, 1, client);
        if (existente.length > 0) throw new Error(`Esa dirección ya había sido registrada anteriormente.`);

        return await this.repositories.direccion.insertar(data, client);
    }
}