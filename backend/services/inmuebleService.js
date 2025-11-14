import { BaseService } from './BaseService.js';
import Repositorio from '../repositories/globalPersistence.js';
import DatoRegistralService from './DatoRegistralService.js';
import DireccionService from './DireccionService.js';
import HipotecaService from './HipotecaService.js';
import ProveedorService from './ProveedorService.js';
import SeguroService from './SeguroService.js';

class InmuebleService extends BaseService {
    constructor() {
        super({
            inmueble: new Repositorio('inmueble', 'clave_catastral'),
            empresaInmueble: new Repositorio('empresa_inmueble', ['cif', 'clave_catastral']),
            inmuebleProveedor: new Repositorio('inmueble_proveedor', ['clave_catastral', 'clave']),
            inmuebleSeguro: new Repositorio('inmueble_seguro', ['clave_catastral', 'poliza']),
            inmuebleHipoteca: new Repositorio("inmueble_hipoteca", ['clave_catastral', 'id_hipoteca']),
            datoRegistral: new Repositorio('dato_registral', 'id_dr')
        });

        this.datoRegistralService = new DatoRegistralService();
        this.direccionService = new DireccionService();
        this.hipotecaService = new HipotecaService();
        this.proveedorService = new ProveedorService();
        this.seguroService = new SeguroService();
    }

    async nuevoInmueble(datos, client = null) {
        const ejecutar = async (conn) => {
            const datoRegistral = await this.datoRegistralService.crearDatoRegistral(datos.datosInmueble.datoRegistralInmueble, conn);
            const { cp, ...direccionData } = datos.datosInmueble.dirInmueble
            const direccion = await this.direccionService.crearDireccion({ ...direccionData, codigo_postal: cp }, conn);

            const inmuebleData = {
                clave_catastral: datos.datosInmueble.clave_catastral,
                direccion: direccion.id,
                dato_registral: datoRegistral.id_dr
            };

            const resultado = await this.repositories.inmueble.insertar(inmuebleData, conn);

            if (datos.proveedores && datos.proveedores.length > 0) {
                for (const proveedor of datos.proveedores) {
                    await this.proveedorService.vincularProveedorAInmueble({
                        clave: proveedor.clave_proveedor,
                        nombre: proveedor.nombre,
                        telefono: proveedor.tel_proveedor,
                        email: proveedor.email_proveedor,
                        tipo_servicio: proveedor.servicio
                    }, datos.datosInmueble.clave_catastral, conn)
                }
            }

            if (datos.hipotecas && datos.hipotecas.length > 0) {
                for (const hipoteca of datos.hipotecas) {
                    await this.hipotecaService.vincularHipotecaAInmueble({
                        prestamo: hipoteca.prestamo,
                        banco_prestamo: hipoteca.prestamo,
                        fecha_hipoteca: hipoteca.fecha_hipoteca,
                        cuota_hipoteca: hipoteca.cuota
                    }, datos.datosInmueble.clave_catastral, conn)
                }
            }

            if (datos.seguros && datos.seguros.length > 0) {
                for (const seguro of datos.seguros) {
                    await this.seguroService.vincularSeguroAInmueble({
                        empresa_seguro: seguro.aseguradora,
                        tipo_seguro: seguro.tipo_seguro,
                        telefono: seguro.telefono_seguro,
                        email: seguro.email_seguro,
                        poliza: seguro.poliza
                    }, datos.datosInmueble.clave_catastral, conn)
                }
            }

            return { message: "Inmueble creado con éxito.", data: resultado };
        };

        if (client) {
            return await ejecutar(client);
        } else {
            return await this.withTransaction(ejecutar);
        }
    }

    // ======= ACTUALIZAR SEGURO =======
    async updateSeguro(claveCatastral, poliza, nuevosDatos) {
        return await this.seguroService.actualizarSeguro(
            claveCatastral, 
            poliza, 
            nuevosDatos
        );
    }

    // ======= ACTUALIZAR PROVEEDORES =======
    async updateProveedor(claveCatastral, clave, nuevosDatos) {
        return await this.proveedorService.actualizarProveedor(
            claveCatastral,
            clave,
            nuevosDatos
        );
    }

