import Repositorio from '../repositories/globalPersistence.js'
import { pool } from '../config/db.js';

/**
 * Clase para crear el servicio de la tabla Inmueble la cuál se comunicará directamente con el repositorio (capa de persistencia) para realizar operaciones SQL
 */
class InmuebleService {
    constructor() {
        this.repositorioInmueble = new Repositorio('inmueble', 'clave_catastral')
        this.repositorioDireccion = new Repositorio('direccion', 'id')
        this.repositorioDatoRegistral = new Repositorio('dato_registral', 'id_dr')
        this.repositorioEmpresaInmueble = new Repositorio('empresa_inmueble', ['cif', 'clave_catastral'])
        this.repositorioInmuebleProveedor = new Repositorio('inmueble_proveedor', ['clave_catastral', 'clave'])
        this.repositorioInmuebleSeguro = new Repositorio('inmueble_seguro', ['clave_catastral', 'empresa_seguro'])
    }

    /**
     * Método para agregar nuevos registros a la tabla Inmueble
     * 
     * @param {*} datos Datos que se usarán para guardar un nuevo registro en la tabla Inmueble
     * @returns Respuesta del reporsitorio (Respuesta SQL)
     */
    async nuevoInmueble(datos) {
        const client = await pool.connect(); // Obtener cliente de pool para iniciar trnasacción

        try {
            // Iniciar transacción
            await client.query('BEGIN')
            
            // Realizar registro del dato registral y obtener la PK generada
            const datoRegistral = await this.repositorioDatoRegistral.insertar(datos.dato_registral, client)
            const datoRegistralPK = datoRegistral.id_dr
            console.log("Dato registral registrado")
            
            //Realizar registro de la dirección y obtener su PK generada
            const direccion = await this.repositorioDireccion.insertar(datos.direccion, client)
            const direccionPK = direccion.id
            console.log("Dirección registrada")
            
            const inmueble = {
                clave_catastral: datos.inmueble.clave_catastral,
                direccion: direccionPK,
                dato_registral: datoRegistralPK
            }
            console.log("Datos de inmueble creado")

            const ResultadoInmueble = await this.repositorioInmueble.insertar(inmueble, client)
            
            await client.query('COMMIT') // Confirmar transacción
            return { message: "Inmueble creado con éxito.", data: ResultadoInmueble };
        } catch (error) {
            await client.query('ROLLBACK'); // Deshacer la transacción en caso de error
            console.error("Error en la transacción:", error);
            throw new Error("No se pudo completar la operación. Transacción revertida.");
        } finally {
            client.release(); // Liberar el cliente de la pool
        }
    }

    async getProveedoresSegurosDetails(CC) {
        try {
            // =========== PROVEEDORES ===========
            const joinsProveedor = [
                {type: 'INNER', table: 'proveedor p', on: 'inmueble_proveedor.clave = p.clave'},
            ]

            const filtroProveedor = {
                'inmueble_proveedor.clave_catastral': CC
            }

            const proveedoresList = await this.repositorioInmuebleProveedor.BuscarConJoins(joinsProveedor, filtroProveedor, '', [
                'p.nombre', 'p.telefono', 'p.email', 'p.tipo_servicio'
            ]);

            console.log(`Los proveedores son: ${proveedoresList}`)

            // =========== SEGUROS ===========
            const joinsSeguros = [
                {type: 'INNER', table: 'seguro s', on: 'inmueble_seguro.empresa_seguro = s.empresa_seguro'}
            ]

            const filtroSeguro = {
                'inmueble_seguro.clave_catastral': CC
            }

            const segurosList = await this.repositorioInmuebleSeguro.BuscarConJoins(joinsSeguros, filtroSeguro, '', [
                's.empresa_seguro', 's.tipo_seguro', 's.telefono', 's.email', 's.poliza'
            ])

            console.log(`Los seguros son: ${segurosList}`)

            return {
                'proveedores': proveedoresList,
                'seguros': segurosList
            };

        } catch (error) {
            console.error("Error en la transacción:", error);
            throw new Error("No se pudo completar la operación. Transacción revertida.");
        } 
    }

    async getInmuebleDetails(cif) {
        try {
            const joins = [
                {type: 'INNER', table: 'inmueble i', on: 'empresa_inmueble.clave_catastral = i.clave_catastral'},
                {type: 'INNER', table: 'direccion d', on: 'i.direccion = d.id'},
                {type: 'INNER', table: 'dato_registral dr', on: 'i.dato_registral = dr.id_dr'},
            ]

            const filtro = {
                'empresa_inmueble.cif': cif
            }

            const inmueblesList = await this.repositorioEmpresaInmueble.BuscarConJoins(joins, filtro, '', ['d.calle', 'd.numero', 'd.piso', 
                'd.codigo_postal', 'd.localidad', 'empresa_inmueble.clave_catastral', 'empresa_inmueble.valor_adquisicion', 
                'empresa_inmueble.fecha_adquisicion', 'dr.num_protocolo', 'dr.folio', 'dr.hoja', 'dr.inscripcion', 
                'dr.notario', 'dr.fecha_inscripcion'
            ]);

            return inmueblesList;

        } catch (error) {
            console.error("Error en la transacción:", error);
            throw new Error("No se pudo completar la operación. Transacción revertida.");
        } 
    }
}

export default InmuebleService