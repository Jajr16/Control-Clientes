import { pool } from '../config/db.js';

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
}