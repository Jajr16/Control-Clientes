import { BaseController } from '../../controllers/base.controller.js';
import InmuebleService from './inmueble.service.js';
import { InmuebleDTO } from './inmueble.dto.js';

class InmuebleController extends BaseController {
    constructor() {
        super(new InmuebleService());
    }

    async crearInmueble(req, res, next) {
        try {
            const result = await this.service.crearInmueble(req.body);
            return this.sendSuccess(res, result, 'Inmueble creado correctamente', 201);
        } catch (error) {
            next(error)
        }
    }

    async obtenerInmueblesEmpresa(req, res, next) {
        try {
            const { cif } = req.params
            const result = await this.service.obtenerInmueblesEmpresa(cif)
            return this.sendSuccess(res, InmuebleDTO.detallesInmuebles(result))
        } catch (error) {
            next(error)
        }
    }

    async actualizarInmueble(req, res, next) {
        try {
            const { claveCatastral } = req.params;
            const result = await this.service.actualizarInmueble(claveCatastral, req.body);
            return this.sendSuccess(res, result, 'Inmueble actualizado correctamente');
        } catch (error) {
            next(error)
        }
    }

    async eliminarInmueble(req, res, next) {
        try {
            const { claveCatastral } = req.params;
            const result = await this.service.eliminarInmueble(claveCatastral);
            return this.sendSuccess(res, result, 'Inmueble eliminado correctamente')
        } catch (error) {
            next(error)
        }
    }

}

const inmuebleController = new InmuebleController();
export default inmuebleController;

export const crearInmueble = inmuebleController.crearInmueble.bind(inmuebleController)
export const actualizarInmueble = inmuebleController.actualizarInmueble.bind(inmuebleController)
export const obtenerInmueblesEmpresa = inmuebleController.obtenerInmueblesEmpresa.bind(inmuebleController)
export const eliminarInmueble = inmuebleController.eliminarInmueble.bind(inmuebleController);