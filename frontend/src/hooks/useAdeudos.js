import { useEffect, useMemo, useState, useCallback } from "react";
import { apiService } from "../services/apiService";
import { pdfGenerator } from "../services/pdfGenerator";
import { normalizeAdeudoForPdf, matchEmpresa, isPendiente, toNum } from "../utils/normalizers";

export function useAdeudos({ empresa, setEmpresa, adeudosGuardados, setAdeudosGuardados, setVistaPrevia }) {
  // --- Estado UI / navegación
  const [vistaActual, setVistaActual] = useState('principal');
  const [empresaSeleccionadaBorrador, setEmpresaSeleccionadaBorrador] = useState('');
  const [empresaSeleccionadaLiquidacion, setEmpresaSeleccionadaLiquidacion] = useState('');
  const [mostrarVistaPreviaPdf, setMostrarVistaPreviaPdf] = useState(false);
  const [tipoPdfPrevia, setTipoPdfPrevia] = useState('');
  const [importeBloqueado, setImporteBloqueado] = useState(false);
  const [honorariosSinIVA, setHonorariosSinIVA] = useState(0);
  const [botonGuardarDeshabilitado, setBotonGuardarDeshabilitado] = useState(false);
  const [cargandoAdeudos, setCargandoAdeudos] = useState(false);
  const [estadoAdeudos, setEstadoAdeudos] = useState({ pendientes: 0, liquidados: 0, total: 0 });

  const [rmmDatos, setRmmDatos] = useState(null);
  const [rmmReadOnly, setRmmReadOnly] = useState(false);

  const prefillDesdeProtocolo = useCallback(async (empresaCif, numEntrada) => {
  if (!empresaCif || !numEntrada) return;
  
  try {     
    const entrada = await apiService.obtenerEntradaRmm(empresaCif, numEntrada);
    
    if (!entrada) {
      // No hay entrada RMM: tratar como protocolo sin entrada RMM
      console.log('Protocolo existe en adeudos pero sin entrada RMM - modo normal');
      setRmmDatos(null);
      setRmmReadOnly(false);
      setEmpresa(prev => ({ ...prev, protocoloentrada: numEntrada }));
      return;
    }
    
    // Hay entrada RMM: prellenar datos
    setRmmDatos(entrada);
    setRmmReadOnly(true);
    setEmpresa(prev => ({
      ...prev,
      protocoloentrada: numEntrada,
      fechafactura: entrada.fecha_anticipo || ''
    }));
    
  } catch (error) {
    // Error 404 o cualquier otro: tratar como protocolo sin entrada RMM
    console.log('Error obteniendo entrada RMM (normal si no es RMM):', error.message);
    setRmmDatos(null);
    setRmmReadOnly(false);
    setEmpresa(prev => ({ ...prev, protocoloentrada: numEntrada }));
  }
}, [setEmpresa]);

  // --- Lista segura
  const adeudosList = Array.isArray(adeudosGuardados?.adeudos) ? adeudosGuardados.adeudos : [];

  // mantener una lista editable de protocolos (local) por si el usuario agrega uno nuevo
  const [protocolosExtra, setProtocolosExtra] = useState([]);

  // protocolos existentes en adeudos de la empresa seleccionada
 // Reemplaza el useMemo de protocolosDisponibles con este código:

// Reemplaza el useMemo con esto:
const [protocolosDisponibles, setProtocolosDisponibles] = useState([]);

useEffect(() => {
  const empresaCif = (empresa?.empresa_cif || "").trim().toLowerCase();
  
  // Verificación: Solo procesar si hay datos válidos
  if (!empresaCif || !Array.isArray(adeudosList) || adeudosList.length === 0) {
    console.log('⏸️ useEffect: Esperando datos válidos...', { empresaCif, adeudosListLength: adeudosList?.length });
    return; // NO cambiar el estado, mantener el anterior
  }

  // Verificar que los adeudos tengan empresa_cif
  const validAdeudos = adeudosList.filter(a => a && a.empresa_cif);
  if (validAdeudos.length === 0) {
    console.log('⏸️ useEffect: No hay adeudos con empresa_cif válido');
    return; // NO cambiar el estado, mantener el anterior
  }

  const setProt = new Set();

  // Filtrar adeudos por empresa
  const list = validAdeudos.filter(a => {
    const cif = (a.empresa_cif || "").trim().toLowerCase();
    return empresaCif === cif;
  });

  console.log('✅ useEffect: Procesando protocolos...', { empresaCif, totalAdeudos: adeudosList.length, validAdeudos: validAdeudos.length, filtrados: list.length });

  // Recopilar protocolos únicos
  for (const a of list) {
    if (a?.protocoloentrada) {
      const protocolo = String(a.protocoloentrada).trim();
      if (protocolo) {
        setProt.add(protocolo);
      }
    }
  }

  // Agregar protocolos extra
  protocolosExtra.forEach(p => {
    const protocolo = String(p).trim();
    if (protocolo) setProt.add(protocolo);
  });

  const result = Array.from(setProt).sort();
  console.log('🎯 useEffect RESULTADO FINAL:', result);
  
  // Solo actualizar si realmente cambió
  setProtocolosDisponibles(prev => {
    const changed = JSON.stringify(prev) !== JSON.stringify(result);
    if (changed) {
      console.log('🔄 Actualizando protocolosDisponibles:', result);
    }
    return changed ? result : prev;
  });
}, [adeudosList, empresa?.empresa_cif, protocolosExtra]);



  //helper para registrar un protocolo nuevo a la lista local (no backend)
  const registrarProtocoloLocal = useCallback((prot) => {
    const v = String(prot || "").trim();
    if (!v) return;
    setProtocolosExtra(prev => prev.includes(v) ? prev : [...prev, v]);
  }, []);

  // --- Efecto: cargar al cambiar empresa
  // useEffect(() => {
  //   if (empresa.empresa_cif) fetchAdeudos(empresa.empresa_cif);
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [empresa.empresa_cif]);

  // --- API: cargar adeudos
