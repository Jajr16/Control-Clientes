import { BaseService } from "./BaseService.js";
import Repositorio from "../repositories/globalPersistence.js";

export default class SeguroService extends BaseService {
    constructor() {
        super({
            seguro: new Repositorio('seguro', 'poliza'),
            inmuebleSeguro: new Repositorio('inmueble_seguro', ['clave_catastral', 'poliza'])
        })
    }

    async vincularSeguroAInmueble(seguro, claveCatastral, client) {
        let existente = await this.repositories.seguro.ExistePorId({ poliza: seguro.poliza }, client);
        
        if (!existente) {
            existente = await this.repositories.seguro.insertar(seguro, client);
        }

        const relacion = {
            clave_catastral: claveCatastral,
            poliza: seguro.poliza
        };

        await this.repositories.inmuebleSeguro.insertar(relacion, client);

        return { success: true, message: `Seguro vinculado a ${claveCatastral}` };
    }

    async actualizarSeguro(claveCatastral, poliza, nuevosDatos, client = null) {
        return await this.withTransaction(async (conn) => {
            const seguroExiste = await this.repositories.inmuebleSeguro.ExistePorId(
                { 
                    clave_catastral: claveCatastral, 
                    poliza: poliza 
                }, 
                conn
            );
            if (!seguroExiste) {
                throw new Error(`No se encontró la póliza ${poliza} para el inmueble ${claveCatastral}`);
            }
            
            const seguroActualizado = await this.repositories.seguro.actualizarPorId(
                { 
                    poliza: poliza 
                },
                nuevosDatos,
                conn
            );
            
            if (!seguroActualizado) {
                throw new Error('No se pudo actualizar el seguro');
            }
            return {
                message: "Seguro actualizado correctamente",
                data: seguroActualizado
            };
        }, client);
    }

    async eliminarSeguro(claveCatastral, poliza, client = null) {
        return await this.withTransaction(async (conn) => {
            const relacionExiste = await this.repositories.inmuebleSeguro.ExistePorId(
                { 
                    clave_catastral: claveCatastral, 
                    poliza: poliza 
                }, 
                conn
            );

            if (!relacionExiste) {
                throw new Error(`No se encontró la póliza ${poliza} para el inmueble ${claveCatastral}`);
            }

            await this.repositories.inmuebleSeguro.eliminarPorId(
                { 
                    clave_catastral: claveCatastral, 
                    poliza: poliza 
                }, 
                conn
            );

            const otrosUsos = await this.repositories.inmuebleSeguro.BuscarPorFiltros(
                { poliza: poliza }, 
                [],
                conn
            );

            const tieneOtrosUsos = Array.isArray(otrosUsos) && otrosUsos.length > 0;

            if (!tieneOtrosUsos) {
                await this.repositories.seguro.eliminarPorId(
                    { poliza: poliza }, 
                    conn
                );
            }

            return {
                message: "Seguro eliminado correctamente del inmueble",
                data: { 
                    clave_catastral: claveCatastral, 
                    poliza: poliza,
                    seguro_eliminado_completamente: !tieneOtrosUsos
                }
            };
        }, client);
    }
}