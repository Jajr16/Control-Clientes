import { BaseController } from './BaseController.js';
import InmuebleService from '../services/inmuebleService.js';

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

    //CAMBIOS ALE
    async updateSeguro(req, res) {
        try {
        const { cc, empresaSeguro } = req.params;
        const result = await this.service.updateSeguro(cc, empresaSeguro, req.body);
        return this.sendSuccess(res, result, 'Seguro actualizado correctamente');
        } catch (error) {
        return this.handleError(error, res, "Error al actualizar el seguro");
        }
    }

    async updateHipoteca(req, res) {
        try {
        const { cc, idHipoteca } = req.params;
        const result = await this.service.updateHipoteca(cc, idHipoteca, req.body);
        return this.sendSuccess(res, result, 'Hipoteca actualizada correctamente');
        } catch (error) {
        return this.handleError(error, res, "Error al actualizar la hipoteca");
        }   
    }

    async updateProveedor(req, res) {
        try {
        const { cc, nombre } = req.params;
        const result = await this.service.updateProveedor(cc, nombre, req.body);
        return this.sendSuccess(res, result, 'Proveedor actualizado correctamente');
        } catch (error) {
        return this.handleError(error, res, "Error al actualizar el proveedor");
        }   
    }

    async updateDatosRegistrales(req, res) {
        try {
        const { cc } = req.params;
        const result = await this.service.updateDatosRegistrales(cc, req.body);
        return this.sendSuccess(res, result, 'Datos registrales actualizados correctamente');
        } catch (error) {
        return this.handleError(error, res, "Error al actualizar los datos registrales");
        }
    }


// ========== ACTUALIZAR INMUEBLE ==========
async updateInmueble(req, res) {
    try {
        const { claveCatastral } = req.params;
        const result = await this.service.updateInmueble(claveCatastral, req.body);
        return this.sendSuccess(res, result, 'Inmueble actualizado correctamente');
    } catch (error) {
        return this.handleError(error, res, "Error al actualizar el inmueble");
    }
}

    // ========== ELIMINAR INMUEBLE ==========
      async deleteInmueble(req, res) {
        try {
            const { claveCatastral } = req.params;
            
            // Opcional: aún permitir CIF manual
            let cif = req.body?.cif || req.query?.cif;

            const result = await this.service.deleteInmueble(claveCatastral, cif);
            return this.sendSuccess(res, result, 'Inmueble eliminado correctamente');
        } catch (error) {
            return this.handleError(error, res, "Error al eliminar el inmueble");
        }
    }

    // ========== ELIMINAR SEGURO ==========
    async deleteSeguro(req, res) {
        try {
            const { cc, empresaSeguro } = req.params;
            const result = await this.service.deleteSeguro(cc, empresaSeguro);
            return this.sendSuccess(res, result, 'Seguro eliminado correctamente');
        } catch (error) {
            return this.handleError(error, res, "Error al eliminar el seguro");
        }
    }

    // ========== ELIMINAR PROVEEDOR ==========
    async deleteProveedor(req, res) {
        try {
            const { cc, nombre } = req.params;
            const result = await this.service.deleteProveedor(cc, nombre);
            return this.sendSuccess(res, result, 'Proveedor eliminado correctamente');
        } catch (error) {
            return this.handleError(error, res, "Error al eliminar el proveedor");
        }
    }

    // ========== ELIMINAR HIPOTECA ==========
    async deleteHipoteca(req, res) {
        try {
            const { cc, idHipoteca } = req.params;
            const result = await this.service.deleteHipoteca(cc, idHipoteca);
            return this.sendSuccess(res, result, 'Hipoteca eliminada correctamente');
        } catch (error) {
            return this.handleError(error, res, "Error al eliminar la hipoteca");
        }
    }  
}

export default InmuebleController;