import { BaseService } from './BaseService.js';
import Repositorio from "../repositories/globalPersistence.js";
import { pool } from "../config/db.js";
import formatDate from '../validations/formatDate.js';
import { adeudoInsertSchema, adeudoUpdateSchema } from '../middleware/Schemas.js'
import { historicoExcel } from '../utils/adeudosExcel.js';

// Helper para eliminar columnas generadas
const stripGeneradas = (obj) => {
  if (!obj) return obj;
  const copia = { ...obj };
  delete copia.iva;
  delete copia.retencion;
  delete copia.num_entrada_original;
  return copia;
};

class AdeudoService extends BaseService {
  constructor() {
    super({
      adeudo: new Repositorio('adeudo', ['num_factura', 'empresa_cif']),
      protocolo: new Repositorio('protocolo', ['num_factura', 'empresa_cif']),
      anticipo: new Repositorio('anticipo', 'empresa_cif'),
      empresa: new Repositorio('empresa', 'cif'),
      entrada_rmm: new Repositorio('entrada_rmm', ['num_entrada', 'empresa_cif'])
    });
  }

  async obtenerHonorariosPorEmpresa(empresa_cif) {
    const query = `SELECT * FROM obtener_honorarios_por_empresa($1)`;
    const result = await pool.query(query, [empresa_cif]);

    const honorariosPorLiquidacion = {};
    result.rows.forEach(row => {
      honorariosPorLiquidacion[row.num_liquidacion] = {
        base: parseFloat(row.honorario) || 0,
        iva: parseFloat(row.iva) || 0,
        total: parseFloat(row.total_honorarios) || 0,
        num_factura: row.num_factura,
        fecha_creacion: row.fecha_creacion
      };
    });

    return honorariosPorLiquidacion;
  }

  async obtenerSaldoEmpresa(empresa_cif) {
    const query = `SELECT * FROM calcular_saldo_empresa($1)`;
    const result = await pool.query(query, [empresa_cif]);

    if (result.rows.length === 0) {
      return {
        anticipo_original: 0,
        saldo_actual: 0,
        total_adeudos: 0,
        total_honorarios: 0,
        total_general: 0,
        debe_empresa: 0,
        estado: 'sin_anticipo'
      };
    }

    // Mapear los nuevos nombres de columna de la función
    const row = result.rows[0];
    const saldo = {
      anticipo_original: parseFloat(row.anticipo_original_result) || 0,
      saldo_actual: parseFloat(row.saldo_actual_result) || 0,
      total_adeudos: parseFloat(row.total_adeudos_result) || 0,
      total_honorarios: parseFloat(row.total_honorarios_result) || 0,
      total_general: parseFloat(row.total_general_result) || 0,
      debe_empresa: parseFloat(row.debe_empresa_result) || 0
    };

    const estado = saldo.saldo_actual > 0 ? 'saldo_favorable' :
      saldo.debe_empresa > 0 ? 'debe_dinero' : 'saldado';

    return {
      ...saldo,
      estado
    };
  }

  async insertarAdeudoCompleto({ adeudo, protocolo }) {
    return await this.withTransaction(async (client) => {
      // 1) Insertar adeudo SIN columnas generadas
      const adeudoLimpio = stripGeneradas(adeudo);
      const adeudoInsertado = await this.repositories.adeudo.insertar(adeudoLimpio, client);

      // 2) Insertar protocolo (si llega) asegurando empresa_cif
      if (protocolo && Object.keys(protocolo).length > 0) {
        await this.repositories.protocolo.insertar(
          { ...protocolo, empresa_cif: adeudo.empresa_cif },
          client
        );
      }

      // 3) Verificar anticipo existente (opcional que use client si tu repo lo permite)
      const anticipoExistente = await this.repositories.anticipo.ObtenerPorId({ empresa_cif: adeudo.empresa_cif });
      if (!anticipoExistente) {
        // Crear anticipo con valores por defecto si no existe
        await this.repositories.anticipo.insertar({
          empresa_cif: adeudo.empresa_cif,
          anticipo: 0,
          anticipo_original: 0,
          saldo_actual: 0
        }, client);
        console.log('Anticipo creado para nueva empresa');
      }

      // 4) Registrar movimiento
      const empresa = await this.repositories.empresa.BuscarPorFiltros({ cif: adeudo.empresa_cif }, ['nombre']);
      if (empresa.length > 0) {
        await this.repositories.adeudo.registrarMovimiento(
          { accion: `Se agregó un adeudo para: ${empresa[0].nombre}`, datos: adeudoLimpio },
          client
        );
      } else {
        console.log('No se encontró la empresa');
      }

      return adeudoInsertado;
    });
  }

