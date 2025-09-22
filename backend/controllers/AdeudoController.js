import { BaseController } from './BaseController.js';
import AdeudoService from '../services/AdeudoService.js';

class AdeudoController extends BaseController {
  constructor() {
    super(new AdeudoService());
  }

  async getAdeudosByEmpresa(req, res) {
    try {
      const { empresa_cif } = req.params;
      const { incluir_liquidados = 'true', agrupado = 'false' } = req.query;

      let result;

      if (agrupado === 'true') {
        // Nueva funcionalidad agrupada por liquidaciones
        result = await this.service.obtenerTodosAdeudosPorEmpresaAgrupados(empresa_cif);
      } else {
        // Funcionalidad original
        result = incluir_liquidados === 'true'
          ? await this.service.obtenerTodosAdeudosPorEmpresa(empresa_cif)
          : await this.service.obtenerAdeudosPendientes(empresa_cif);
      }

      return this.sendSuccess(res, result);
    } catch (error) {
      return this.handleError(error, res, "Error al obtener los adeudos");
    }
  }

  async getAdeudosPendientes(req, res) {
    try {
      const { empresa_cif } = req.params;
      const result = await this.service.obtenerAdeudosPendientes(empresa_cif);
      return this.sendSuccess(res, result);
    } catch (error) {
      return this.handleError(error, res, "Error al obtener adeudos pendientes");
    }
  }

  async checkAdeudosPendientes(req, res) {
    try {
      const { empresa_cif } = req.params;
      const result = await this.service.verificarAdeudosPendientes(empresa_cif);
      return this.sendSuccess(res, result);
    } catch (error) {
      return this.handleError(error, res, "Error al verificar adeudos pendientes");
    }
  }

  async createAdeudo(req, res) {
    try {
      const { adeudo, protocolo } = req.body;

      // Validaciones mínimas por esquema actual (PK exige num_factura)
      if (!adeudo?.empresa_cif) return res.status(400).json({ error: 'empresa_cif es requerido' });
      if (!adeudo?.proveedor)   return res.status(400).json({ error: 'proveedor es requerido' });
      if (!adeudo?.concepto)    return res.status(400).json({ error: 'concepto es requerido' });
      if (!adeudo?.ff)          return res.status(400).json({ error: 'ff es requerida' });
      if (adeudo?.importe == null || isNaN(Number(adeudo.importe))) {
        return res.status(400).json({ error: 'importe numérico es requerido' });
      }
      if (!adeudo?.num_factura) {
        return res.status(400).json({ error: 'num_factura es requerido (PK en adeudo)' });
      }

      const result = await this.service.crearAdeudoNormal({ adeudo, protocolo });
      return this.sendSuccess(res, result, 'Adeudo creado correctamente', 201);
    } catch (error) {
      return this.handleError(error, res, "Error al crear el adeudo");
    }
  }

  // ========== MEJORADO: crearEntradaRmmPendiente ==========
async crearEntradaRmmPendiente(req, res) {
  try {
    console.log('📥 Datos recibidos para crear entrada RMM:', req.body);
    
    const { 
      num_entrada, 
      empresa_cif, 
      anticipo_pagado = 200, 
      fecha_anticipo, 
      diferencia, 
      fecha_devolucion_diferencia 
    } = req.body;

    // Validaciones básicas
    if (!num_entrada?.trim()) {
      return res.status(400).json({ 
        error: 'num_entrada es requerido y no puede estar vacío' 
      });
    }

    if (!empresa_cif?.trim()) {
      return res.status(400).json({ 
        error: 'empresa_cif es requerido y no puede estar vacío' 
      });
    }

    if (!fecha_anticipo) {
      return res.status(400).json({ 
        error: 'fecha_anticipo es requerida' 
      });
    }

    // Validar formato de fecha
    const fechaRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!fechaRegex.test(fecha_anticipo)) {
      return res.status(400).json({ 
        error: 'fecha_anticipo debe estar en formato YYYY-MM-DD' 
      });
    }

    const datosLimpios = {
      num_entrada: num_entrada.trim(),
      empresa_cif: empresa_cif.trim(),
      anticipo_pagado: Number(anticipo_pagado) || 200,
      fecha_anticipo,
      diferencia: diferencia ? Number(diferencia) : null,
      fecha_devolucion_diferencia: fecha_devolucion_diferencia || null
    };

    console.log('🔧 Datos procesados:', datosLimpios);

    const result = await this.service.crearEntradaRmmPendiente(datosLimpios);

    return this.sendSuccess(res, result, 'Entrada RMM pendiente creada exitosamente', 201);
  } catch (error) {
    console.error('❌ Error en crearEntradaRmmPendiente:', error);
    
    // Manejo específico de errores comunes
    if (error.message.includes('Ya existe')) {
      return res.status(409).json({ error: error.message });
    }
    
    if (error.message.includes('validación')) {
      return res.status(400).json({ error: error.message });
    }

    return this.handleError(error, res, "Error al crear entrada RMM pendiente");
  }
}

