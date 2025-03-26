import Repositorio from "../repositories/globalPersistence.js";
import { pool } from "../config/db.js";

/**
 * Clase para crear el servicio de la tabla Inmueble la cuál se comunicará directamente con el repositorio (capa de persistencia) para realizar operaciones SQL
 */
class ClienteService {
    constructor() {
        this.repositorioPropietario = new Repositorio("empresa", "cif")
    }

    async infoClientes() {
        const joins = [
            {type: 'INNER', table: 'propietario p', on: 'empresa.propietario = p.nie'},
            {type: 'INNER', table: 'direccion d', on: 'empresa.direccion = d.id'},
            {type: 'INNER', table: 'dato_registral dr', on: 'dato_registral = dr.id_dr'},
        ]

        const resultados = await this.repositorioPropietario.BuscarConJoins(joins, {}, '', ['empresa.clave', 'empresa.cif', 'empresa.nombre',
            'p.nie', "CONCAT(p.nombre, ' ', p.apellido_p, ' ', p.apellido_m) AS propietario", 'p.telefono', 'p.email', 'd.calle', 'd.numero', 'd.piso',
            'd.codigo_postal', 'd.localidad', 'dr.num_protocolo', 'dr.folio', 'dr.hoja', 'dr.inscripcion', 'dr.notario', 'dr.fecha_inscripcion'
        ]);
        
        return resultados; 
    }
}

export default ClienteService