const fetchAdeudos = useCallback(async (empresaId) => {
  setCargandoAdeudos(true);
  try {
    const data = await apiService.obtenerAdeudos(empresaId);
    const payload = (data && typeof data === 'object' && data.data) ? data.data : data;

    let adeudosArray = [];
    let resumenData = { pendientes: 0, liquidados: 0, total: 0 };
    let anticipoData = [];

    if (payload && typeof payload === 'object' && Array.isArray(payload.adeudos)) {
      adeudosArray = payload.adeudos;
      anticipoData = Array.isArray(payload.anticipo) ? payload.anticipo : [];
      resumenData = payload.resumen || resumenData;
    } else if (Array.isArray(payload)) {
      adeudosArray = payload;
    } else if (payload && Array.isArray(payload.data)) {
      adeudosArray = payload.data;
    }
    console.log('🔍 DEBUG: Campos originales del backend:');
    if (adeudosArray.length > 0) {
      console.log('Primer adeudo completo:', adeudosArray[0]);
      console.log('Campos disponibles:', Object.keys(adeudosArray[0]));
    }
    // 🔧 NORMALIZACIÓN CORREGIDA
    adeudosArray = adeudosArray.map(a => {
    const cif = a.empresa_cif ?? a.cif ?? a.empresaCif ?? a.EMPRESA_CIF ?? a.EMPRESA ?? empresaId;
    console.log('DEBUG CIF:', {
      original: a.empresa_cif,
      fallback_cif: a.cif,
      fallback_empresaCif: a.empresaCif,
      empresaId: empresaId,
      resultado: cif
    });      
      // CORRECCIÓN: Preservar protocoloentrada como campo principal
      const proto = a.protocoloentrada ?? 
              a.num_protocolo ?? a.numProtocolo ??
              a.protocolo_entrada ?? a.protocoloEntrada ??
              a.protocolo ?? a.entrada ?? null;

      return {
        ...a,
        empresa_cif: (cif ? String(cif).trim() : empresaId),
        // IMPORTANTE: Mantener protocoloentrada como nombre del campo
        protocoloentrada: proto != null ? String(proto).trim() : null,
        num_liquidacion: a.num_liquidacion == null ? null : Number(a.num_liquidacion),
        importe: toNum(a.importe),
        iva: toNum(a.iva),
        retencion: toNum(a.retencion),
        cs_iva: toNum(a.cs_iva),
        total: toNum(a.total),
      };
    });

    // DEBUG: Verificar que los protocolos están llegando correctamente
    console.log('📋 Protocolos encontrados:');
    console.table(adeudosArray.map(a => ({
      empresa_cif: a.empresa_cif,
      protocoloentrada: a.protocoloentrada,
      num_factura: a.num_factura || a.numfactura
    })));

    // anticipo
    let anticipoValue = 0;
    if (Array.isArray(anticipoData) && anticipoData[0]?.anticipo != null) {
      const parsed = Number(anticipoData[0].anticipo);
      anticipoValue = isNaN(parsed) ? 0 : parsed;
    }
    adeudosArray = adeudosArray.map(a => ({ ...a, anticipo: anticipoValue }));

    if (!resumenData || typeof resumenData.total !== 'number') {
      const pendientes = adeudosArray.filter(a => {
        const estado = a.estado || a.Estado || a.ESTADO;
        const numLiq = a.num_liquidacion || a.numeroLiquidacion || a.liquidacion;
        const estadoPend = estado && String(estado).toLowerCase() === 'pendiente';
        const sinLiq = !numLiq || String(numLiq).trim() === '';
        const noEsLiq = !estado || String(estado).toLowerCase() !== 'liquidado';
        return estadoPend || (sinLiq && noEsLiq);
      }).length;

      const liquidados = adeudosArray.filter(a => {
        const estado = a.estado || a.Estado || a.ESTADO;
        const numLiq = a.num_liquidacion || a.numeroLiquidacion || a.liquidacion;
        return !!numLiq || (estado && String(estado).toLowerCase() === 'liquidado');
      }).length;

      resumenData = { pendientes, liquidados, total: adeudosArray.length };
    }

    setAdeudosGuardados({ adeudos: adeudosArray, anticipo: anticipoData, resumen: resumenData });
    setEstadoAdeudos(resumenData);
    if (adeudosArray.length > 0) setVistaPrevia(true);
    
    console.debug('[adeudos normalizados]', adeudosArray.slice(0, 5));
  } catch (e) {
    console.error(e);
    setAdeudosGuardados({ adeudos: [], anticipo: [], resumen: { pendientes: 0, liquidados: 0, total: 0 } });
    setEstadoAdeudos({ pendientes: 0, liquidados: 0, total: 0 });
  } finally {
    setCargandoAdeudos(false);
  }
}, [setAdeudosGuardados, setVistaPrevia]);

  // --- Guardar adeudo
  // en useAdeudos.js