  async obtenerTodosAdeudosPorEmpresa(empresa_cif) {
    const query = `
      SELECT 
        a.num_factura,
        a.concepto,
        a.proveedor,
        a.ff,
        a.importe,
        a.iva,
        a.retencion,
        a.num_liquidacion,
        a.fecha_creacion as f_adeudo_creacion, 
        COALESCE(p.num_protocolo, '') AS num_protocolo,
        COALESCE(p.cs_iva, 0) AS cs_iva,
        (COALESCE(a.importe,0) + COALESCE(a.iva,0) - COALESCE(a.retencion,0) + COALESCE(p.cs_iva,0)) AS total,
        COALESCE(h.honorario, 0) AS honorarios_base,
        COALESCE(h.iva, 0) AS honorarios_iva,
        a.estado,
        h.fecha_creacion as fecha_liquidacion
      FROM adeudo a
      LEFT JOIN protocolo p 
        ON a.num_factura = p.num_factura 
        AND a.empresa_cif = p.empresa_cif
      LEFT JOIN honorario h 
        ON a.num_liquidacion = h.num_liquidacion 
        AND a.empresa_cif = h.empresa_cif
      WHERE a.empresa_cif = $1
      ORDER BY 
        CASE WHEN a.num_liquidacion IS NULL THEN 0 ELSE 1 END,
        COALESCE(a.num_liquidacion, 999999) DESC, 
        a.ff ASC
    `;

    const result = await pool.query(query, [empresa_cif]);

    const saldoInfo = await this.obtenerSaldoEmpresa(empresa_cif);

    const anticipo = {
      empresa_cif,
      anticipo: saldoInfo.saldo_actual,
      anticipo_original: saldoInfo.anticipo_original,
      saldo_actual: saldoInfo.saldo_actual,
      debe_empresa: saldoInfo.debe_empresa,
      estado: saldoInfo.estado
    };

    const resumen = {
      ...this._calcularResumen(result.rows),
      saldo_info: saldoInfo
    };

    const adeudos = result.rows.map(row => ({
      ...row,
      ff: formatDate(row.ff),
      fecha_liquidacion: formatDate(row.fecha_liquidacion)
    }));

    return { anticipo, adeudos, resumen };
  }

  async obtenerAdeudosPendientes(empresa_cif) {
    const query = `
      SELECT 
        a.num_factura,
        a.concepto,
        a.proveedor,
        a.ff,
        a.importe,
        a.iva,
        a.retencion,
        a.num_liquidacion,
        COALESCE(p.num_protocolo, '') AS num_protocolo,
        COALESCE(p.cs_iva, 0) AS cs_iva,
        (COALESCE(a.importe,0) + COALESCE(a.iva,0) - COALESCE(a.retencion,0) + COALESCE(p.cs_iva,0)) AS total,
        a.empresa_cif,
        'PENDIENTE' as estado
      FROM adeudo a
      LEFT JOIN protocolo p 
        ON a.num_factura = p.num_factura
        AND a.empresa_cif = p.empresa_cif
      WHERE a.empresa_cif = $1 AND a.num_liquidacion IS NULL
      ORDER BY a.ff ASC
    `;

    const result = await pool.query(query, [empresa_cif]);

    // Obtener información del saldo
    const saldoInfo = await this.obtenerSaldoEmpresa(empresa_cif);

    const adeudos = result.rows.map(row => ({
      ...row,
      ff: formatDate(row.ff)
    }));

    return {
      adeudos,
      saldo_info: saldoInfo,
      resumen: {
        total_pendientes: result.rows.length,
        saldo_actual: saldoInfo.saldo_actual,
        debe_empresa: saldoInfo.debe_empresa
      }
    };
  }

