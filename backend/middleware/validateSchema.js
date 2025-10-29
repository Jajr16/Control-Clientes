export const validateSchema = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body, { abortEarly: false });
        
        if (error) {
            return res.status(400).json({
                message: "Datos inválidos",
                details: error.details.map(d => ({
                    path: d.path,
                    message: d.message,
                    type: d.type
                }))
            });
        }
        req.body = value
        next();
    }
}