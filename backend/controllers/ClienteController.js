import { BaseController } from './BaseController.js';
import ClienteService from '../services/ClienteService.js';

class ClienteController extends BaseController {
    constructor() {
        super(new ClienteService());
    }

    async infoClientes(req, res) {
        try {
            const result = await this.service.infoClientes();
            return this.sendSuccess(res, result);
        } catch (error) {
            return this.handleError(error, res, "Error al obtener información de clientes");
        }
    }
}

const clienteController = new ClienteController();
export default clienteController;

export const getInfoClientes = clienteController.infoClientes.bind(clienteController)