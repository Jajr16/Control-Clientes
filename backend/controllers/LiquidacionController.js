// controllers/LiquidacionController.js
import { 
    crearLiquidacionFinal, 
    obtenerLiquidacionesPorEmpresa, 
    obtenerDetallesLiquidacion 
} from "../services/LiquidacionService.js";
import { verificarAdeudosPendientes } from "../services/AdeudoService.js";

export const createLiquidacion = async (req, res) => {
    try {
        const { empresa_cif, honorarios_sin_iva } = req.body;

        // Validar datos requeridos
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

        // Verificar que hay adeudos pendientes
        const verificacion = await verificarAdeudosPendientes(empresa_cif);
        
        if (!verificacion.hay_pendientes) {
            return res.status(400).json({ 
                error: "No hay adeudos pendientes para liquidar en esta empresa",
                total_pendientes: verificacion.total_pendientes
            });
        }

        console.log(`Creando liquidación para ${verificacion.total_pendientes} adeudos pendientes`);

        const resultado = await crearLiquidacionFinal({
            empresa_cif,
            honorarios_sin_iva: parseFloat(honorarios_sin_iva)
        });

        res.status(201).json(resultado);
    } catch (error) {
        console.error('Error en createLiquidacion:', error);

        if (error.code === '23505') {
            return res.status(409).json({ 
                error: 'Ya existe una liquidación con esos datos.' 
            });
        }

        if (error.code === '23503') {
            return res.status(400).json({ 
                error: 'La empresa especificada no existe.' 
            });
        }

        res.status(500).json({ 
            error: 'Error interno del servidor al crear la liquidación' 
        });
    }
};

export const getLiquidacionesByEmpresa = async (req, res) => {
    try {
        const { empresa_cif } = req.params;

        if (!empresa_cif) {
            return res.status(400).json({ 
                error: "El parámetro empresa_cif es obligatorio" 
            });
        }

        const liquidaciones = await obtenerLiquidacionesPorEmpresa(empresa_cif);
        
        res.status(200).json(liquidaciones);
    } catch (error) {
        console.error("Error en getLiquidacionesByEmpresa:", error);
        res.status(500).json({ 
            error: "Error al obtener las liquidaciones." 
        });
    }
};

export const getDetallesLiquidacion = async (req, res) => {
    try {
        const { empresa_cif, num_liquidacion } = req.params;

        if (!empresa_cif || !num_liquidacion) {
            return res.status(400).json({ 
                error: "Los parámetros empresa_cif y num_liquidacion son obligatorios" 
            });
        }

        const detalles = await obtenerDetallesLiquidacion(
            empresa_cif, 
            parseInt(num_liquidacion)
        );
        
        res.status(200).json(detalles);
    } catch (error) {
        console.error("Error en getDetallesLiquidacion:", error);
        res.status(500).json({ 
            error: "Error al obtener los detalles de la liquidación." 
        });
    }
};