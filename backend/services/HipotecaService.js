import { BaseService } from "./BaseService.js";
import Repositorio from "../repositories/globalPersistence.js";

export default class HipotecaService extends BaseService {
    constructor() {
        super({
            hipoteca: new Repositorio("hipoteca", "id"),
            inmuebleHipoteca: new Repositorio("inmueble_hipoteca", ['clave_catastral', 'id_hipoteca'])
        })
    }

    async crearHipoteca(data, client = null) {
        return await this.repositories.hipoteca.insertar(data, client);
    }

    async vincularHipotecaAInmueble(hipoteca, claveCatastral, client) {
        const nuevaHipoteca = await this.repositories.hipoteca.insertar(hipoteca, client);

        const relacion = {
            clave_catastral: claveCatastral,
            id_hipoteca: nuevaHipoteca.id
        };

        await this.repositories.inmuebleHipoteca.insertar(relacion, client);

        return { success: true, message: `Hipoteca vinculada a ${claveCatastral}` };
    }

    async actualizarHipoteca(claveCatastral, id_hipoteca, nuevosDatos, client = null) {
        return await this.withTransaction(async (conn) => {
            const hipotecaExiste = await this.repositories.inmuebleHipoteca.ExistePorId(
                { 
                    clave_catastral: claveCatastral, 
                    id_hipoteca: id_hipoteca 
                }, 
                conn
            );
            if (!hipotecaExiste) {
                throw new Error(`No se encontró la clave catastral ${claveCatastral} para el id ${id_hipoteca}`);
            }
            const hipotecaActualizado = await this.repositories.hipoteca.actualizarPorId(
                { 
                    id: id_hipoteca
                },
                nuevosDatos,
                conn
            );
            if (!hipotecaActualizado) {
                throw new Error('No se pudo actualizar la hipoteca');
            }
            return {
                message: "Hipoteca actualizado correctamente",
                data: hipotecaActualizado
            };
        }, client);
    }      
    
    async eliminarHipoteca(claveCatastral, idHipoteca, client = null) {
        return await this.execWithClient(async (conn) => {
            const relacionExiste = await this.repositories.inmuebleHipoteca.ExistePorId(
                { 
                    clave_catastral: claveCatastral, 
                    id_hipoteca: idHipoteca 
                }, 
                conn
            );

            if (!relacionExiste) {
                throw new Error(`No se encontró la hipoteca con ID ${idHipoteca} para el inmueble ${claveCatastral}`);
            }

            await this.repositories.inmuebleHipoteca.eliminarPorId(
                { 
                    clave_catastral: claveCatastral, 
                    id_hipoteca: idHipoteca 
                }, 
                conn
            );

            // CORRECCIÓN: Usar BuscarPorFiltros en lugar de contar
            const otrosUsos = await this.repositories.inmuebleHipoteca.BuscarPorFiltros(
                { id_hipoteca: idHipoteca }, 
                [], // columnas seleccionadas vacías
                conn
            );

            // Asegurar que otrosUsos siempre sea un array
            const tieneOtrosUsos = Array.isArray(otrosUsos) && otrosUsos.length > 0;

            if (!tieneOtrosUsos) {
                await this.repositories.hipoteca.eliminarPorId(
                    { id: idHipoteca }, 
                    conn
                );
            }

            return {
                message: "Hipoteca eliminada correctamente del inmueble",
                data: { 
                    clave_catastral: claveCatastral, 
                    id_hipoteca: idHipoteca,
                    hipoteca_eliminada_completamente: !tieneOtrosUsos
                }
            };
        }, client);
    }
}