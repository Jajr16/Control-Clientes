import { BaseController } from './BaseController.js';
import LiquidacionService from '../services/LiquidacionService.js';
import AdeudoService from '../services/AdeudoService.js';

class LiquidacionController extends BaseController {
    constructor() {
        super(new LiquidacionService());
        this.adeudoService = new AdeudoService();
    }

    async createLiquidacion(req, res) {
        try {
            const { empresa_cif, honorarios_sin_iva } = req.body;

            if (!empresa_cif || !honorarios_sin_iva) {
                return res.status(400).json({ 
                    error: "Los campos empresa_cif y honorarios_sin_iva son obligatorios" 
                });
            }

            if (honorarios_sin_iva <= 0) {
                return res.status(400).json({ 
                    error: "Los honorarios deben ser mayor a 0" 
                });
            }

            // Verificar adeudos pendientes
            const verificacion = await this.adeudoService.verificarAdeudosPendientes(empresa_cif);
            
            if (!verificacion.hay_pendientes) {
                return res.status(400).json({ 
                    error: "No hay adeudos pendientes para liquidar en esta empresa",
                    total_pendientes: verificacion.total_pendientes
                });
            }

            const result = await this.service.crearLiquidacionFinal({
                empresa_cif,
                honorarios_sin_iva: parseFloat(honorarios_sin_iva)
            });

            return this.sendSuccess(res, result, 'Liquidación creada correctamente', 201);
        } catch (error) {
            return this.handleError(error, res, "Error al crear la liquidación");
        }
    }

    async getLiquidacionesByEmpresa(req, res) {
        try {
            const { empresa_cif } = req.params;

            if (!empresa_cif) {
                return res.status(400).json({ 
                    error: "El parámetro empresa_cif es obligatorio" 
                });
            }

            const result = await this.service.obtenerLiquidacionesPorEmpresa(empresa_cif);
            return this.sendSuccess(res, result);
        } catch (error) {
            return this.handleError(error, res, "Error al obtener las liquidaciones");
        }
    }

    async getDetallesLiquidacion(req, res) {
        try {
            const { empresa_cif, num_liquidacion } = req.params;

            if (!empresa_cif || !num_liquidacion) {
                return res.status(400).json({ 
                    error: "Los parámetros empresa_cif y num_liquidacion son obligatorios" 
                });
            }

            const result = await this.service.obtenerDetallesLiquidacion(
                empresa_cif, 
                parseInt(num_liquidacion)
            );
            
            return this.sendSuccess(res, result);
        } catch (error) {
            return this.handleError(error, res, "Error al obtener los detalles de la liquidación");
        }
    }
}

const liquidacionController = new LiquidacionController();
export default liquidacionController;

export const { 
    createLiquidacion, 
    getLiquidacionesByEmpresa, 
    getDetallesLiquidacion 
} = liquidacionController;