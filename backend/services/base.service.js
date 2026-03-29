import { pool } from '../config/db.js';
import { ConflictError, NotFoundError } from '../errors/AppError.js';
import { QueryBuilder } from '../utils/queryBuilder.js';

export class BaseService {
    constructor(repositories = {}) {
        this.repositories = repositories;
    }

    async withTransaction(callback) {
        const client = await pool.connect();

        try {
            await client.query('BEGIN');
            const result = await callback(client);
            await client.query('COMMIT');
            return result;
        } catch (error) {
            await client.query('ROLLBACK');
            console.error(`${this.constructor.name} Transaction error:`, error);
            throw error;
        } finally {
            client.release();
        }
    }

    async execWithClient(callback, client) {
        if (client) {
            return await callback(client);
        } else {
            return await this.withTransaction(callback);
        }
    }

    // CRUDS
    async crear(repoName, idObject, data, client = null) {
        const repo = this.repositories[repoName]

        console.log("AQUÍ ES")
        console.log(idObject)
        const existe = await repo.ExistePorId(idObject, client)
        if (existe) throw new ConflictError("Ya existe un recurso con esos datos")

        return await this.repositories[repoName].insertar(data, client);
    }

    async crearAuto(repoName, data, client = null) {
        return await this.repositories[repoName].insertar(data, client);
    }

    async actualizar(repoName, idObject, data, client = null) {
        const repo = this.repositories[repoName]

        const existe = await repo.ExistePorId(idObject, client)
        if (!existe) throw new NotFoundError(`${repoName} no encontrado.`)

        const llaveCambiada = Object.keys(idObject).some(
            key => data.hasOwnProperty(key) && data[key] !== idObject[key]
        );

        if (llaveCambiada) {
            const nuevaLlave = {}

            for (const key of Object.keys(idObject)) {
                nuevaLlave[key] = data.hasOwnProperty(key) ? data[key] : idObject[key];
            }
            const existeNuevo = await repo.ExistePorId(nuevaLlave, client)
            if (existeNuevo) throw new ConflictError("Ya existe un registro como el que intentas agregar")
        }

        return await repo.actualizarPorId(idObject, data, client);
    }

    async eliminar(repoName, idObject, client = null) {
        const repo = this.repositories[repoName];

        const existe = await repo.ExistePorId(idObject, client);
        if (!existe) throw new NotFoundError(`${repoName} no encontrado`);

        return await repo.eliminarPorId(idObject, client);
    }

    async validarExistencia(repoName, condiciones, client = null) {
        const repo = this.repositories[repoName];
        const qb = new QueryBuilder(repo.tabla);

        for (const [col, val] of Object.entries(condiciones)) qb.where(col, val);

        const { query, params } = qb.build();
        const existente = await repo.ejecutarQuery(query, params, client);

        if (existente.length > 0) throw new ConflictError(`Ya existe un registro con esos datos en ${repo.tabla}`);
    }

    async consultar(repoName, query, valores, client = null) {
        const repo = this.repositories[repoName];

        const rows = repo.ejecutarQuery(query, valores, client);
        return rows;
    }
}