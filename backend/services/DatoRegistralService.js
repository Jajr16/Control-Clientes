import { BaseService } from "./BaseService.js";
import Repositorio from "../repositories/globalPersistence.js";

export default class DatoRegistralService extends BaseService {
    constructor() {
        super({
            datoRegistral: new Repositorio('dato_registral', 'id_dr'),
            inmueble: new Repositorio('inmueble', 'clave_catastral'),
            empresaInmueble: new Repositorio('empresa_inmueble', 'clave_catastral')
        })
    }

    async crearDatoRegistral(data, client = null) {
        return await this.execWithClient(async (conn) => {

            const existente = await this.repositories.datoRegistral.BuscarPorFiltros({
                num_protocolo: data.num_protocolo,
                folio: data.folio,
                hoja: data.hoja,
                inscripcion: data.inscripcion,
                fecha_inscripcion: data.fecha_inscripcion
            }, 1, conn);

            if (existente.length > 0)
                throw new Error(`El dato registral ingresado ya existe`);

            return await this.repositories.datoRegistral.insertar(data, conn);

        }, client);
    }

    // En DatoRegistralService.js, agrega este método
    async actualizarDatoRegistralPorId(idDr, nuevosDatos, client = null) {
        return await this.execWithClient(async (conn) => {
            // Verificar que el dato registral existe
            const datoRegistralExiste = await this.repositories.datoRegistral.ExistePorId({ id_dr: idDr }, conn);
            if (!datoRegistralExiste) {
                throw new Error('Dato registral no encontrado');
            }

            // Preparar datos para actualizar
            const datosActualizar = {};
            const camposPermitidos = ['num_protocolo', 'folio', 'hoja', 'inscripcion', 'notario', 'fecha_inscripcion'];

            camposPermitidos.forEach(campo => {
                if (nuevosDatos[campo] !== undefined) {
                    datosActualizar[campo] = nuevosDatos[campo];
                }
            });

            console.log('Actualizando dato registral con ID:', idDr, 'Datos:', datosActualizar);

            if (Object.keys(datosActualizar).length === 0) {
                throw new Error('No hay datos válidos para actualizar');
            }

            const resultado = await this.repositories.datoRegistral.actualizarPorId(
                { id_dr: idDr },
                datosActualizar,
                conn
            );

            console.log('Resultado actualización dato registral:', resultado);

            if (!resultado) {
                throw new Error('No se pudo actualizar los datos registrales');
            }

            return {
                message: "Datos registrales actualizados correctamente",
                data: resultado
            };
        }, client);
    }

    async actualizarDatosRegistrales(claveCatastral, nuevosDatos, client = null) {
        return await this.execWithClient(async (conn) => {
            console.log('Buscando inmueble:', claveCatastral);

            // 1. Buscar el inmueble para obtener el id_dr
            const inmuebles = await this.repositories.inmueble.BuscarPorFiltros(
                { clave_catastral: claveCatastral },
                1,
                conn
            );

            if (inmuebles.length === 0) {
                throw new Error('Inmueble no encontrado');
            }

            const inmueble = inmuebles[0];
            const idDatoRegistral = inmueble.dato_registral;

            console.log('ID Dato Registral encontrado:', idDatoRegistral);
            console.log('Datos a actualizar:', nuevosDatos);

            // 2. Verificar que el dato registral existe
            const datoRegistralExiste = await this.repositories.datoRegistral.ExistePorId(
                { id_dr: idDatoRegistral },
                conn
            );

            if (!datoRegistralExiste) {
                throw new Error(`Dato registral con ID ${idDatoRegistral} no encontrado`);
            }

            // 3. Preparar datos para actualizar (solo campos presentes)
            const datosActualizarDR = {};
            const camposDR = ['num_protocolo', 'folio', 'hoja', 'inscripcion', 'notario', 'fecha_inscripcion'];

            camposDR.forEach(campo => {
                if (nuevosDatos[campo] !== undefined) {
                    datosActualizarDR[campo] = nuevosDatos[campo];
                }
            });

            console.log('Actualizando dato registral con:', datosActualizarDR);

            // 4. Actualizar datos registrales
            let datoRegistralActualizado
            if (Object.keys(datosActualizarDR).length > 0) {
                datoRegistralActualizado = await this.repositories.datoRegistral.actualizarPorId(
                    { id_dr: idDatoRegistral },
                    datosActualizarDR,
                    conn
                );
    
                console.log('Resultado actualización dato registral:', datoRegistralActualizado);
    
                if (!datoRegistralActualizado) {
                    throw new Error('No se pudo actualizar los datos registrales - actualizarPorId devolvió null');
                }
            }
            
            // 5. Preparar datos para empresa_inmueble
            const datosActualizarEI = {};
            const camposEI = ['valor_adquisicion', 'fecha_adquisicion'];

            camposEI.forEach(campo => {
                if (nuevosDatos[campo] !== undefined) {
                    datosActualizarEI[campo] = nuevosDatos[campo];
                }
            });

            // Solo actualizar empresa_inmueble si hay datos relevantes
            let empresaInmuebleActualizado = null;
            if (Object.keys(datosActualizarEI).length > 0) {
                console.log('Actualizando empresa_inmueble con:', datosActualizarEI);

                // Verificar que existe la relación empresa_inmueble
                const empresaInmuebleExiste = await this.repositories.empresaInmueble.ExistePorId(
                    { clave_catastral: claveCatastral },
                    conn
                );

                if (!empresaInmuebleExiste) {
                    throw new Error(`Relación empresa_inmueble para ${claveCatastral} no encontrada`);
                }

                empresaInmuebleActualizado = await this.repositories.empresaInmueble.actualizarPorId(
                    { clave_catastral: claveCatastral },
                    datosActualizarEI,
                    conn
                );

                console.log('Resultado actualización empresa_inmueble:', empresaInmuebleActualizado);

                if (!empresaInmuebleActualizado) {
                    throw new Error('No se pudo actualizar los datos de empresa inmueble');
                }
            }

            return {
                message: "Datos actualizados correctamente",
                data: {
                    datoRegistral: datoRegistralActualizado,
                    empresaInmueble: empresaInmuebleActualizado
                }
            };
        }, client);
    }


}