import { BaseService } from "../../../services/base.service.js";
import Repositorio from "../../../repositories/global.repository.js";
import { QueryBuilder } from "../../../utils/queryBuilder.js";

export default class ProveedorService extends BaseService {
    constructor() {
        super({
            proveedor: new Repositorio('proveedor', 'id_proveedor'),
            inmuebleProveedor: new Repositorio('inmueble_proveedor', ['clave_catastral', 'id_proveedor'])
        })
    }

    async _buscarProveedor(data, select = '*', client = null) {
        const qb = new QueryBuilder('proveedor')
        const { query, params } = qb.select(select)
            .where('nombre', data.nombre)
            .where('tipo_servicio', data.tipo_servicio)
            .build()

        return await this.consultar('proveedor', query, params, client)
    }

    async crearProveedor(data, client = null) {
        return this.execWithClient(async (conn) => {
            const existente = await this._buscarProveedor(data, '1', conn)
            if (existente) throw new Error(`El proveedor ${data.nombre} de ${data.tipo_servicio} ya existe`);

            return await this.repositories.proveedor.insertar(data, client);
        }, client)
    }

    async vincularProveedorAInmueble(data, clave_catastral, client) {
        return this.execWithClient(async (conn) => {
            let existente = await this._buscarProveedor(data, '*', conn)
    
            if (!existente?.length > 0) {
                console.log('ENTRANDO A')
                existente = await this.crear('proveedor', { id_proveedor: null }, data, conn);
            }
            console.log('EL EXISTENTE ES')
            console.log(existente)
    
            const relacion = {
                clave_catastral,
                id_proveedor: existente.id_proveedor
            };
    
            const result = await this.crear('inmuebleProveedor', relacion, relacion, conn);
    
            return { result, message: `Proveedor vinculado a ${clave_catastral}` };
        }, client)
    }

    async actualizarProveedor(claveCatastral, clave, nuevosDatos, client = null) {
        return await this.execWithClient(async (conn) => {
            const proveedorExiste = await this.repositories.inmuebleProveedor.ExistePorId(
                {
                    clave_catastral: claveCatastral,
                    clave: clave
                },
                conn
            );
            if (!proveedorExiste) {
                throw new Error(`No se encontró la clave ${clave} para el inmueble ${claveCatastral}`);
            }
            const proveedorActualizado = await this.repositories.proveedor.actualizarPorId(
                {
                    clave: clave
                },
                nuevosDatos,
                conn
            );
            if (!proveedorActualizado) {
                throw new Error('No se pudo actualizar el proveedor');
            }
            return {
                message: "Proveedor actualizado correctamente",
                data: proveedorActualizado
            };
        }, client);
    }

    async eliminarProveedor(claveCatastral, clave, client = null) {
        return await this.withTransaction(async (conn) => {
            const relacionExiste = await this.repositories.inmuebleProveedor.ExistePorId(
                {
                    clave_catastral: claveCatastral,
                    clave: clave
                },
                conn
            );

            if (!relacionExiste) {
                throw new Error(`No se encontró el proveedor con clave ${clave} para el inmueble ${claveCatastral}`);
            }

            await this.repositories.inmuebleProveedor.eliminarPorId(
                {
                    clave_catastral: claveCatastral,
                    clave: clave
                },
                conn
            );

            // CORRECCIÓN: Usar BuscarPorFiltros en lugar de contar
            const otrosUsos = await this.repositories.inmuebleProveedor.BuscarPorFiltros(
                { clave: clave },
                [], // columnas seleccionadas vacías
                conn
            );

            // Asegurar que otrosUsos siempre sea un array
            const tieneOtrosUsos = Array.isArray(otrosUsos) && otrosUsos.length > 0;

            if (!tieneOtrosUsos) {
                await this.repositories.proveedor.eliminarPorId(
                    { clave: clave },
                    conn
                );
            }

            return {
                message: "Proveedor eliminado correctamente del inmueble",
                data: {
                    clave_catastral: claveCatastral,
                    clave: clave,
                    proveedor_eliminado_completamente: !tieneOtrosUsos
                }
            };
        }, client);
    }
}