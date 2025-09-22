import { BaseService } from './BaseService.js';
import Repositorio from "../repositories/globalPersistence.js";

class ClienteService extends BaseService {
    constructor() {
        super({
            empresa: new Repositorio("empresa", "cif")
        });
    }

    async infoClientes() {
        try {
            const joins = [
                { type: 'INNER', table: 'propietario p', on: 'empresa.propietario = p.nie' },
                { type: 'INNER', table: 'direccion d', on: 'empresa.direccion = d.id' },
                { type: 'INNER', table: 'dato_registral dr', on: 'empresa.dato_registral = dr.id_dr' }
            ];

            const columnas = [
                'empresa.clave', 'empresa.cif', 'empresa.nombre', 'p.nie', 
                'p.nombre AS propietario', 'p.telefono', 'p.email', 
                'd.calle', 'd.numero', 'd.piso', 'd.codigo_postal', 'd.localidad',
                'dr.num_protocolo', 'dr.folio', 'dr.hoja', 'dr.inscripcion', 
                'dr.notario', 'dr.fecha_inscripcion'
            ];

            return await this.repositories.empresa.BuscarConJoins(joins, {}, 'AND', columnas);
        } catch (error) {
            console.error("Error al obtener información de clientes:", error);
            throw new Error("No se pudo obtener la información de los clientes");
        }
    }
}

export default ClienteService;