// ========== MEJORADO: finalizarRmm ==========
async finalizarRmm(req, res) {
  try {
    console.log('📥 Datos recibidos para finalizar RMM:', req.body);
    
    const { 
      empresa_cif, 
      num_entrada, 
      num_factura_final, 
      ff, 
      concepto = 'Inscripción Registro Mercantil',
      proveedor = 'Registro Mercantil de Madrid',
      importe, 
      protocolo 
    } = req.body;

    // Validaciones básicas
    const camposRequeridos = {
      empresa_cif: 'CIF de empresa',
      num_entrada: 'Número de entrada',
      num_factura_final: 'Número de factura final',
      ff: 'Fecha de factura'
    };

    for (const [campo, descripcion] of Object.entries(camposRequeridos)) {
      if (!req.body[campo]?.toString().trim()) {
        return res.status(400).json({ 
          error: `${descripcion} es requerido y no puede estar vacío` 
        });
      }
    }

    // Validar formato de fecha
    const fechaRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!fechaRegex.test(ff)) {
      return res.status(400).json({ 
        error: 'ff debe estar en formato YYYY-MM-DD' 
      });
    }

    const datosLimpios = {
      empresa_cif: empresa_cif.trim(),
      num_entrada: num_entrada.trim(),
      num_factura_final: num_factura_final.trim(),
      ff,
      concepto: concepto.trim(),
      proveedor: proveedor.trim(),
      importe: importe ? Number(importe) : null,
      protocolo: protocolo && protocolo.num_protocolo ? {
        num_protocolo: protocolo.num_protocolo.trim(),
        cs_iva: Number(protocolo.cs_iva || 0)
      } : null
    };

    console.log('🔧 Datos procesados:', datosLimpios);

    const result = await this.service.finalizarRmmYCrearAdeudo(datosLimpios);

    return this.sendSuccess(res, result, 'RMM finalizado y adeudo creado exitosamente', 201);
  } catch (error) {
    console.error('❌ Error en finalizarRmm:', error);
    
    // Manejo específico de errores
    if (error.message.includes('No se encontró')) {
      return res.status(404).json({ error: error.message });
    }
    
    if (error.message.includes('ya está finalizada') || error.message.includes('Ya existe')) {
      return res.status(409).json({ error: error.message });
    }
    
    if (error.message.includes('validación')) {
      return res.status(400).json({ error: error.message });
    }

    return this.handleError(error, res, "Error al finalizar RMM");
  }
}

