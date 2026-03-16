import { BaseService } from "../../services/base.service.js";
import Repositorio from "../../repositories/global.repository.js";

class AdeudoService extends BaseService {
    constructor() { 
        super({
            adeudo: new Repositorio('adeudo', ['num_factura', "empresa_cif"])
        })
    }

    async createAdeudo(data) {
        console.log(data)
        
        return await this.withTransaction(async (conn) => {
            // const adeudo_creado = await this.repositories.adeudo.insertar(data, conn);

            
        })
    }    
}

export default AdeudoService;