  async obtenerTodosAdeudosPorEmpresaAgrupados(empresa_cif) {
    const query = `SELECT * FROM obtener_adeudos_con_rmm_por_empresa($1)`;
    const result = await pool.query(query, [empresa_cif]);

    const queryHonorarios = `
        SELECT 
            num_liquidacion,
            honorario,
            iva,
            (honorario + iva) as total_honorarios,
            num_factura,
            fecha_creacion
        FROM honorario 
        WHERE empresa_cif = $1
        ORDER BY num_liquidacion DESC
    `;

    const honorariosResult = await pool.query(queryHonorarios, [empresa_cif]);

    // Obtener información completa del saldo
    const saldoInfo = await this.obtenerSaldoEmpresa(empresa_cif);

    const honorariosPorLiquidacion = {};
    honorariosResult.rows.forEach(row => {
      const numLiq = parseInt(row.num_liquidacion);
      honorariosPorLiquidacion[numLiq] = {
        base: parseFloat(row.honorario) || 0,
        iva: parseFloat(row.iva) || 0,
        total: parseFloat(row.total_honorarios) || 0,
        num_factura: row.num_factura,
        fecha_creacion: row.fecha_creacion
      };
    });

    const anticipo = {
      empresa_cif,
      anticipo: saldoInfo.saldo_actual, // Para compatibilidad
      anticipo_original: saldoInfo.anticipo_original,
      saldo_actual: saldoInfo.saldo_actual,
      total_adeudos: saldoInfo.total_adeudos,
      total_honorarios: saldoInfo.total_honorarios,
      total_general: saldoInfo.total_general,
      debe_empresa: saldoInfo.debe_empresa,
      estado: saldoInfo.estado
    };

    const adeudos = result.rows.map(row => ({
      ...row,
      fecha_anticipo: formatDate(row.fecha_anticipo),
      fecha_devolucion_diferencia: formatDate(row.fecha_devolucion_diferencia),
      ff: formatDate(row.ff),
      fecha_liquidacion: formatDate(row.fecha_liquidacion)
    }));


    const adeudosAgrupados = {};
    adeudos.forEach(adeudo => {
      const liquidacion = adeudo.num_liquidacion || 'pendientes';
      if (!adeudosAgrupados[liquidacion]) {
        adeudosAgrupados[liquidacion] = {
          num_liquidacion: liquidacion,
          adeudos: [],
          resumen: {
            total: 0,
            importe_total: 0,
            iva_total: 0,
            retencion_total: 0,
            total_general: 0
          },
          // Obtener honorarios del mapa (CORREGIDO: usar parseInt)
          honorarios: liquidacion !== 'pendientes' && honorariosPorLiquidacion[parseInt(liquidacion)]
            ? honorariosPorLiquidacion[parseInt(liquidacion)]
            : { base: 0, iva: 0, total: 0, num_factura: null, fecha_creacion: null }
        };
      }

      adeudosAgrupados[liquidacion].adeudos.push(adeudo);
      const r = adeudosAgrupados[liquidacion].resumen;
      r.total++;
      r.importe_total += parseFloat(adeudo.importe) || 0;
      r.iva_total += parseFloat(adeudo.iva) || 0;
      r.retencion_total += parseFloat(adeudo.retencion) || 0;
      r.total_general += parseFloat(adeudo.total) || 0;
    });

    // Orden: pendientes primero, luego num_liquidacion desc
    const liquidacionesOrdenadas = Object.keys(adeudosAgrupados).sort((a, b) => {
      if (a === 'pendientes') return -1;
      if (b === 'pendientes') return 1;
      return parseInt(b) - parseInt(a);
    });

    const liquidaciones = liquidacionesOrdenadas.map(k => adeudosAgrupados[k]);

    const resumenGeneral = {
      ...this._calcularResumen(adeudos),
      saldo_info: saldoInfo,
      total_honorarios: saldoInfo.total_honorarios,
      total_general: saldoInfo.total_general
    };

    return { anticipo, liquidaciones, resumen: resumenGeneral };
  }

  async verificarAdeudosPendientes(empresa_cif) {
    const query = `
      SELECT COUNT(*) as total_pendientes
      FROM adeudo 
      WHERE empresa_cif = $1 AND num_liquidacion IS NULL
    `;
    const result = await pool.query(query, [empresa_cif]);
    const totalPendientes = parseInt(result.rows[0].total_pendientes);
    return {
      hay_pendientes: totalPendientes > 0,
      total_pendientes: totalPendientes
    };
  }

  async getEmpresasAdeudos() {
    return await this.withTransaction(async () => {
      const empresas = await this.repositories.empresa.BuscarConJoins([], {}, 'AND', ['cif', 'nombre', 'clave']);
      return empresas;
    });
  }