// ========== MEJORADO: getEntradaRmm ==========
async getEntradaRmm(req, res) {
  try {
    const { empresa_cif, num_entrada } = req.params;
    
    console.log(`🔍 Buscando entrada RMM: ${num_entrada} para empresa: ${empresa_cif}`);
    
    if (!empresa_cif?.trim()) {
      return res.status(400).json({ error: 'empresa_cif es requerido' });
    }
    
    if (!num_entrada?.trim()) {
      return res.status(400).json({ error: 'num_entrada es requerido' });
    }

    const data = await this.service.obtenerEntradaRmm({ 
      empresa_cif: empresa_cif.trim(), 
      num_entrada: decodeURIComponent(num_entrada.trim()) 
    });

    if (!data) {
      console.log(`❌ Entrada RMM no encontrada: ${num_entrada}`);
      return res.status(404).json({ error: 'Entrada RMM no encontrada' });
    }

    console.log(`✅ Entrada RMM encontrada:`, data);
    return this.sendSuccess(res, data);
  } catch (error) {
    console.error('❌ Error en getEntradaRmm:', error);
    return this.handleError(error, res, "Error al obtener entrada RMM");
  }
}

  async getAdeudosPendientesByEmpresa(req, res) {
  try {
    const { empresa_cif } = req.params;
    const result = await this.service.obtenerAdeudosPendientes(empresa_cif);
    return this.sendSuccess(res, result);
  } catch (error) {
    return this.handleError(error, res, "Error al obtener los adeudos pendientes.");
  }
}

  async getEmpresasAdeudos(req, res) {
    try {
      const result = await this.service.getEmpresasAdeudos();
      return this.sendSuccess(res, result)
    } catch (error) {
      return this.handleError(error, res, "Error al obtener las empresas para el historico.");
    }
  }

  async getAdeudos(req, res) {
    try {
      const result = await this.service.getAdeudos();
      return this.sendSuccess(res, result)
    } catch (error) {
      return this.handleError(error, res, "Error al obtener los adeudos de la empresa.");
    }
  }

  async updateAdeudos(req, res) {
    try {
      const result = await this.service.updateAdeudos(req.body);
      return this.sendSuccess(res, result)
    } catch (error) {
      return this.handleError(error, res, "Error al actualizar los adeudos de la empresa.");
    }
  }

  async deleteAdeudos(req, res) {
    try {
      const result = await this.service.deleteAdeudos(req.body);
      return this.sendSuccess(res, result)
    } catch (error) {
      return this.handleError(error, res, "Error al actualizar los adeudos de la empresa.");
    }
  }

  async createRecord(req, res) {
    try {
      const { empresa_cif } = req.params;
      const workbook = await this.service.createRecord(empresa_cif);

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );

      res.setHeader(
        "Content-Disposition",
        `attachment; filename="Historico_${empresa_cif}_${Date.now()}.xlsx"`
      );

      await workbook.xlsx.write(res);

      res.end(); // Finalizar respuesta
    } catch (error) {
      return this.handleError(error, res, "Error al crear el Excel del histórico");
    }
  }
}

// Exportar tanto la clase como funciones individuales
const adeudoController = new AdeudoController();
export default adeudoController;

// Para compatibilidad con el código existente
export const getAdeudosByEmpresa = adeudoController.getAdeudosByEmpresa.bind(adeudoController);
export const getAdeudosPendientes = adeudoController.getAdeudosPendientes.bind(adeudoController);
export const checkAdeudosPendientes = adeudoController.checkAdeudosPendientes.bind(adeudoController);
export const createAdeudo = adeudoController.createAdeudo.bind(adeudoController);
export const crearEntradaRmmPendiente = adeudoController.crearEntradaRmmPendiente.bind(adeudoController);
export const finalizarRmm = adeudoController.finalizarRmm.bind(adeudoController);
export const getEntradaRmm = adeudoController.getEntradaRmm.bind(adeudoController);
export const getAdeudosPendientesByEmpresa = adeudoController.getAdeudosPendientesByEmpresa.bind(adeudoController);
export const getEmpresasAdeudos = adeudoController.getEmpresasAdeudos.bind(adeudoController);
export const getAdeudos = adeudoController.getAdeudos.bind(adeudoController);
export const updateAdeudos = adeudoController.updateAdeudos.bind(adeudoController);
export const deleteAdeudos = adeudoController.deleteAdeudos.bind(adeudoController);
export const createRecord = adeudoController.createRecord.bind(adeudoController);