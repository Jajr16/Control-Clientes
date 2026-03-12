export class AppError extends Error {
    constructor(message, statusCode = 500, error = "API_ERROR", fields = null) {
        super(message);

        this.statusCode = statusCode;
        this.error = error;
        this.fields = fields;
        this.isOperational = true;
    }
}

export class ValidationError extends AppError {
    constructor(message = "Datos inválidos", fields = null) {
        super(message, 400, "VALIDATION_ERROR", fields);
    }
}

export class NotFoundError extends AppError {
    constructor(message = "Recurso no encontrado") {
        super(message, 404, "NOT_FOUND_ERROR");
    }
}

export class ConflictError extends AppError {
    constructor(message = "Conflicto de recurso") {
        super(message, 409, "CONFLICT_ERROR");
    }
}

export class UnauthorizedError extends AppError {
    constructor(message = "No autorizado") {
        super(message, 401, "UNAUTHORIZED_ERROR");
    }
}