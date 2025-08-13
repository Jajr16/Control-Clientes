import { BaseService } from './BaseService.js';
import Repositorio from '../repositories/globalPersistence.js';

class InmuebleService extends BaseService {
    constructor() {
        super({
            inmueble: new Repositorio('inmueble', 'clave_catastral'),
            direccion: new Repositorio('direccion', 'id'),
            datoRegistral: new Repositorio('dato_registral', 'id_dr'),
            empresaInmueble: new Repositorio('empresa_inmueble', ['cif', 'clave_catastral']),
            inmuebleProveedor: new Repositorio('inmueble_proveedor', ['clave_catastral', 'clave']),
            inmuebleSeguro: new Repositorio('inmueble_seguro', ['clave_catastral', 'empresa_seguro']),
            hipoteca: new Repositorio('inmueble_hipoteca', ['clave_catastral', 'id_hipoteca'])
        });
    }

    async nuevoInmueble(datos) {
        return await this.withTransaction(async (client) => {
            // Insertar dato registral
            const datoRegistral = await this.repositories.datoRegistral.insertar(datos.dato_registral, client);
            console.log("Dato registral registrado");
            
            // Insertar dirección
            const direccion = await this.repositories.direccion.insertar(datos.direccion, client);
            console.log("Dirección registrada");
            
            // Crear inmueble
            const inmuebleData = {
                clave_catastral: datos.inmueble.clave_catastral,
                direccion: direccion.id,
                dato_registral: datoRegistral.id_dr
            };

            const resultado = await this.repositories.inmueble.insertar(inmuebleData, client);
            
            return { 
                message: "Inmueble creado con éxito.", 
                data: resultado 
            };
        });
    }

    async getProveedoresSegurosDetails(claveCatastral) {
        try {
            // Proveedores
            const joinsProveedor = [
                { type: 'INNER', table: 'proveedor p', on: 'inmueble_proveedor.clave = p.clave' }
            ];

            const proveedores = await this.repositories.inmuebleProveedor.BuscarConJoins(
                joinsProveedor, 
                { 'inmueble_proveedor.clave_catastral': claveCatastral }, 
                'AND',
                ['p.nombre', 'p.telefono', 'p.email', 'p.tipo_servicio']
            );

            // Seguros
            const joinsSeguros = [
                { type: 'INNER', table: 'seguro s', on: 'inmueble_seguro.empresa_seguro = s.empresa_seguro' }
            ];

            const seguros = await this.repositories.inmuebleSeguro.BuscarConJoins(
                joinsSeguros,
                { 'inmueble_seguro.clave_catastral': claveCatastral },
                'AND',
                ['s.empresa_seguro', 's.tipo_seguro', 's.telefono', 's.email', 's.poliza']
            );

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
                'h.prestamo', 'h.banco_prestamo', 'h.fecha_hipoteca', 'h.cuota_hipoteca'
            ];

            return await this.repositories.hipoteca.BuscarConJoins(
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