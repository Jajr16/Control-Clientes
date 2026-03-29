import { BaseService } from "../../../services/base.service.js";
import Repositorio from "../../../repositories/global.repository.js";
import { QueryBuilder } from "../../../utils/queryBuilder.js";
import { AppError, ConflictError, NotFoundError } from "../../../errors/AppError.js";

export default class ProveedorService extends BaseService {
    constructor() {
        super({
            proveedor: new Repositorio('proveedor', 'id_proveedor'),
            inmuebleProveedor: new Repositorio('inmueble_proveedor', ['clave_catastral', 'id_proveedor'])
        })
    }

    async _buscarProveedor(data, select = '*', client = null) {
        console.log(data)
        const qb = new QueryBuilder('proveedor')
        const { query, params } = qb.select(select)
            .where('nombre', data.nombre)
            .where('tipo_servicio', data.tipo_servicio)
            .build()

        const resultados = await this.consultar('proveedor', query, params, client);
        return resultados.length > 0 ? resultados[0] : null;
    }

    async crearProveedor(data, client = null) {
        return this.execWithClient(async (conn) => {
            const existente = await this._buscarProveedor(data, '*', conn)
            if (existente) return existente;
            console.log("EL PROVEEDOR EXISTNTE ES")
            console.log(existente)

            return await this.crearAuto('proveedor', data, conn);
        }, client)
    }

    async actualizarProveedor(nombre, tipo_servicio, data, client = null) {
        return await this.execWithClient(async (conn) => {
            const inmueble_existe = await this._buscarProveedor({ nombre, tipo_servicio }, '1', conn);
            if (!inmueble_existe) throw new NotFoundError(`El proveedor ${nombre} de ${tipo_servicio} no existe`);

            const nuevo_existente = await this._buscarProveedor(data, '*', conn);
            if (nuevo_existente && 
                nuevo_existente.id_proveedor !== inmueble_existe.id_proveedor) throw new ConflictError(`Ya existe otro proveedor con el nombre ${data.nombre} y servicio ${data.tipo_servicio}`);

            return await this.actualizar('proveedor', { id_proveedor: inmueble_existe.id_proveedor }, data)
        }, client);
    }

    async upsertProveedor(data, client = null) {
        return await this.execWithClient(async (conn) => {
            if (data.original) return await this.actualizarProveedor(data.original.nombre, data.original.tipo_servicio, data.data, conn);

            return await this.crearProveedor(data.data, conn);
        }, client)
    }

}