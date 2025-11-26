import { handleError as globalHandleError } from '../config/handleErrors.js';
export class BaseController {
    constructor(service) {
        this.service = service;
    }

    async handleError(error, res, defaultMessage = "Error interno del servidor") {
        await globalHandleError(error);

        console.error(`${this.constructor.name} Error:`, error);
        
        const errorMap = {
            '23505': { status: 409, message: 'Recurso duplicado' },
            '23503': { status: 400, message: 'Clave Catastral inválida' },
            '23502': { status: 400, message: 'Campo requerido faltante' }
        };
        
        const mappedError = errorMap[error.code];
        if (mappedError) {
            return res.status(mappedError.status).json({ error: mappedError.message });
        }
        
        return res.status(500).json({ error: error.message || defaultMessage });
    }

    sendSuccess(res, data, message = "Operación exitosa", status = 200) {
        return res.status(status).json({
            success: true,
            message,
            data,
            timestamp: new Date().toISOString()
        });
    }
}