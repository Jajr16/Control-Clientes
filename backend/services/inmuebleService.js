import Repositorio from '../repositories/globalPersistence.js'

/**
 * Clase para crear el servicio de la tabla Inmueble la cuál se comunicará directamente con el repositorio (capa de persistencia) para realizar operaciones SQL
 */
class InmuebleService {
    constructor() {
        this.repositorio = new Repositorio('inmueble', 'clave_catastral')
    }

    /**
     * Método para agregar nuevos registros a la tabla Inmueble
     * 
     * @param {*} datos Datos que se usarán para guardar un nuevo registro en la tabla Inmueble
     * @returns Respuesta del reporsitorio (Respuesta SQL)
     */
    async nuevoInmueble(datos) {
        return await this.repositorio.insertar(datos);
    }
}

export default InmuebleService