    // ========== ACTUALIZAR DATOS REGISTRALES ==========
    async updateDatosRegistrales(claveCatastral, nuevosDatos) {
        return await this.datoRegistralService.actualizarDatosRegistrales(
            claveCatastral,
            nuevosDatos
        );
    }

    // ========== ACTUALIZAR HIPOTECA ==========
    async updateHipoteca(claveCatastral, id_hipoteca, nuevosDatos) {
        return await this.hipotecaService.actualizarHipoteca(
            claveCatastral,
            id_hipoteca,
            nuevosDatos
        );
    }

    // En InmuebleService.js, agrega este método:

// ========== ACTUALIZAR INMUEBLE ==========
async updateInmueble(claveCatastral, nuevosDatos) {
    return await this.withTransaction(async (client) => {
        console.log(`Actualizando inmueble: ${claveCatastral}`, nuevosDatos);
        
        // 1. Verificar que el inmueble existe
        const inmuebleExiste = await this.repositories.inmueble.ExistePorId(
            { clave_catastral: claveCatastral }, 
            client
        );

        if (!inmuebleExiste) {
            throw new Error('Inmueble no encontrado');
        }

        // 2. Obtener datos actuales del inmueble
        const inmuebleActual = await this.repositories.inmueble.BuscarPorFiltros(
            { clave_catastral: claveCatastral }, 
            1, 
            client
        );

        if (inmuebleActual.length === 0) {
            throw new Error('No se pudieron obtener los datos del inmueble');
        }

        const inmueble = inmuebleActual[0];
        const idDireccion = inmueble.direccion;

        // 3. Actualizar dirección si hay cambios en los campos de dirección
        const camposDireccion = ['calle', 'numero', 'piso', 'codigo_postal', 'localidad'];
        const datosDireccion = {};
        
        for (const campo of camposDireccion) {
            if (nuevosDatos[campo] !== undefined) {
                datosDireccion[campo] = nuevosDatos[campo];
            }
        }

        if (Object.keys(datosDireccion).length > 0) {
            await this.direccionService.actualizarDireccion(idDireccion, datosDireccion, client);
            console.log('Dirección actualizada');
        }

        // 4. Actualizar valor_adquisicion en empresa_inmueble si está presente
        if (nuevosDatos.valor_adquisicion !== undefined) {
            const empresaInmuebleRelacion = await this.repositories.empresaInmueble.BuscarPorFiltros(
                { clave_catastral: claveCatastral }, 
                1,
                client
            );

            if (empresaInmuebleRelacion && empresaInmuebleRelacion.length > 0) {
                const { cif } = empresaInmuebleRelacion[0];
                await this.repositories.empresaInmueble.actualizarPorId(
                    { cif: cif, clave_catastral: claveCatastral },
                    { valor_adquisicion: nuevosDatos.valor_adquisicion },
                    client
                );
                console.log('Valor de adquisición actualizado');
            }
        }

        // 5. Retornar el inmueble actualizado
        const inmuebleActualizado = await this.repositories.inmueble.BuscarPorFiltros(
            { clave_catastral: claveCatastral }, 
            1, 
            client
        );

        return {
            message: "Inmueble actualizado correctamente",
            data: inmuebleActualizado[0]
        };
    });
}

