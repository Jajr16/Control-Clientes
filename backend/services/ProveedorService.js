import { BaseService } from "./BaseService.js";
import Repositorio from "../repositories/globalPersistence.js";

export default class ProveedorService extends BaseService {
    constructor () {
        super({
            proveedor: new Repositorio('proveedor', 'clave'),
            inmuebleProveedor: new Repositorio('inmueble_proveedor', ['clave_catastral', 'clave'])
        })
    }

    async crearProveedor(data, client = null) {
        const existente = await this.repositories.proveedor.ExistePorId({ clave: data.clave }, client);
        if (existente) throw new Error(`El proveedor con clave ${data.clave} ya existe`);

        return await this.repositories.proveedor.insertar(data, client);
    }

    async vincularProveedorAInmueble(proveedor, claveCatastral, client) {
        let existente = await this.repositories.proveedor.ExistePorId({ clave: proveedor.clave }, client);
        
        if (!existente) {
            existente = await this.repositories.proveedor.insertar(proveedor, client);
        }

        const relacion = {
            clave_catastral: claveCatastral,
            clave: proveedor.clave
        };

        await this.repositories.inmuebleProveedor.insertar(relacion, client);

        return { success: true, message: `Proveedor vinculado a ${claveCatastral}` };
    }
}