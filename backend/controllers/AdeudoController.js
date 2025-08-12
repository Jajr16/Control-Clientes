// controllers/AdeudoController.js - ACTUALIZADO
import { 
    insertarAdeudoCompleto, 
    obtenerTodosAdeudosPorEmpresa,
    obtenerAdeudosPendientes,
    verificarAdeudosPendientes
} from "../services/AdeudoService.js";

export const getAdeudosByEmpresa = async (req, res) => {
  try {
    const { empresa_cif } = req.params;
    const adeudos = await obtenerTodosAdeudosPorEmpresa(empresa_cif);
    
    // Agregar información adicional en la respuesta
    const pendientes = adeudos.filter(a => a.estado === 'PENDIENTE').length;
    const liquidados = adeudos.filter(a => a.estado === 'LIQUIDADO').length;
    
    return res.status(200).json({
      adeudos,
      resumen: {
        total: adeudos.length,
        pendientes,
        liquidados
      }
    });
  } catch (error) {
    console.error("Error en getAdeudosByEmpresa:", error);
    return res.status(500).json({ error: "Error al obtener los adeudos." });
  }
};

// NUEVO ENDPOINT: Solo adeudos pendientes
export const getAdeudosPendientesByEmpresa = async (req, res) => {
  try {
    const { empresa_cif } = req.params;
    const adeudosPendientes = await obtenerAdeudosPendientes(empresa_cif);
    
    return res.status(200).json({
      adeudos: adeudosPendientes,
      resumen: {
        total_pendientes: adeudosPendientes.length
      }
    });
  } catch (error) {
    console.error("Error en getAdeudosPendientesByEmpresa:", error);
    return res.status(500).json({ error: "Error al obtener los adeudos pendientes." });
  }
};

// NUEVO ENDPOINT: Verificar si hay adeudos pendientes
export const checkAdeudosPendientes = async (req, res) => {
  try {
    const { empresa_cif } = req.params;
    const verificacion = await verificarAdeudosPendientes(empresa_cif);
    
    return res.status(200).json(verificacion);
  } catch (error) {
    console.error("Error en checkAdeudosPendientes:", error);
    return res.status(500).json({ error: "Error al verificar adeudos pendientes." });
  }
};

export const createAdeudo = async (req, res) => {
    try {
        const { adeudo, protocolo, ajuste } = req.body;

        // Validar que el adeudo no tenga num_liquidacion (debe ser null para nuevos adeudos)
        if (adeudo.num_liquidacion !== undefined && adeudo.num_liquidacion !== null) {
            console.log("Removiendo num_liquidacion del nuevo adeudo - debe crearse como PENDIENTE");
            delete adeudo.num_liquidacion;
        }

        const resultado = await insertarAdeudoCompleto({ adeudo, protocolo, ajuste });
        
        res.status(201).json({ 
            message: 'Adeudo creado correctamente como PENDIENTE', 
            data: resultado 
        });
    } catch (error) {
        console.error('Error en createAdeudo:', error);

        if (error.code === '23505') {
            return res.status(409).json({ error: 'Ya existe un adeudo con ese número de factura.' });
        }

        res.status(500).json({ error: 'Error al guardar el adeudo' });
    }
};