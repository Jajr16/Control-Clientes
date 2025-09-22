import { BaseController } from './BaseController.js';
import ClienteService from '../services/ClienteService.js';

class ClienteController extends BaseController {
    constructor() {
        super(new ClienteService());
    }

    async getClientes(req, res) {
        try {
            const result = await this.service.getClientes();
            return this.sendSuccess(res, result);
        } catch (error) {
            return this.handleError(error, res, "Error al obtener todos los clientes");
        }
    }

    async getClienteByCif(req, res) {
        try {
            const { cif } = req.params;
            const result = await this.service.getClienteByCif(cif);
            return this.sendSuccess(res, result);
        } catch (error) {
            return this.handleError(error, res, "Error al obtener el cliente");
        }
    }

    async createCliente(req, res) {
        try {
            const { empresa, propietario, direccion, datoRegistral } = req.body;
            
            // Validación básica
            if (!empresa || !empresa.cif || !propietario || !propietario.nie) {
                return this.sendError(res, "Datos básicos del cliente son requeridos", 400);
            }

            const result = await this.service.createCliente({
                empresa,
                propietario,
                direccion,
                datoRegistral
            });
            
            return this.sendSuccess(res, result, 'Cliente creado correctamente', 201);
        } catch (error) {
            return this.handleError(error, res, "Error al crear el cliente");
        }
    }

    async updateCliente(req, res) {
        try {
            const { cif } = req.params;
            const { empresa, propietario, direccion, datoRegistral } = req.body;
            
            const result = await this.service.updateCliente(cif, {
                empresa,
                propietario,
                direccion,
                datoRegistral
            });
            
            return this.sendSuccess(res, result, 'Cliente actualizado correctamente');
        } catch (error) {
            return this.handleError(error, res, "Error al actualizar el cliente");
        }
    }

    async deleteCliente(req, res) {
        try {
            const { cif } = req.params;
            const result = await this.service.deleteCliente(cif);
            return this.sendSuccess(res, result, 'Cliente eliminado correctamente');
        } catch (error) {
            return this.handleError(error, res, "Error al eliminar el cliente");
        }
    }
}

const clienteController = new ClienteController();
export default clienteController;

// Exportar funciones individuales para compatibilidad
export const getClientes = clienteController.getClientes.bind(clienteController);
export const getClienteByCif = clienteController.getClienteByCif.bind(clienteController);
export const createCliente = clienteController.createCliente.bind(clienteController);
export const updateCliente = clienteController.updateCliente.bind(clienteController);
export const deleteCliente = clienteController.deleteCliente.bind(clienteController);