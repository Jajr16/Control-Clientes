import { BaseService } from './BaseService.js';
import Repositorio from "../repositories/globalPersistence.js";
import { pool } from "../config/db.js";
import formatDate from '../validations/formatDate.js';

const toDireccionDB = (direccion) => {
  if (!direccion) return {};
  // allow-list de columnas REALES en la tabla direccion
  const out = {
    calle: direccion.calle ?? null,
    numero: direccion.numero ?? null,
    piso: direccion.piso ?? null,
    localidad: direccion.localidad ?? null,
    codigo_postal: direccion.cp ?? direccion.codigo_postal ?? null,
  };

  // elimina claves undefined para que no intenten insertarse
  Object.keys(out).forEach(k => out[k] === undefined && delete out[k]);
  return out;
};

const toDatoRegistralDB = (dr) => {
  if (!dr) return {};
  return {
    // usa num_protocolo; si por error llega n_protocolo, lo mapeamos
    num_protocolo: dr.num_protocolo ?? dr.n_protocolo ?? null,
    folio: dr.folio ?? null,
    hoja: dr.hoja ?? null,
    inscripcion: dr.inscripcion ?? null,
    notario: dr.notario ?? null,
    // normaliza fecha si es necesario (yyyy-mm-dd)
    fecha_inscripcion: dr.fecha_inscripcion
      ? formatDate(dr.fecha_inscripcion)
      : null,
  };
};

const toEmpresaDB = (e) => {
  if (!e) return {};
  return {
    clave: e.clave ?? null,
    cif: e.cif ?? null,
    nombre: e.nombre ?? null,
    telefono: e.tel ?? e.telefono ?? null,
  };
};

class ClienteService extends BaseService {
    constructor() {
        // Pasar todos los repositorios necesarios al constructor padre
        super({
            empresa: new Repositorio("empresa", "cif"),
            propietario: new Repositorio("propietario", "nie"),
            direccion: new Repositorio("direccion", "id"),
            datoRegistral: new Repositorio("dato_registral", "id_dr")
        });

        // Verificar que todos los repositorios se inicializaron correctamente
        console.log("Repositorios inicializados:", Object.keys(this.repositories));
        for (const [key, repo] of Object.entries(this.repositories)) {
            console.log(`${key} tiene método Insertar:`, typeof repo.Insertar === 'function');
        }
    }

    async getClientes() {
        try {
            const joins = [
                { type: 'INNER', table: 'propietario p', on: 'empresa.propietario = p.nie' },
                { type: 'INNER', table: 'direccion d', on: 'empresa.direccion = d.id' },
                { type: 'INNER', table: 'dato_registral dr', on: 'empresa.dato_registral = dr.id_dr' }
            ];
            const columnas = [
                'empresa.clave', 'empresa.cif', 'empresa.nombre', 'empresa.telefono AS tel', 'p.nie',
                'p.nombre AS propietario', 'p.telefono', 'p.email',
                'd.calle', 'd.numero', 'd.piso', 'd.codigo_postal AS cp', 'd.localidad',
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
        return await this.repositories.empresa.ObtenerPorId({ cif });
        } catch (error) {
        console.error("Error al obtener cliente por CIF:", error);
        throw new Error("No se pudo obtener el cliente");
        }
    }

    async createCliente(clienteData) {
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            const { empresa, propietario, direccion, datoRegistral } = clienteData;

            const direccionDB = toDireccionDB(direccion);
            const datoRegistralDB = toDatoRegistralDB(datoRegistral);

            console.log("Insertando dirección...");
            const direccionInsertada = await this.repositories.direccion.insertar(direccionDB, client);
            console.log("Dirección insertada:", direccionInsertada);

            console.log("Insertando propietario...");
            const propietarioInsertado = await this.repositories.propietario.insertar(propietario, client);
            console.log("Propietario insertado:", propietarioInsertado);

            console.log("Insertando dato registral...");
            const datoRegistralInsertado = await this.repositories.datoRegistral.insertar(datoRegistralDB, client);
            console.log("Dato registral insertado:", datoRegistralInsertado);

            // Preparar empresa con las referencias
            const empresaCompleta = {
                ...toEmpresaDB(empresa),
                direccion: direccionInsertada.id,
                propietario: propietario.nie,
                dato_registral: datoRegistralInsertado.id_dr,
            };

            console.log("Insertando empresa...");
            const result = await this.repositories.empresa.insertar(empresaCompleta, client);
            console.log("Empresa insertada:", result);

            await client.query('COMMIT');
            return result;

        } catch (error) {
            await client.query('ROLLBACK');
            console.error("Error detallado al crear cliente:", error);
            throw new Error("No se pudo agregar el cliente: " + error.message);
        } finally {
            client.release();
        }
    }

    async updateCliente(cif, cambios) {
        return await this.withTransaction(async (client) => {
            const { empresa, propietario, direccion, datoRegistral } = cambios;

            // Si se proporcionan entidades relacionadas, actualizarlas
            if (direccion && empresa.direccion) {
                await this.repositories.direccion.actualizarPorId({ id: empresa.direccion }, direccion, client);
            }

            if (propietario && empresa.propietario) {
                await this.repositories.propietario.actualizarPorId({ nie: empresa.propietario }, propietario, client);
            }

            if (datoRegistral && empresa.dato_registral) {
                await this.repositories.datoRegistral.actualizarPorId({ id_dr: empresa.dato_registral }, datoRegistral, client);
            }

            // Actualizar empresa
            return await this.repositories.empresa.actualizarPorId({ cif }, empresa, client);
        });
    }

    async deleteCliente(cif) {
        return await this.withTransaction(async (client) => {
            // Primero obtener la empresa para tener las referencias
            const empresa = await this.repositories.empresa.ObtenerPorId({ cif }, client);

            // Eliminar en orden inverso
            const result = await this.repositories.empresa.eliminarPorId({ cif }, client);

            if (empresa.dato_registral) {
                await this.repositories.datoRegistral.eliminarPorId({ id_dr: empresa.dato_registral }, client);
            }

            if (empresa.direccion) {
                await this.repositories.direccion.eliminarPorId({ id: empresa.direccion }, client);
            }

            return result;
        });
    }
}

export default ClienteService;