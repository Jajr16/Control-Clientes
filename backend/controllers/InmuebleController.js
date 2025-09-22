import { BaseController } from './BaseController.js';
import InmuebleService from '../services/InmuebleService.js';

class InmuebleController extends BaseController {
    constructor() {
        super(new InmuebleService());
    }

    async insertar(req, res) {
        try {
            const result = await this.service.nuevoInmueble(req.body);
            return this.sendSuccess(res, result, 'Inmueble creado correctamente', 201);
        } catch (error) {
            return this.handleError(error, res, "Error al crear el inmueble");
        }
    }

    async getInmuebleDetails(req, res) {
        try {
            const { cif } = req.params;
            const result = await this.service.getInmuebleDetails(cif);
            return this.sendSuccess(res, result);
        } catch (error) {
            return this.handleError(error, res, "Error al obtener detalles del inmueble");
        }
    }

    async getProveedoresSegurosDetails(req, res) {
        try {
            const { cc } = req.params;
            const result = await this.service.getProveedoresSegurosDetails(cc);
            return this.sendSuccess(res, result);
        } catch (error) {
            return this.handleError(error, res, "Error al obtener proveedores y seguros");
        }
    }

    async getHipotecas(req, res) {
        try {
            const { cc } = req.params;
            const result = await this.service.getHipotecas(cc);
            return this.sendSuccess(res, result);
        } catch (error) {
            return this.handleError(error, res, "Error al obtener hipotecas");
        }
    }
}

export default InmuebleController;