  async updateAdeudos(data) {
    console.log("Datos recibidos:", data);

    const empresa_cif = data.empresa_cif;
    const anticipoUnico = data.anticipo_unico;
    const cambiosProtocolo = data.cambios_protocolo || [];
    const setAdeudos = data.cambios_filas || [];
    const entradaRMM = data.cambios_RMM || [];

    if (anticipoUnico !== undefined && anticipoUnico !== null && isNaN(Number(anticipoUnico))) {
      throw new Error("El anticipo debe ser un número válido");
    }

    for (const adeudo of setAdeudos) {
      const schema = adeudo.num_factura_original ? adeudoUpdateSchema : adeudoInsertSchema;
      const { error } = schema.validate(adeudo);
      if (error) throw new Error(`Error de validación en factura ${adeudo.num_factura_original || "(nuevo)"}: ${error.message}`);
    } return await this.withTransaction(async (client) => {
      // a) Anticipo - ACTUALIZADO para manejar anticipo original
      if (anticipoUnico !== undefined) {
        const anticipoActual = await this.repositories.anticipo.ObtenerPorId({ empresa_cif });
        const nuevoAnticipo = Number(anticipoUnico);

        if (anticipoActual) {
          // Si se está cambiando el anticipo original, recalcular todo
          const saldoInfo = await this.obtenerSaldoEmpresa(empresa_cif);
          const diferencia = nuevoAnticipo - (anticipoActual.anticipo_original || 0);

          await this.repositories.anticipo.actualizarPorId(
            { empresa_cif },
            {
              anticipo: nuevoAnticipo, // Para compatibilidad
              anticipo_original: nuevoAnticipo,
              saldo_actual: Math.max(0, nuevoAnticipo - saldoInfo.total_adeudos),
              fecha_ultima_actualizacion: new Date()
            },
            client
          );
          console.log(`ANTICIPO ACTUALIZADO: Original=${nuevoAnticipo}, Diferencia=${diferencia}`);
        } else {
          await this.repositories.anticipo.insertar(
            {
              empresa_cif,
              anticipo: nuevoAnticipo,
              anticipo_original: nuevoAnticipo,
              saldo_actual: nuevoAnticipo
            },
            client
          );
          console.log("ANTICIPO INSERTADO");
        }
      }

      // b) Protocolos
      if (cambiosProtocolo.length > 0) {
        await Promise.all(
          cambiosProtocolo.map(async (protocolo) => {
            const { num_factura, ...nuevosDatos } = protocolo;
            const exists = await this.repositories.protocolo.ExistePorId({ num_factura, empresa_cif });
            if (exists) {
              await this.repositories.protocolo.actualizarPorId(
                { num_factura, empresa_cif },
                nuevosDatos,
                client
              );
            } else {
              await this.repositories.protocolo.insertar(
                { ...nuevosDatos, num_factura, empresa_cif },
                client
              );
            }
          })
        );
      }

      // c) Adeudos
      if (setAdeudos.length > 0) {
        await Promise.all(
          setAdeudos.map(async (adeudo) => {
            const { num_factura_original, num_entrada_original, ...nuevosDatos } = adeudo;

            if (!num_factura_original) {
              const nuevosDatosLimpios = stripGeneradas(nuevosDatos);
              nuevosDatosLimpios.empresa_cif = empresa_cif;

              if (num_entrada_original) {
                const entradaRmmData = await this.repositories.entrada_rmm.ObtenerPorId({
                  num_entrada: num_entrada_original,
                  empresa_cif
                });

                if (entradaRmmData) {
                  const anticipoPagado = parseFloat(entradaRmmData.anticipo_pagado) || 0;
                  const diferencia = parseFloat(entradaRmmData.diferencia) || 0;
                  const total = anticipoPagado - diferencia;

                  const importeCalculado = total / (1 + 0.21 - 0.15);
                  nuevosDatosLimpios.importe = importeCalculado;
                }
              }

              await this.repositories.adeudo.insertar(nuevosDatosLimpios, client);

              if (num_entrada_original) {
                await this.repositories.entrada_rmm.actualizarPorId(
                  { num_entrada: num_entrada_original, empresa_cif },
                  { num_factura_final: nuevosDatos.num_factura },
                  client
                );
              }
            } else {
              if (nuevosDatos.num_liquidacion === "" || isNaN(Number(nuevosDatos.num_liquidacion))) {
                nuevosDatos.num_liquidacion = null;
              }

              const nuevosDatosLimpios = stripGeneradas(nuevosDatos);

              const adeudoActual = await this.repositories.adeudo.ObtenerPorId({
                num_factura: num_factura_original,
                empresa_cif
              });

              if (adeudoActual && adeudoActual.proveedor === 'Registro Mercantil de Madrid') {
                const query = `
                SELECT num_entrada, anticipo_pagado, diferencia 
                FROM entrada_rmm 
                WHERE num_factura_final = $1 AND empresa_cif = $2
              `;
                const result = await client.query(query, [num_factura_original, empresa_cif]);

                if (result.rows.length > 0) {
                  const entradaRmm = result.rows[0];
                  const anticipoPagado = parseFloat(entradaRmm.anticipo_pagado) || 0;
                  const diferencia = parseFloat(entradaRmm.diferencia) || 0;
                  const total = anticipoPagado - diferencia;

                  const importeCalculado = total / (1 + 0.21 - 0.15);
                  nuevosDatosLimpios.importe = importeCalculado;
                }
              }

              await this.repositories.adeudo.actualizarPorId(
                { num_factura: num_factura_original, empresa_cif },
                nuevosDatosLimpios,
                client
              );
            }
          })
        );
      }

      // d) EntradaRMM - sin cambios
      if (entradaRMM.length > 0) {
        await Promise.all(
          entradaRMM.map(async (entrada) => {
            const { num_entrada_original, ...actuEntrada } = entrada;

            await this.repositories.entrada_rmm.actualizarPorId(
              { num_entrada: num_entrada_original, empresa_cif },
              actuEntrada,
              client
            );

            if (actuEntrada.anticipo_pagado !== undefined || actuEntrada.diferencia !== undefined) {
              const query = `
              SELECT num_factura_final, anticipo_pagado, diferencia 
              FROM entrada_rmm 
              WHERE num_entrada = $1 AND empresa_cif = $2
            `;
              const result = await client.query(query, [num_entrada_original, empresa_cif]);

              if (result.rows.length > 0 && result.rows[0].num_factura_final) {
                const entradaData = result.rows[0];
                const anticipoPagado = parseFloat(entradaData.anticipo_pagado) || 0;
                const diferencia = parseFloat(entradaData.diferencia) || 0;
                  const total = anticipoPagado - diferencia;

                  const importeCalculado = total / (1 + 0.21 - 0.15);

                await this.repositories.adeudo.actualizarPorId(
                  { num_factura: entradaData.num_factura_final, empresa_cif },
                  { importe: importeCalculado },
                  client
                );
              }
            }
          })
        );
      }

      // Registrar movimiento
      const empresa = await this.repositories.empresa.BuscarPorFiltros({ cif: empresa_cif }, ['nombre']);
      if (empresa.length > 0) {
        await this.repositories.adeudo.registrarMovimiento(
          { accion: `Se actualizó un adeudo para: ${empresa[0].nombre}`, datos: data },
          client
        );
      }

      return {
        success: true,
        message: "Cambios guardados correctamente",
        adeudosActualizados: setAdeudos.length,
        protocolosActualizados: cambiosProtocolo.length,
        anticipoActualizado: anticipoUnico !== undefined
      };
    });
  }

