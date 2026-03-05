import { BaseController } from '../../controllers/base.controller.js';
import ClienteService from './cliente.service.js';

class ClienteController extends BaseController {
    constructor() {
        super(new ClienteService());
    }

    async createCliente(req, res, next) {
        try {
            const result = await this.service.crearCliente(req.body)
            return this.sendSuccess(res, result, "Cliente creado correctamente", 201);
        } catch (error) {
            next(error);
        }
    }

    async infoClientes(req, res, next) {
        try {
            const result = await this.service.infoClientes();
            return this.sendSuccess(res, result);
        } catch (error) {
            next(error);
        }
    }

    async updateCliente(req, res, next) {
        try {
            const { cif } = req.params;
            const result = await this.service.updateCliente(cif, req.body);
            return this.sendSuccess(res, result, 'Cliente actualizado correctamente');
        } catch (error) {
            next(error);
        }
    }
}

const clienteController = new ClienteController();
export default clienteController;

export const getInfoClientes = clienteController.infoClientes.bind(clienteController)
export const createCliente = clienteController.createCliente.bind(clienteController)
export const updateCliente = clienteController.updateCliente.bind(clienteController);