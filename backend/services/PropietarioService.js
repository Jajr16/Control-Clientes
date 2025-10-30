import { BaseService } from "./BaseService.js";
import Repositorio from "../repositories/globalPersistence.js";

class PropietarioService extends BaseService {
    constructor() {
        super({
            propietario: new Repositorio('propietario', 'nie')
        })
    }

    async crearPropietario(data, client = null) {
        const existente = await this.repositories.propietario.ExistePorId({ nie: data.nie }, client);
        if (existente) throw new Error(`El propietario con NIE ${data.nie} ya existe`);

        return await this.repositories.propietario.insertar(data, client);
    }
}

export default PropietarioService