const handleGuardarAdeudo = useCallback(
  async (rmmState) => {
    const esRMM = /registro\s*mercantil.*madrid/i.test((empresa.proveedor || '').trim());

    // ¿el protocolo seleccionado existe en la lista?
    const normalizados = (protocolosDisponibles || []).map(p => String(p).trim().toLowerCase());
    const valorProt = String(empresa.protocoloentrada || '').trim().toLowerCase();
    const esProtocoloExistente = esRMM && !!valorProt && normalizados.includes(valorProt);

    // resolver concepto y num_factura / ff según el caso
    const concepto = esRMM ? 'Inscripción Registro Mercantil' : (empresa.concepto || '');

    let num_factura, ff;
    if (esRMM && esProtocoloExistente) {
      num_factura = (rmmState?.num_factura_final || '').trim();
      ff = (rmmState?.ff || '').trim();
    } else {
      num_factura = (empresa.numfactura || '').trim();
      ff = (empresa.fechafactura || '').trim();
    }

    // --- validaciones
    const camposObligatoriosBase = ['empresa_cif', 'proveedor', 'importe'];
    const faltantes = [];

    if (!empresa.empresa_cif) faltantes.push('empresa_cif');
    if (!empresa.proveedor) faltantes.push('proveedor');

    // importe siempre requerido
    if (empresa.importe === '' || empresa.importe === null || isNaN(Number(empresa.importe))) {
      faltantes.push('importe');
    }

    if (esRMM && esProtocoloExistente) {
      // obligatorios en RMM (protocolo existente)
      if (!num_factura) faltantes.push('num_factura_final');
      if (!ff)          faltantes.push('ff');
    } else {
      // obligatorios en caso normal o RMM con "nuevo protocolo"
      if (!concepto)  faltantes.push('concepto');
      if (!ff)          faltantes.push('fechafactura');
    }

    if (faltantes.length) {
      alert(`Faltan campos obligatorios: ${faltantes.join(', ')}`);
      return;
    }

    const payload = {
      num_factura,                 // 👈 ya resuelto
      concepto,                    // 👈 auto en RMM
      proveedor: empresa.proveedor,
      ff,                          // 👈 ya resuelto (dd/mm/yyyy si venía con guiones)
      importe: toNum(empresa.importe),
      iva: esRMM ? 0 : toNum(empresa.iva),
      retencion: esRMM ? 0 : toNum(empresa.retencion),
      empresa_cif: empresa.empresa_cif,
    };

    // datos “protocolo/entrada” a enviar (sólo si hay algo)
    let protocolo = null;
    const tieneProtocolo = !!(empresa.protocoloentrada && empresa.protocoloentrada.trim());

    if (tieneProtocolo) {
      protocolo = {
        num_factura,
        empresa_cif: empresa.empresa_cif,
        num_protocolo: empresa.protocoloentrada,
        // en RMM no usamos cs_iva; en caso normal respeta el campo
        cs_iva: esRMM ? 0 : toNum(empresa.csiniva || 0),
      };
    }

    try {
      setBotonGuardarDeshabilitado(true);

      // 🔧 CORRECCIÓN: La lógica debe basarse en si el protocolo existe, no en rmmDatos
      if (esRMM && esProtocoloExistente && rmmDatos) {
        // ✅ FINALIZAR RMM – protocolo existente con datos de entrada_rmm
        console.log('🔄 Finalizando RMM con protocolo existente');
        
        await apiService.finalizarRmm({
          empresa_cif: empresa.empresa_cif,
          num_entrada: empresa.protocoloentrada,
          num_factura_final: (rmmState?.num_factura_final || '').trim(),
          ff: (rmmState?.ff || '').trim(),
          concepto: 'Inscripción Registro Mercantil',
          proveedor: 'Registro Mercantil de Madrid',
          protocolo: { num_protocolo: empresa.protocoloentrada, cs_iva: 0 },
        });

      } else if (esRMM && !esProtocoloExistente) {
        // ✅ CREAR ENTRADA RMM PENDIENTE – protocolo nuevo
        console.log('📝 Creando nueva entrada RMM pendiente');
        
        await apiService.crearEntradaRmmPendiente({
          num_entrada: empresa.protocoloentrada,
          empresa_cif: empresa.empresa_cif,
          anticipo_pagado: 200,  // Siempre 200 por defecto
          fecha_anticipo: (empresa.fechafactura || '').trim(),
          diferencia: Number(rmmState?.diferencia) || 0,
          fecha_devolucion_diferencia: rmmState?.fecha_devolucion_diferencia || null
        });
        
        registrarProtocoloLocal(empresa.protocoloentrada.trim());
        console.log('Entrada RMM pendiente creada exitosamente');
        
      } else {
        // ✅ ALTA NORMAL (no RMM)
        console.log('📄 Creando adeudo normal');
        
        const payloadAdeudo = {
          num_factura: (empresa.numfactura || '').trim(),
          concepto: empresa.concepto,
          proveedor: empresa.proveedor,
          ff: (empresa.fechafactura || '').trim(),
          importe: toNum(empresa.importe),
          iva: toNum(empresa.iva),
          retencion: toNum(empresa.retencion),
          empresa_cif: empresa.empresa_cif,
        };

        const protocolo = empresa.protocoloentrada
          ? { num_protocolo: empresa.protocoloentrada, cs_iva: toNum(empresa.csiniva || 0) }
          : null;

        await apiService.guardarAdeudo(payloadAdeudo, protocolo);
      }

      // Reset form y refresh data
      const empresaActual = empresa.empresa_cif;
      setEmpresa({
        empresa_cif: empresaActual,
        concepto: '',
        proveedor: '',
        fechafactura: '',
        numfactura: '',
        protocoloentrada: '',
        importe: '',
        iva: 0,
        retencion: 0,
        csiniva: '',
        total: 0,
        anticipocliente: ''
      });

      await fetchAdeudos(empresaActual);
      setVistaPrevia(true);
      alert('Operación realizada correctamente.');
    } catch (e) {
      console.error(e);
      alert(`Ocurrió un error: ${e.message || e}`);
    } finally {
      setBotonGuardarDeshabilitado(false);
    }
  },
  [empresa, protocolosDisponibles, fetchAdeudos, setEmpresa, setVistaPrevia, rmmDatos, registrarProtocoloLocal]
);


  // --- Habilitaciones
  const puedeGenerarLiquidacionLocal = useCallback((empresaCif) => {
    if (!empresaCif || cargandoAdeudos) return false;
    const resumenPend = Number(adeudosGuardados?.resumen?.pendientes ?? 0);
    if (resumenPend > 0) return true;

    const lista = Array.isArray(adeudosGuardados?.adeudos) ? adeudosGuardados.adeudos : [];
    const adeudosPend = lista.filter(matchEmpresa(empresaCif)).filter(isPendiente);
    return adeudosPend.length > 0;
  }, [adeudosGuardados, cargandoAdeudos]);

  // --- Navegación / acciones
  const handleGenerarBorrador = useCallback(() => {
    if (!empresa.empresa_cif) return alert("Selecciona una empresa primero.");
    if (!puedeGenerarLiquidacionLocal(empresa.empresa_cif)) return alert("No hay adeudos pendientes para esta empresa.");
    setVistaActual('borrador');
    setEmpresaSeleccionadaBorrador(empresa.empresa_cif);
  }, [empresa, puedeGenerarLiquidacionLocal]);

  const handleGenerarLiquidacionClick = useCallback(() => {
    if (!empresa.empresa_cif) return alert("Selecciona una empresa primero.");
    if (!puedeGenerarLiquidacionLocal(empresa.empresa_cif)) return alert("No hay adeudos pendientes para esta empresa.");
    setVistaActual('liquidacion');
    setEmpresaSeleccionadaLiquidacion(empresa.empresa_cif);
  }, [empresa, puedeGenerarLiquidacionLocal]);

  const volverFormularioPrincipal = useCallback(() => {
    setVistaActual('principal');
    setEmpresaSeleccionadaBorrador('');
    setEmpresaSeleccionadaLiquidacion('');
    setHonorariosSinIVA(0);
    setMostrarVistaPreviaPdf(false);
    if (empresa.empresa_cif && adeudosList.length > 0) setVistaPrevia(true);
  }, [empresa.empresa_cif, adeudosList.length, setVistaPrevia]);

  // --- Previews PDFs
  const handleGenerarPdfBorrador = useCallback(() => {
    if (!empresaSeleccionadaBorrador) return alert("Selecciona una empresa válida.");
    const rows = (Array.isArray(adeudosList) ? adeudosList : [])
      .filter(matchEmpresa(empresaSeleccionadaBorrador))
      .filter(isPendiente)
      .map(normalizeAdeudoForPdf);

    if (rows.length === 0) return alert("No hay adeudos pendientes para esta empresa.");
    setTipoPdfPrevia('borrador');
    setMostrarVistaPreviaPdf(true);
  }, [empresaSeleccionadaBorrador, adeudosList]);

  const handleVerPreviaLiquidacion = useCallback(() => {
    if (!empresaSeleccionadaLiquidacion) return alert("Selecciona una empresa válida.");
    if (!honorariosSinIVA || isNaN(honorariosSinIVA)) return alert("Ingresa los honorarios sin IVA.");

    const rows = (Array.isArray(adeudosList) ? adeudosList : [])
      .filter(matchEmpresa(empresaSeleccionadaLiquidacion))
      .filter(isPendiente);

    if (rows.length === 0) return alert("No hay adeudos pendientes para esta empresa.");
    setTipoPdfPrevia('liquidacion');
    setMostrarVistaPreviaPdf(true);
  }, [empresaSeleccionadaLiquidacion, honorariosSinIVA, adeudosList]);

  const confirmarDescargaPdf = useCallback(async () => {
    if (tipoPdfPrevia === 'borrador') {
      const rows = (Array.isArray(adeudosList) ? adeudosList : [])
        .filter(matchEmpresa(empresaSeleccionadaBorrador))
        .filter(isPendiente)
        .map(normalizeAdeudoForPdf);

      pdfGenerator.generarPdfBorrador(empresaSeleccionadaBorrador, rows);
      setMostrarVistaPreviaPdf(false);
      return;
    }

    if (tipoPdfPrevia === 'liquidacion') {
      setMostrarVistaPreviaPdf(false);

      // crear liquidación + obtener detalle
      const checkRaw = await apiService.verificarAdeudosPendientes(empresaSeleccionadaLiquidacion);
      const checkResult = (checkRaw && typeof checkRaw === 'object' && checkRaw.data) ? checkRaw.data : checkRaw;
      const hayPendientes = Boolean(checkResult?.hay_pendientes) || Number(checkResult?.total_pendientes) > 0;
      if (!hayPendientes) return alert("No hay adeudos pendientes para liquidar en esta empresa.");

      const crearRaw = await apiService.crearLiquidacion(empresaSeleccionadaLiquidacion, honorariosSinIVA);
      const crear = (crearRaw && typeof crearRaw === 'object' && crearRaw.data) ? crearRaw.data : crearRaw;
      const numeroLiquidacion = crear?.num_liquidacion;
      if (!numeroLiquidacion) throw new Error('No llegó num_liquidacion');

      const liqRaw = await apiService.obtenerLiquidacion(empresaSeleccionadaLiquidacion, numeroLiquidacion);
      const liq = (liqRaw && typeof liqRaw === 'object' && liqRaw.data) ? liqRaw.data : liqRaw;
      const rows = (Array.isArray(liq) ? liq : (liq?.adeudos || [])).map(normalizeAdeudoForPdf);

      pdfGenerator.generarPdfLiquidacionFinal(
        empresaSeleccionadaLiquidacion, rows, honorariosSinIVA, numeroLiquidacion
      );

      alert(`${crear?.mensaje || 'Liquidación creada exitosamente'}`);
      await fetchAdeudos(empresaSeleccionadaLiquidacion);
      setVistaPrevia(true);
      return;
    }

    setMostrarVistaPreviaPdf(false);
  }, [
    tipoPdfPrevia, adeudosList, empresaSeleccionadaBorrador, empresaSeleccionadaLiquidacion,
    honorariosSinIVA, fetchAdeudos, setVistaPrevia
  ]);

  // --- Expuesto
  return {
    // estado
    vistaActual, setVistaActual,
    empresaSeleccionadaBorrador, setEmpresaSeleccionadaBorrador,
    empresaSeleccionadaLiquidacion, setEmpresaSeleccionadaLiquidacion,
    mostrarVistaPreviaPdf, setMostrarVistaPreviaPdf,
    tipoPdfPrevia, setTipoPdfPrevia,
    importeBloqueado, setImporteBloqueado,
    honorariosSinIVA, setHonorariosSinIVA,
    botonGuardarDeshabilitado,
    cargandoAdeudos,
    estadoAdeudos,
    adeudosList,
    protocolosDisponibles,
    prefillDesdeProtocolo,
    rmmReadOnly,
    rmmDatos,
    registrarProtocoloLocal,

    // api/handlers
    fetchAdeudos,
    handleGuardarAdeudo,
    puedeGenerarLiquidacionLocal,
    handleGenerarBorrador,
    handleGenerarLiquidacionClick,
    volverFormularioPrincipal,
    handleGenerarPdfBorrador,
    handleVerPreviaLiquidacion,
    confirmarDescargaPdf,
  };
}
