// middleware/errorHandler.js
import logger from '../config/logger.js';

export const errorHandler = async (err, req, res, next) => {
    const status = err.isOperational ? err.statusCode : 500;

    // Logueo siempre (nivel error si es inesperado)
    logger.error({
        message: err.message,
        stack: err.stack,
        url: req.originalUrl,
        user: req.user?.username,
        level: status === 500 ? 'error' : 'warn'
    });

    // Errores PostgreSQL
    const errorMap = {
        '23505': { status: 409, message: 'Recurso duplicado' },
        '23503': { status: 400, message: 'Relación inválida' },
        '23502': { status: 400, message: 'Campo requerido faltante' }
    };

    if (err.code && errorMap[err.code]) {
        const mapped = errorMap[err.code];
        return res.status(mapped.status).json({
            success: false,
            message: mapped.message,
            timestamp: new Date().toISOString()
        });
    }

    // Error general
    res.status(status).json({
        success: false,
        message: status === 500
            ? 'Error interno del servidor'
            : err.message,
        timestamp: new Date().toISOString()
    });
};