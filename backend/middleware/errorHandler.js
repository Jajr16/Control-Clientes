// middleware/errorHandler.js
import logger from '../config/logger.js';

export const errorHandler = async (err, req, res, next) => {

    const status = err.isOperational ? err.statusCode : 500;
    console.log(err)
    logger.error({
        message: err.message,
        stack: err.stack,
        url: req.originalUrl,
        user: req.user?.username,
        level: status === 500 ? 'error' : 'warn'
    });

    if (err.isOperational) {
        return res.status(err.statusCode).json({
            success: false,
            error: err.error || "API_ERROR",
            message: err.message,
            fields: err.fields || null,
            timestamp: new Date().toISOString()
        });
    }

    /*
    ERRORES DE POSTGRES
    */
    const errorMap = {
        '23505': { status: 409, message: 'Recurso duplicado', error: 'CONFLICT_ERROR' },
        '23503': { status: 400, message: 'Relación inválida', error: 'RELATION_ERROR' },
        '23502': { status: 400, message: 'Campo requerido faltante', error: 'VALIDATION_ERROR' }
    };

    if (err.code && errorMap[err.code]) {
        const mapped = errorMap[err.code];
        return res.status(mapped.status).json({
            success: false,
            error: mapped.error,
            message: mapped.message,
            timestamp: new Date().toISOString()
        });
    }

    /*
    ERROR DESCONOCIDO
    */
    return res.status(500).json({
        success: false,
        error: "INTERNAL_SERVER_ERROR",
        message: "Error interno del servidor",
        timestamp: new Date().toISOString()
    });
};