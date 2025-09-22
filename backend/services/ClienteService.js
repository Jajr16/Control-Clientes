import { BaseService } from './BaseService.js';
import Repositorio from "../repositories/globalPersistence.js";
import { pool } from "../config/db.js";
import formatDate from '../validations/formatDate.js';

class ClienteService extends BaseService {
    constructor() {
        super({
            empresa: new Repositorio("empresa", "cif"),
            propietario: new Repositorio("propietario", "nie"),
            direccion: new Repositorio("direccion", "id"),
            datoRegistral: new Repositorio("dato_registral", "id_dr")
        });
    }

    async getClientes() {
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
            console.error("Error al obtener clientes:", error);
            throw new Error("No se pudo obtener los clientes");
        }
    }

    async getClienteByCif(cif) {
        try {
            return await this.repositories.empresa.BuscarPorId(cif);
        } catch (error) {
            console.error("Error al obtener cliente por CIF:", error);
            throw new Error("No se pudo obtener el cliente");
        }
    }

    async createCliente(clienteData) {
        let connection;
        try {
            connection = await pool.getConnection();
            await connection.beginTransaction();

            const { empresa, propietario, direccion, datoRegistral } = clienteData;

            // 1. Insertar dirección
            const direccionInsertada = await this.repositories.direccion.Insertar(direccion, connection);
            
            // 2. Insertar propietario
            const propietarioInsertado = await this.repositories.propietario.Insertar(propietario, connection);
            
            // 3. Insertar dato registral
            const datoRegistralInsertado = await this.repositories.datoRegistral.Insertar(datoRegistral, connection);
            
            // 4. Preparar empresa con las referencias
            const empresaCompleta = {
                ...empresa,
                direccion: direccionInsertada.insertId || direccionInsertada.id,
                propietario: propietario.nie,
                dato_registral: datoRegistralInsertado.insertId || datoRegistralInsertado.id_dr
            };
            
            // 5. Insertar empresa
            const result = await this.repositories.empresa.Insertar(empresaCompleta, connection);
            
            await connection.commit();
            return result;
            
        } catch (error) {
            if (connection) await connection.rollback();
            console.error("Error detallado al crear cliente:", error);
            throw new Error("No se pudo agregar el cliente: " + error.message);
        } finally {
            if (connection) connection.release();
        }
    }

    async updateCliente(cif, cambios) {
        try {
            // Implementar lógica de actualización similar a createCliente
            // pero con transacción y updates en lugar de inserts
            return await this.repositories.empresa.Actualizar(cif, cambios);
        } catch (error) {
            console.error("Error al actualizar cliente:", error);
            throw new Error("No se pudo actualizar el cliente");
        }
    }

    async deleteCliente(cif) {
        try {
            return await this.repositories.empresa.Eliminar(cif);
        } catch (error) {
            console.error("Error al eliminar cliente:", error);
            throw new Error("No se pudo eliminar el cliente");
        }
    }
}

export default ClienteService;