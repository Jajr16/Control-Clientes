export class BaseController {
    constructor(service) {
        this.service = service;
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