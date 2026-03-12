import { ValidationError } from "../errors/AppError.js";

export const validateSchema = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body, {
            abortEarly: false
        });

        if (error) {
            const fields = {};
            error.details.forEach((d) => {
                const fieldPath = d.path.join(".");
                fields[fieldPath] = d.message;
            });

            next(new ValidationError("Datos inválidos", fields));
        }

        req.body = value;
        next();
    };
};