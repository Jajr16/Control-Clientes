import { BaseController } from './BaseController.js';
import ClienteService from '../services/ClienteService.js';

class ClienteController extends BaseController {
    constructor() {
        super(new ClienteService());
    }

    async createCliente(req, res) {
        try {
            const datosCliente = req.body

            const result = await this.service.crearCliente(datosCliente)
            return this.sendSuccess(res, result, 'Cliente creado correctamente', 201);
        } catch (error) {
            return this.handleError(error, res, "Error al agregar un nuevo cliente")
        }
    }

    async infoClientes(req, res) {
        try {
            const result = await this.service.infoClientes();
            return this.sendSuccess(res, result);
        } catch (error) {
            return this.handleError(error, res, "Error al obtener información de clientes");
        }
    }

    async updateCliente(req, res) {
    try {
        const { cif } = req.params;
        const result = await this.service.updateCliente(cif, req.body);
        return this.sendSuccess(res, result, 'Cliente actualizado correctamente');
    } catch (error) {
        return this.handleError(error, res, "Error al actualizar el cliente");
    }
}

    

}

const clienteController = new ClienteController();
export default clienteController;

export const getInfoClientes = clienteController.infoClientes.bind(clienteController)
export const createCliente = clienteController.createCliente.bind(clienteController)
export const updateCliente = clienteController.updateCliente.bind(clienteController); // ← AGREGAR ESTA LÍNEA
