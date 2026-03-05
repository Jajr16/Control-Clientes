import { BaseService } from "../../services/base.service.js";
import Repositorio from "../../repositories/global.repository.js";
import { ConflictError, NotFoundError } from "../../errors/AppError.js"

class PropietarioService extends BaseService {
    constructor() {
        super({
            propietario: new Repositorio('propietario', 'nie')
        })
    }

    async crearPropietario(data, client = null) {
        const existente = await this.repositories.propietario.ExistePorId({ nie: data.nie }, client);
        if (existente) throw new ConflictError(`El propietario con NIE ${data.nie} ya existe`);

        return await this.repositories.propietario.insertar(data, client);
    }

    async actualizarPropietario(nie, nuevosDatos, client = null) {
    const ejecutar = async (conn) => {
        const propietarioExiste = await this.repositories.propietario.ExistePorId({ nie: nie }, conn);          
        if (!propietarioExiste) {
            throw new NotFoundError('Propietario no encontrado');
        }
        return await this.repositories.propietario.actualizarPorId(
            { nie: nie },
            nuevosDatos,
            conn
        );
    };

    if (client) {
        return await ejecutar(client);
    } else {
        return await this.withTransaction(ejecutar);
    }
}
}

export default PropietarioService