    // ========== ELIMINAR INMUEBLE ==========
    async deleteInmueble(claveCatastral) {
        return await this.withTransaction(async (client) => {
            console.log(`Iniciando eliminación completa del inmueble: ${claveCatastral}`);
            
            // 1. Verificar que el inmueble existe
            const inmuebleExiste = await this.repositories.inmueble.ExistePorId(
                { clave_catastral: claveCatastral }, 
                client
            );

            if (!inmuebleExiste) {
                throw new Error('Inmueble no encontrado');
            }

            // 2. Obtener datos completos del inmueble
            const inmuebleData = await this.repositories.inmueble.BuscarPorFiltros(
                { clave_catastral: claveCatastral }, 
                1, 
                client
            );

            if (inmuebleData.length === 0) {
                throw new Error('No se pudieron obtener los datos del inmueble');
            }

            const inmueble = inmuebleData[0];
            const idDireccion = inmueble.direccion;
            const idDatoRegistral = inmueble.dato_registral;

            console.log(`Datos del inmueble: dirección=${idDireccion}, dato_registral=${idDatoRegistral}`);

            // 3. Eliminar relaciones en el orden correcto

            // 3.1 Eliminar hipotecas
            const hipotecas = await this.getHipotecas(claveCatastral);
            for (const hipoteca of hipotecas) {
                await this.hipotecaService.eliminarHipoteca(claveCatastral, hipoteca.id, client);
            }
            console.log(`Hipotecas eliminadas: ${hipotecas.length}`);

            // 3.2 Eliminar seguros y proveedores
            const segurosDetails = await this.getProveedoresSegurosDetails(claveCatastral);
            for (const seguro of segurosDetails.seguros) {
                await this.seguroService.eliminarSeguro(claveCatastral, seguro.poliza, client);
            }
            console.log(`Seguros eliminados: ${segurosDetails.seguros.length}`);

            for (const proveedor of segurosDetails.proveedores) {
                await this.proveedorService.eliminarProveedor(claveCatastral, proveedor.clave, client);
            }
            console.log(`Proveedores eliminados: ${segurosDetails.proveedores.length}`);

            // 3.3 Eliminar relación con empresa
            const empresaInmuebleRelacion = await this.repositories.empresaInmueble.BuscarPorFiltros(
                { clave_catastral: claveCatastral }, 
                1,
                client
            );

            if (empresaInmuebleRelacion && empresaInmuebleRelacion.length > 0) {
                const { cif } = empresaInmuebleRelacion[0];
                await this.repositories.empresaInmueble.eliminarPorId(
                    { cif: cif, clave_catastral: claveCatastral }, 
                    client
                );
                console.log('Relación con empresa eliminada');
            }

            // 4. Eliminar el inmueble principal
            await this.repositories.inmueble.eliminarPorId(
                { clave_catastral: claveCatastral }, 
                client
            );
            console.log('Inmueble eliminado de la tabla inmueble');

            // 5. Eliminar datos registrales si no son usados
            const otrosInmueblesDatoRegistral = await this.repositories.inmueble.BuscarPorFiltros(
                { dato_registral: idDatoRegistral }, 
                999,
                client
            );

            if (otrosInmueblesDatoRegistral.length === 0) {
                await this.repositories.datoRegistral.eliminarPorId(
                    { id_dr: idDatoRegistral }, 
                    client
                );
                console.log('Datos registrales eliminados completamente');
            } else {
                console.log(`Datos registrales conservados (usados por ${otrosInmueblesDatoRegistral.length} otros inmuebles)`);
            }

            // 6. Eliminar dirección si no es usada
            const otrosInmueblesDireccion = await this.repositories.inmueble.BuscarPorFiltros(
                { direccion: idDireccion }, 
                999,
                client
            );

            let direccionEliminada = false;
            if (otrosInmueblesDireccion.length === 0) {
                try {
                    // Intentar eliminar usando el servicio
                    await this.direccionService.eliminarDireccion(idDireccion, client);
                    direccionEliminada = true;
                    console.log('Dirección eliminada completamente');
                } catch (error) {
                    // Si el servicio falla, eliminar directamente desde el repositorio
                    console.log('Error al eliminar con servicio, eliminando directamente...');
                    const direccionRepo = new Repositorio('direccion', 'id');
                    await direccionRepo.eliminarPorId({ id: idDireccion }, client);
                    direccionEliminada = true;
                    console.log('Dirección eliminada directamente desde repositorio');
                }
            } else {
                console.log(`Dirección conservada (usada por ${otrosInmueblesDireccion.length} otros inmuebles)`);
            }

            // 7. Retornar resumen
            return {
                message: "Inmueble eliminado completamente con éxito",
                data: {
                    clave_catastral: claveCatastral,
                    eliminaciones: {
                        hipotecas: hipotecas.length,
                        seguros: segurosDetails.seguros.length,
                        proveedores: segurosDetails.proveedores.length,
                        empresa_inmueble: empresaInmuebleRelacion && empresaInmuebleRelacion.length > 0,
                        inmueble: true,
                        dato_registral: otrosInmueblesDatoRegistral.length === 0,
                        direccion: otrosInmueblesDireccion.length === 0
                    }
                }
            };
        });
    }

