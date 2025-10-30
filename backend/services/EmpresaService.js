import { BaseService } from "./BaseService.js";
import Repositorio from "../repositories/globalPersistence.js";

export default class EmpresaService extends BaseService {
    constructor() {
        super({
            empresa: new Repositorio("empresa", "cif"),
        })
    }

    async crearEmpresa(data, client = null) {
        const existente = await this.repositories.empresa.ExistePorId({ cif: data.cif }, client);
        if (existente) throw new Error(`La empresa con CIF ${data.cif} ya existe`);

        return await this.repositories.empresa.insertar(data, client);
    }
}