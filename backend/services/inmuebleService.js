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
}

export default InmuebleService