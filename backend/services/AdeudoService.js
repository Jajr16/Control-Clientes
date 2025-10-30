import { BaseService } from './BaseService.js';
import Repositorio from "../repositories/globalPersistence.js";
import { pool } from "../config/db.js";
import formatDate from '../validations/formatDate.js';
import { adeudoInsertSchema, adeudoUpdateSchema } from '../schemas/adeudoSchema.js'
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

  // ========== FUNCIONES DE SALDO Y HONORARIOS ==========
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

  // ========== 1) ALTA NORMAL (requiere num_factura) ==========
  async crearAdeudoNormal({ adeudo, protocolo }) {
    if (!adeudo?.num_factura) {
      throw new Error('num_factura es obligatorio para crear adeudo (la PK lo exige)');
    }
    // limpia campos generados por DB
    const { iva, retencion, ...clean } = adeudo;

    return await this.withTransaction(async (client) => {
      const inserted = await this.repositories.adeudo.insertar(clean, client);

      if (protocolo && protocolo.num_protocolo) {
        await this.repositories.protocolo.insertar(
          { num_factura: clean.num_factura, empresa_cif: clean.empresa_cif, ...protocolo },
          client
        );
      }

      const empresa = await this.repositories.empresa.BuscarPorFiltros(
        { cif: clean.empresa_cif }, ['nombre']
      );
      if (empresa.length > 0) {
        await this.repositories.adeudo.registrarMovimiento(
          { accion: `Alta adeudo normal para: ${empresa[0].nombre}`, datos: clean },
          client
        );
      }
      return inserted;
    });
  }

  // ========== MEJORADO: crearEntradaRmmPendiente con validación ==========
  async crearEntradaRmmPendiente(datos) {
    try {
      console.log(`Creando entrada RMM pendiente:`, datos);

      if (!datos.num_entrada || !datos.empresa_cif || !datos.fecha_anticipo) {
        throw new Error('num_entrada, empresa_cif y fecha_anticipo son requeridos');
      }

      const existente = await this.repositories.entrada_rmm.ObtenerPorId({
        num_entrada: String(datos.num_entrada).trim(),
        empresa_cif: String(datos.empresa_cif).trim()
      });

      if (existente) {
        throw new Error(`Ya existe una entrada RMM con número ${datos.num_entrada} para esta empresa`);
      }

      // 🔧 CAMBIO: El importe inicial del adeudo es 0, solo el anticipo_pagado se guarda
      const resultado = await this.repositories.entrada_rmm.insertar({
        num_entrada: String(datos.num_entrada).trim(),
        empresa_cif: String(datos.empresa_cif).trim(),
        anticipo_pagado: Number(datos.anticipo_pagado) || 200,  // 👈 Siempre 200 por defecto
        fecha_anticipo: datos.fecha_anticipo,
        diferencia: datos.diferencia ? Number(datos.diferencia) : null,
        fecha_devolucion_diferencia: datos.fecha_devolucion_diferencia || null,
        num_factura_final: null
      });

      console.log(`Entrada RMM creada exitosamente:`, resultado);
      return resultado;
    } catch (error) {
      console.error(`Error creando entrada RMM:`, error);
      throw error;
    }
  }

  // ========== CORRECCIÓN 2: En AdeudoService.js - función finalizarRmmYCrearAdeudo ==========
  async finalizarRmmYCrearAdeudo(datos) {
    try {
      console.log(`🔄 Finalizando RMM:`, datos);

      const { empresa_cif, num_entrada, num_factura_final, ff, concepto, proveedor, protocolo } = datos;

      if (!empresa_cif || !num_entrada || !num_factura_final || !ff) {
        throw new Error('empresa_cif, num_entrada, num_factura_final y ff son requeridos');
      }

      return await this.withTransaction(async (client) => {
        // 1) Verificar que existe la entrada RMM
        const rmm = await this.repositories.entrada_rmm.ObtenerPorId({
          num_entrada: num_entrada,
          empresa_cif: empresa_cif
        });

        if (!rmm) {
          throw new Error(`No se encontró entrada RMM: ${num_entrada}`);
        }

        if (rmm.num_factura_final) {
          throw new Error(`La entrada RMM ${num_entrada} ya está finalizada con factura: ${rmm.num_factura_final}`);
        }

        // 2) 🔧 CÁLCULO CORREGIDO: anticipo_pagado - diferencia, luego calcular importe base
        const anticipo = parseFloat(rmm.anticipo_pagado || 200);
        const diferencia = parseFloat(rmm.diferencia || 0);
        const totalFinal = anticipo - diferencia;  // Total final que debe cobrar

        // Calcular el importe base usando la fórmula: importe = total / (1 + 0.21 - 0.15)
        const importeBase = totalFinal / (1 + 0.21 - 0.15);

        console.log(`💰 Cálculo RMM CORREGIDO:`, {
          anticipo_pagado: anticipo,
          diferencia: diferencia,
          total_final: totalFinal,
          formula_total: `${anticipo} - ${diferencia} = ${totalFinal}`,
          importe_base_calculado: importeBase,
          formula_importe: `${totalFinal} / (1 + 0.21 - 0.15) = ${importeBase}`,
          iva_calculado: importeBase * 0.21,
          retencion_calculada: importeBase * 0.15
        });

        // 3) Crear el adeudo con el importe base calculado
        const adeudo = {
          num_factura: num_factura_final,
          concepto: concepto || 'Inscripción Registro Mercantil',
          proveedor: proveedor || 'Registro Mercantil de Madrid',
          ff: ff,
          importe: Math.round(importeBase * 100) / 100, // Redondear a 2 decimales
          num_liquidacion: null,
          empresa_cif: empresa_cif,
          estado: 'LIQUIDACIÓN EN CURSO'
        };

        const inserted = await this.repositories.adeudo.insertar(adeudo, client);

        // 4) Actualizar entrada_rmm con la factura final
        await this.repositories.entrada_rmm.actualizarPorId(
          { num_entrada: num_entrada, empresa_cif: empresa_cif },
          { num_factura_final: num_factura_final },
          client
        );

        // 5) Insertar protocolo
        if (protocolo && protocolo.num_protocolo) {
          await this.repositories.protocolo.insertar(
            {
              empresa_cif: empresa_cif,
              num_factura: num_factura_final,
              ...protocolo
            },
            client
          );
        }

        // 6) Registrar movimiento
        const empresa = await this.repositories.empresa.BuscarPorFiltros(
          { cif: empresa_cif }, ['nombre']
        );

        if (empresa.length > 0) {
          await this.repositories.adeudo.registrarMovimiento(
            {
              accion: `Finalizar RMM y crear adeudo para: ${empresa[0].nombre} (entrada ${num_entrada})`,
              datos: {
                adeudo,
                entrada_rmm: {
                  num_entrada: num_entrada,
                  calculo: `Total: ${totalFinal}, Importe base: ${importeBase}`
                }
              }
            },
            client
          );
        }

        return inserted;
      });
    } catch (error) {
      console.error(`❌ Error finalizando RMM:`, error);
      throw error;
    }
  }

  // ========== MEJORADO: obtenerEntradaRmm con mejor manejo ==========
  async obtenerEntradaRmm({ empresa_cif, num_entrada }) {
    try {
      console.log(`🔍 Buscando entrada RMM: ${num_entrada} para empresa: ${empresa_cif}`);

      const row = await this.repositories.entrada_rmm.ObtenerPorId({
        num_entrada,
        empresa_cif
      });

      if (!row) {
        console.log(`❌ No se encontró entrada RMM: ${num_entrada}`);
        return null;
      }

      // Normalizar fechas a formato yyyy-mm-dd para inputs date
      const toISO = (date) => {
        if (!date) return null;
        try {
          const d = new Date(date);
          return d.toISOString().slice(0, 10);
        } catch (error) {
          console.error('Error formateando fecha:', date, error);
          return null;
        }
      };

      const resultado = {
        ...row,
        fecha_anticipo: toISO(row.fecha_anticipo),
        fecha_devolucion_diferencia: toISO(row.fecha_devolucion_diferencia),
      };

      console.log(`✅ Entrada RMM encontrada:`, resultado);
      return resultado;
    } catch (error) {
      console.error(`Error obteniendo entrada RMM:`, error);
      throw error;
    }
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

      // 3) Verificar anticipo existente
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

  // ========== OBTENER ADEUDOS CON UNION CORREGIDO ==========
  async obtenerTodosAdeudosPorEmpresa(empresa_cif) {
    // Query principal para adeudos finalizados
    const queryAdeudos = `
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
        h.fecha_creacion as fecha_liquidacion,
        'ADEUDO_FINALIZADO' as tipo_registro,
        -- Campos para ORDER BY
        CASE WHEN a.num_liquidacion IS NULL THEN 0 ELSE 1 END as orden_liquidacion,
        COALESCE(a.num_liquidacion, 999999) as num_liq_orden
      FROM adeudo a
      LEFT JOIN protocolo p 
        ON a.num_factura = p.num_factura 
       AND a.empresa_cif = p.empresa_cif
      LEFT JOIN honorario h 
        ON a.num_liquidacion = h.num_liquidacion 
       AND a.empresa_cif = h.empresa_cif
      WHERE a.empresa_cif = $1
      
      UNION ALL
      
      SELECT 
        NULL as num_factura,
        'Inscripción Registro Mercantil' as concepto,
        'Registro Mercantil de Madrid' as proveedor,
        NULL as ff,  -- No mostrar fecha_anticipo como fecha_factura
        (COALESCE(rmm.anticipo_pagado, 0) + COALESCE(rmm.diferencia, 0)) as importe,
        0 as iva,
        0 as retencion,
        NULL as num_liquidacion,
        rmm.fecha_creacion as f_adeudo_creacion,
        rmm.num_entrada as num_protocolo,
        0 as cs_iva,
        (COALESCE(rmm.anticipo_pagado, 0) + COALESCE(rmm.diferencia, 0)) as total,
        0 as honorarios_base,
        0 as honorarios_iva,
        'RMM PENDIENTE' as estado,
        NULL as fecha_liquidacion,
        'ENTRADA_RMM_PENDIENTE' as tipo_registro,
        -- Campos para ORDER BY (mismo orden que arriba)
        0 as orden_liquidacion,
        999999 as num_liq_orden
      FROM entrada_rmm rmm
      WHERE rmm.empresa_cif = $1 
      AND rmm.num_factura_final IS NULL
      
      ORDER BY 
        orden_liquidacion,
        num_liq_orden DESC, 
        ff ASC
    `;

    const result = await pool.query(queryAdeudos, [empresa_cif]);

    // Obtener información del saldo
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
      fecha_liquidacion: formatDate(row.fecha_liquidacion),
      // Agregar campos para identificar el tipo en el frontend
      es_entrada_rmm_pendiente: row.tipo_registro === 'ENTRADA_RMM_PENDIENTE',
      protocoloentrada: row.num_protocolo // Asegurar que este campo esté disponible
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

    // Saldo / anticipo
    const saldoInfo = await this.obtenerSaldoEmpresa(empresa_cif);
    const anticipo_original = Number(saldoInfo?.anticipo_original || 0);
    const anticipo_restante = Number(saldoInfo?.saldo_actual || 0);

    // Map de honorarios por nº liquidación
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

    // Normaliza fechas
    const adeudos = result.rows.map(row => ({
      ...row,
      fecha_anticipo: formatDate(row.fecha_anticipo),
      fecha_devolucion_diferencia: formatDate(row.fecha_devolucion_diferencia),
      ff: formatDate(row.ff),
      fecha_liquidacion: formatDate(row.fecha_liquidacion)
    }));

    // Agrupar por liquidación
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
          honorarios:
            liquidacion !== 'pendientes' && honorariosPorLiquidacion[parseInt(liquidacion)]
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

    // Orden: pendientes primero, luego desc
    const liquidacionesOrdenadas = Object.keys(adeudosAgrupados).sort((a, b) => {
      if (a === 'pendientes') return -1;
      if (b === 'pendientes') return 1;
      return parseInt(b) - parseInt(a);
    });
    const liquidaciones = liquidacionesOrdenadas.map(k => adeudosAgrupados[k]);

    // --- NUEVO: resumen sólo de pendientes (para vista/preview) ---
    const bloquePendientes = adeudosAgrupados['pendientes'] || {
      resumen: { importe_total: 0, iva_total: 0, retencion_total: 0, total_general: 0 },
      honorarios: { total: 0 }
    };
    const total_facturas_pendientes = Number(bloquePendientes.resumen.total_general || 0);

    // Honorarios para PDF (si usas los de la liquidación final, déjalos en 0 aquí;
    // si quieres sumarlos en la vista de liquidación final, se calculan en ese flujo)
    const honorarios_pdf = 0;

    // Anticipo “para PDF” = original (congelado)
    const anticipo_para_pdf = anticipo_original;

    // Adeudo pendiente para PDF, clamp >= 0
    const adeudo_pendiente_pdf = Math.max(0, total_facturas_pendientes + honorarios_pdf - anticipo_para_pdf);

    // Resumen general (como ya tenías) + extras
    const resumenGeneral = {
      ...this._calcularResumen(adeudos),
      saldo_info: saldoInfo,
      total_honorarios: saldoInfo.total_honorarios,
      total_general: saldoInfo.total_general,

      // NUEVO: bloque específico para la vista/pdf
      resumen_pendientes: {
        total_facturas: total_facturas_pendientes,
        honorarios: honorarios_pdf,
        anticipo_para_pdf,             // <- usar en PDF
        adeudo_pendiente_pdf           // <- ya calculado y clamp ≥ 0
      }
    };

    // Objeto anticipo completo y explícito
    const anticipo = {
      empresa_cif,
      anticipo: anticipo_restante,          // compat (saldo_actual)
      anticipo_original,                    // << el que quieres para PDF
      saldo_actual: anticipo_restante,      // alias
      total_adeudos: saldoInfo.total_adeudos,
      total_honorarios: saldoInfo.total_honorarios,
      total_general: saldoInfo.total_general,
      debe_empresa: saldoInfo.debe_empresa,
      estado: saldoInfo.estado,

      // Sugerencias de consumo en front:
      anticipo_para_pdf: anticipo_para_pdf, // usa esto en PDF
      anticipo_para_vista: anticipo_restante
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
    const cambioEstado = data.cambio_estado || null;

    if (anticipoUnico !== undefined && anticipoUnico !== null && isNaN(Number(anticipoUnico))) {
      throw new Error("El anticipo debe ser un número válido");
    }

    for (const adeudo of setAdeudos) {
      const schema = adeudo.num_factura_original ? adeudoUpdateSchema : adeudoInsertSchema;
      const { error } = schema.validate(adeudo);
      if (error) throw new Error(`Error de validación en factura ${adeudo.num_factura_original || "(nuevo)"}: ${error.message}`);

      const { num_factura_original, ...nuevosDatos } = adeudo;
    }

    for (const protocolo of cambiosProtocolo) {
      const { num_factura } = protocolo;
      if (!num_factura) throw new Error("num_factura es obligatorio en cambios_protocolo");
    }

    for (const num_entrada of entradaRMM) {
      const { num_entrada_original } = num_entrada;
      if (!num_entrada_original) throw new Error("num_entrada_original es obligatorio en entrada_RMM");
    }

    return await this.withTransaction(async (client) => {
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
              console.log(`PROTOCOLO ACTUALIZADO: ${num_factura}`);
            } else {
              await this.repositories.protocolo.insertar(
                { ...nuevosDatos, num_factura, empresa_cif },
                client
              );
              console.log(`PROTOCOLO INSERTADO: ${num_factura}`);
            }
          })
        );
      }

      // c) Adeudos (sin columnas generadas)
      if (setAdeudos.length > 0) {
        await Promise.all(
          setAdeudos.map(async (adeudo) => {
            const { num_factura_original, num_entrada_original, ...nuevosDatos } = adeudo;

            if (!num_factura_original) {
              // Caso: nuevo adeudo
              const nuevosDatosLimpios = stripGeneradas(nuevosDatos);
              nuevosDatosLimpios.empresa_cif = empresa_cif;

              // CALCULAR IMPORTE AUTOMÁTICAMENTE SI HAY ENTRADA RMM
              if (num_entrada_original) {
                console.log(`Calculando importe para entrada RMM: ${num_entrada_original}`);

                // Buscar datos de entrada_rmm
                const entradaRmmData = await this.repositories.entrada_rmm.ObtenerPorId({
                  num_entrada: num_entrada_original,
                  empresa_cif
                });

                if (entradaRmmData) {
                  const anticipoPagado = parseFloat(entradaRmmData.anticipo_pagado) || 0;
                  const diferencia = parseFloat(entradaRmmData.diferencia) || 0;
                  const totalFinal = anticipoPagado - diferencia;  // CAMBIO: resta
                  const importeCalculado = totalFinal / (1 + 0.21 - 0.15);

                  console.log(`🔧 Cálculo automático de importe RMM:`, {
                    anticipo_pagado: anticipoPagado,
                    diferencia: diferencia,
                    total_final: totalFinal,  // CORREGIDO
                    importe_calculado: importeCalculado
                  });

                  // Sobrescribir el importe con el calculado
                  nuevosDatosLimpios.importe = Math.round(importeCalculado * 100) / 100;
                } else {
                  console.log(`No se encontró entrada RMM para: ${num_entrada_original}`);
                }
              }

              await this.repositories.adeudo.insertar(nuevosDatosLimpios, client);
              console.log(`ADEUDO INSERTADO: ${nuevosDatos.num_factura}`);

              // Actualizar entrada_rmm con el num_factura_final
              if (num_entrada_original) {
                await this.repositories.entrada_rmm.actualizarPorId(
                  { num_entrada: num_entrada_original, empresa_cif },
                  { num_factura_final: nuevosDatos.num_factura },
                  client
                );
                console.log(`Entrada RMM actualizada con factura final: ${nuevosDatos.num_factura}`);
              }
            } else {
              // Caso: actualizar adeudo existente
              if (nuevosDatos.num_liquidacion === "" || isNaN(Number(nuevosDatos.num_liquidacion))) {
                nuevosDatos.num_liquidacion = null;
              }

              const nuevosDatosLimpios = stripGeneradas(nuevosDatos);

              // RECALCULAR IMPORTE SI ES RMM Y HAY CAMBIOS EN ENTRADA_RMM
              // Verificar si el adeudo está relacionado con una entrada RMM
              const adeudoActual = await this.repositories.adeudo.ObtenerPorId({
                num_factura: num_factura_original,
                empresa_cif
              });

              if (adeudoActual && adeudoActual.proveedor === 'Registro Mercantil de Madrid') {
                // Buscar si hay entrada RMM relacionada por num_factura_final
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

                  console.log(`Recalculando importe para adeudo RMM existente:`, {
                    num_factura: num_factura_original,
                    anticipo_pagado: anticipoPagado,
                    diferencia: diferencia,
                    importe_anterior: adeudoActual.importe,
                    importe_calculado: importeCalculado
                  });

                  // Sobrescribir el importe con el calculado
                  nuevosDatosLimpios.importe = importeCalculado;
                }
              }

              await this.repositories.adeudo.actualizarPorId(
                { num_factura: num_factura_original, empresa_cif },
                nuevosDatosLimpios,
                client
              );
              console.log(`ADEUDO ACTUALIZADO: ${num_factura_original}`);
            }
          })
        );
        console.log("ADEUDOS ACTUALIZADOS");
      }

      // d) EntradaRMM
      if (entradaRMM.length > 0) {
        await Promise.all(
          entradaRMM.map(async (entrada) => {
            const { num_entrada_original, ...actuEntrada } = entrada;

            // Actualizar entrada_rmm
            await this.repositories.entrada_rmm.actualizarPorId(
              { num_entrada: num_entrada_original, empresa_cif },
              actuEntrada,
              client
            );
            console.log(`Entrada RMM Actualizada: ${num_entrada_original}`);

            // SI HAY CAMBIOS EN ANTICIPO O DIFERENCIA, RECALCULAR IMPORTE DEL ADEUDO RELACIONADO
            if (actuEntrada.anticipo_pagado !== undefined || actuEntrada.diferencia !== undefined) {
              // Buscar el adeudo relacionado
              const query = `
              SELECT num_factura_final, anticipo_pagado, diferencia 
              FROM entrada_rmm 
              WHERE num_entrada = $1 AND empresa_cif = $2
            `;
              const result = await client.query(query, [num_entrada_original, empresa_cif]);

              if (result.rows.length > 0 && result.rows[0].num_factura_final) {
                const entradaData = result.rows[0];
                const anticipoPagado = parseFloat(entradaData.anticipo_pagado) || 200;
                const diferencia = parseFloat(entradaData.diferencia) || 0;
                const totalFinal = anticipoPagado - diferencia;  // CAMBIO: resta en lugar de suma
                const importeCalculado = totalFinal / (1 + 0.21 - 0.15);

                console.log(`🔧 Recalculando importe RMM:`, {
                  num_entrada: num_entrada_original,
                  num_factura_final: entradaData.num_factura_final,
                  anticipo_pagado: anticipoPagado,
                  diferencia: diferencia,
                  total_final: totalFinal,  // CORREGIDO
                  importe_calculado: importeCalculado,
                  formula: `(${anticipoPagado} - ${diferencia}) / (1 + 0.21 - 0.15) = ${importeCalculado}`
                });

                // Actualizar el importe del adeudo
                await this.repositories.adeudo.actualizarPorId(
                  { num_factura: entradaData.num_factura_final, empresa_cif },
                  { importe: importeCalculado },
                  client
                );

                console.log(`Importe actualizado automáticamente para factura: ${entradaData.num_factura_final}`);
              }
            }
          })
        );
      }

      // e) Cambio de estados
      if (cambioEstado) {
        const { num_liquidacion, nuevo_estado } = cambioEstado;
        let query, params;

        if (num_liquidacion === null || num_liquidacion === undefined) {
          // Actualizar pendientes
          query = `UPDATE adeudo SET estado = $1 WHERE empresa_cif = $2 AND num_liquidacion IS NULL`;
          params = [nuevo_estado, empresa_cif];
        } else {
          // Actualizar liquidación específica
          query = `UPDATE adeudo SET estado = $1 WHERE empresa_cif = $2 AND num_liquidacion = $3`;
          params = [nuevo_estado, empresa_cif, num_liquidacion];
        }

        const result = await client.query(query, params);
        console.log(`✅ Estado actualizado: ${result.rowCount} registros afectados`);
      }

      // Registrar movimiento
      const empresa = await this.repositories.empresa.BuscarPorFiltros({ cif: empresa_cif }, ['nombre']);
      if (empresa.length > 0) {
        await this.repositories.adeudo.registrarMovimiento(
          { accion: `Se actualizó un adeudo para: ${empresa[0].nombre}`, datos: data },
          client
        );
      } else {
        console.log('No se encontró la empresa');
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
    // Contar liquidados por estado textual
    const liquidados = adeudos.filter(a => (a.estado || '').toUpperCase() === 'LIQUIDADO').length;

    // Contar pendientes: incluye adeudos sin liquidar Y entradas RMM pendientes
    const pendientes = adeudos.filter(a =>
      a.num_liquidacion == null || a.estado === 'RMM PENDIENTE'
    ).length;

    return {
      total: adeudos.length,
      pendientes,
      liquidados
    };
  }
}

export default AdeudoService;