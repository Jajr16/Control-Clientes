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

    async actualizarSeguro(claveCatastral, polizaActual, nuevosDatos, client = null) {
        return await this.execWithClient(async (conn) => {

            const { poliza_nueva, ...restoDatos } = nuevosDatos;

            // 1. Validar que exista el seguro actual
            const existeActual = await this.repositories.inmuebleSeguro.ExistePorId(
                {
                    clave_catastral: claveCatastral,
                    poliza: polizaActual
                },
                conn
            );

            if (!existeActual) {
                throw new Error(`No se encontró la póliza ${polizaActual} para el inmueble ${claveCatastral}`);
            }

            // 2. Si viene una poliza_nueva, validar que no exista ya
            if (poliza_nueva) {
                const existeNueva = await this.repositories.inmuebleSeguro.ExistePorId(
                    {
                        clave_catastral: claveCatastral,
                        poliza: poliza_nueva
                    },
                    conn
                );

                if (existeNueva) {
                    throw new Error(`La nueva póliza ${poliza_nueva} ya existe para este inmueble.`);
                }
            }

            // 3. Construir los datos a actualizar
            const datosActualizados = {
                ...restoDatos,
                ...(poliza_nueva ? { poliza: poliza_nueva } : {})
            };

            // 4. Realizar el update
            const actualizado = await this.repositories.seguro.actualizarPorId(
                { poliza: polizaActual },
                datosActualizados,
                conn
            );

            if (!actualizado) {
                throw new Error(`No se pudo actualizar el seguro`);
            }

            return {
                message: 'Seguro actualizado correctamente',
                data: actualizado
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