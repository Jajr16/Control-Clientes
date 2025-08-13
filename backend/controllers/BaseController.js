export class BaseController {
    constructor(service) {
        this.service = service;
    }

    handleError(error, res, defaultMessage = "Error interno del servidor") {
        console.error(`${this.constructor.name} Error:`, error);
        
        const errorMap = {
            '23505': { status: 409, message: 'Recurso duplicado' },
            '23503': { status: 400, message: 'Referencia inválida' },
            '23502': { status: 400, message: 'Campo requerido faltante' }
        };

        const mappedError = errorMap[error.code];
        if (mappedError) {
            return res.status(mappedError.status).json({ error: mappedError.message });
        }

        return res.status(500).json({ error: defaultMessage });
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