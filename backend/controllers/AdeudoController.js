import { BaseController } from './BaseController.js';
import AdeudoService from '../services/AdeudoService.js';

class AdeudoController extends BaseController {
  constructor() {
    super(new AdeudoService());
  }

  async getAdeudosByEmpresa(req, res) {
    try {
      const { empresa_cif } = req.params;
      const { incluir_liquidados = 'true' } = req.query;

      const result = incluir_liquidados === 'true'
        ? await this.service.obtenerTodosAdeudosPorEmpresa(empresa_cif)
        : await this.service.obtenerAdeudosPendientes(empresa_cif);

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

      if (!adeudo || !adeudo.num_factura) {
        return res.status(400).json({ error: 'Número de factura es requerido' });
      }

      // Asegurar que se crea como pendiente
      if (adeudo.num_liquidacion !== undefined) {
        delete adeudo.num_liquidacion;
      }

      const result = await this.service.insertarAdeudoCompleto({ adeudo, protocolo });
      return this.sendSuccess(res, result, 'Adeudo creado correctamente', 201);
    } catch (error) {
      return this.handleError(error, res, "Error al crear el adeudo");
    }
  }

  async getAdeudosPendientesByEmpresa(req, res) {
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
}

// Exportar tanto la clase como funciones individuales
const adeudoController = new AdeudoController();
export default adeudoController;

// Para compatibilidad con el código existente
export const getAdeudosByEmpresa = adeudoController.getAdeudosByEmpresa.bind(adeudoController);
export const getAdeudosPendientes = adeudoController.getAdeudosPendientes.bind(adeudoController);
export const checkAdeudosPendientes = adeudoController.checkAdeudosPendientes.bind(adeudoController);
export const createAdeudo = adeudoController.createAdeudo.bind(adeudoController);
export const getAdeudosPendientesByEmpresa = adeudoController.getAdeudosPendientesByEmpresa.bind(adeudoController);
export const getEmpresasAdeudos = adeudoController.getEmpresasAdeudos.bind(adeudoController);
export const getAdeudos = adeudoController.getAdeudos.bind(adeudoController);
export const updateAdeudos = adeudoController.updateAdeudos.bind(adeudoController);
export const deleteAdeudos = adeudoController.deleteAdeudos.bind(adeudoController);