    // ========== ELIMINAR SEGURO ==========
    async deleteSeguro(claveCatastral, poliza) {
        return await this.seguroService.eliminarSeguro(claveCatastral, poliza);
    }

    // ========== ELIMINAR PROVEEDOR ==========
    async deleteProveedor(claveCatastral, claveProveedor) {
        return await this.proveedorService.eliminarProveedor(claveCatastral, claveProveedor);
    }

    // ========== ELIMINAR HIPOTECA ==========
    async deleteHipoteca(claveCatastral, idHipoteca) {
        return await this.hipotecaService.eliminarHipoteca(claveCatastral, idHipoteca);
    }

    async getProveedoresSegurosDetails(claveCatastral) {
        try {
            const joinsProveedor = [
                { type: 'INNER', table: 'proveedor p', on: 'inmueble_proveedor.clave = p.clave' }
            ];

            const proveedores = await this.repositories.inmuebleProveedor.BuscarConJoins(
                joinsProveedor,
                { 'inmueble_proveedor.clave_catastral': claveCatastral },
                'AND',
                ['p.clave', 'p.nombre', 'p.telefono', 'p.email', 'p.tipo_servicio']
            );

            const joinsSeguros = [
                { type: 'INNER', table: 'seguro s', on: 'inmueble_seguro.poliza = s.poliza' }
            ];

            const seguros = await this.repositories.inmuebleSeguro.BuscarConJoins(
                joinsSeguros,
                { 'inmueble_seguro.clave_catastral': claveCatastral },
                'AND',
                ['s.empresa_seguro', 's.tipo_seguro', 's.telefono', 's.email', 's.poliza']
            );

            console.log(`Seguros encontrados: ${seguros.length}`);
            return {
                proveedores,
                seguros
            };
        } catch (error) {
            console.error("Error al obtener proveedores y seguros:", error);
            throw new Error("No se pudo obtener la información de proveedores y seguros");
        }
    }

    async getInmuebleDetails(cif) {
        try {
            const joins = [
                { type: 'INNER', table: 'inmueble i', on: 'empresa_inmueble.clave_catastral = i.clave_catastral' },
                { type: 'INNER', table: 'direccion d', on: 'i.direccion = d.id' },
                { type: 'INNER', table: 'dato_registral dr', on: 'i.dato_registral = dr.id_dr' }
            ];

            const columnas = [
                'd.calle', 'd.numero', 'd.piso', 'd.codigo_postal', 'd.localidad',
                'empresa_inmueble.clave_catastral', 'empresa_inmueble.valor_adquisicion',
                'empresa_inmueble.fecha_adquisicion', 'dr.num_protocolo', 'dr.folio',
                'dr.hoja', 'dr.inscripcion', 'dr.notario', 'dr.fecha_inscripcion'
            ];

            return await this.repositories.empresaInmueble.BuscarConJoins(
                joins,
                { 'empresa_inmueble.cif': cif },
                'AND',
                columnas
            );
        } catch (error) {
            console.error("Error al obtener detalles del inmueble:", error);
            throw new Error("No se pudo obtener los detalles del inmueble");
        }
    }

    async getHipotecas(claveCatastral) {
        try {
            const joins = [
                { type: 'INNER', table: 'hipoteca h', on: 'inmueble_hipoteca.id_hipoteca = h.id' }
            ];

            const columnas = [
                'h.id', 'h.prestamo', 'h.banco_prestamo', 'h.fecha_hipoteca', 'h.cuota_hipoteca'
            ];

            return await this.repositories.inmuebleHipoteca.BuscarConJoins(
                joins,
                { 'inmueble_hipoteca.clave_catastral': claveCatastral },
                'AND',
                columnas
            );
        } catch (error) {
            console.error("Error al obtener hipotecas:", error);
            throw new Error("No se pudo obtener las hipotecas");
        }
    }
}

export default InmuebleService;