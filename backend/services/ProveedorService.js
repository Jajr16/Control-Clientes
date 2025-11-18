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