  async deleteAdeudos(data) {
    return await this.withTransaction(async (client) => {
      await Promise.all(
        data.map(async (row) => {
          const exists = await this.repositories.adeudo.ExistePorId({
            num_factura: row.num_factura,
            empresa_cif: row.empresa_cif
          });

          if (exists) {
            const ok = await this.repositories.adeudo.eliminarPorId(
              { num_factura: row.num_factura, empresa_cif: row.empresa_cif },
              client
            );

            if (!ok) {
              throw new Error("Hubo un error al eliminar el adeudo.");
            }

            const empresa = await this.repositories.empresa.BuscarPorFiltros(
              { cif: row.empresa_cif }, ['nombre']
            );
            if (empresa.length > 0) {
              await this.repositories.adeudo.registrarMovimiento(
                { accion: `Se eliminó el adeudo con factura: ${row.num_factura} para: ${empresa[0].nombre}`, datos: row },
                client
              );
            }
          }
        })
      );

      return { success: true, message: "Adeudos eliminados correctamente" };
    });
  }

  async createRecord(empresa_cif) {
    console.log("Esto llega primero " + empresa_cif);
    const historico = await this.obtenerTodosAdeudosPorEmpresaAgrupados(empresa_cif);
    const empresa = await this.repositories.empresa.BuscarPorFiltros({ cif: empresa_cif }, ['nombre']);
    const nombreEmpresa = empresa?.[0]?.nombre || '';
    historico.nombreEmpresa = nombreEmpresa;

    const fechas = await this.repositories.adeudo.BuscarPorFiltros({ empresa_cif: empresa_cif }, ['MIN(ff) f_inicio', 'MAX(ff) f_fin']);
    historico.fechas = {
      f_inicio: formatDate(fechas[0].f_inicio),
      f_fin: formatDate(fechas[0].f_fin)
    }

    return historicoExcel(historico);
  }

  _calcularResumen(adeudos) {
    // liquidados por estado textual; pendientes por num_liquidacion nulo
    const liquidados = adeudos.filter(a => (a.estado || '').toUpperCase() === 'LIQUIDADO').length;
    const pendientes = adeudos.filter(a => a.num_liquidacion == null).length;
    return {
      total: adeudos.length,
      pendientes,
      liquidados
    };
  }
}

export default AdeudoService;
