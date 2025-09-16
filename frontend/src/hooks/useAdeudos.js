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

  // --- Lista segura
  const adeudosList = Array.isArray(adeudosGuardados?.adeudos) ? adeudosGuardados.adeudos : [];

  // --- Efecto: cargar al cambiar empresa
  useEffect(() => {
    if (empresa.empresa_cif) fetchAdeudos(empresa.empresa_cif);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [empresa.empresa_cif]);

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

      // normalización mínima
      adeudosArray = adeudosArray.map(a => ({
        ...a,
        empresa_cif: a.empresa_cif || empresaId,
        num_liquidacion: a.num_liquidacion == null ? null : Number(a.num_liquidacion),
        importe: toNum(a.importe), iva: toNum(a.iva), retencion: toNum(a.retencion),
        cs_iva: toNum(a.cs_iva), total: toNum(a.total),
      }));

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
    } catch (e) {
      console.error(e);
      setAdeudosGuardados({ adeudos: [], anticipo: [], resumen: { pendientes: 0, liquidados: 0, total: 0 } });
      setEstadoAdeudos({ pendientes: 0, liquidados: 0, total: 0 });
    } finally {
      setCargandoAdeudos(false);
    }
  }, [setAdeudosGuardados, setVistaPrevia]);

  // --- Guardar adeudo
  const handleGuardarAdeudo = useCallback(async () => {
    const esRMM = (empresa.proveedor || '').trim().toLowerCase() === 'registro mercantil de madrid';
    const campos = esRMM
      ? ["empresa_cif", "concepto", "proveedor", "importe"] // numfactura y fechafactura NO obligatorios
      : ["empresa_cif", "concepto", "proveedor", "fechafactura", "numfactura", "importe"];
    for (const k of campos) {
      const v = empresa[k];
      if (!v && v !== 0) { alert(`El campo "${k}" es obligatorio.`); return; }
    }

    let ff = empresa.fechafactura;
    if (ff && !ff.includes('/')) {
      const [y, m, d] = ff.split('-'); ff = `${d}/${m}/${y}`;
    }

    const payload = {
      num_factura: empresa.numfactura,
      concepto: empresa.concepto,
      proveedor: empresa.proveedor,
      ff,
      importe: toNum(empresa.importe),
      iva: esRMM ? 0 : toNum(empresa.iva),
      retencion: esRMM ? 0 : toNum(empresa.retencion),
      empresa_cif: empresa.empresa_cif,
    };
    let protocolo = null;

    // Verificar si hay protocolo de entrada o conceptos sin IVA
    const tieneProtocolo = empresa.protocoloentrada && empresa.protocoloentrada.trim();
    const tieneCsIva = empresa.csiniva && toNum(empresa.csiniva) > 0;

    if (tieneProtocolo || tieneCsIva) {
      protocolo = {
        num_factura: empresa.numfactura,
        empresa_cif: empresa.empresa_cif,
        cs_iva: toNum(empresa.csiniva)
      };

      // Solo agregar num_protocolo si realmente existe
      if (tieneProtocolo) {
        protocolo.num_protocolo = empresa.protocoloentrada;
      }
    }

    try {
      setBotonGuardarDeshabilitado(true);
      await apiService.guardarAdeudo(payload, protocolo); // protocolo será null si no hay datos
      const empresaActual = empresa.empresa_cif;

      setEmpresa({
        empresa_cif: empresaActual, concepto: "", proveedor: "", fechafactura: "", numfactura: "",
        protocoloentrada: "", importe: "", iva: 0, retencion: 0, csiniva: "", total: 0, anticipocliente: ""
      });

      await fetchAdeudos(empresaActual);
      setVistaPrevia(true);
      alert("Adeudo guardado correctamente.");
    } catch (e) {
      console.error(e); alert(`Ocurrió un error: ${e.message}`);
    } finally {
      setBotonGuardarDeshabilitado(false);
    }
  }, [empresa, fetchAdeudos, setEmpresa, setVistaPrevia]);

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
