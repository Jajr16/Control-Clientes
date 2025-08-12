import { useState } from "react";
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

import * as pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from "pdfmake/build/vfs_fonts";
pdfMake.vfs = pdfFonts.vfs;

// Normaliza cualquier respuesta para obtener SIEMPRE un array de adeudos
const toArray = (x) =>
  Array.isArray(x)
    ? x
    : (x && Array.isArray(x.adeudos) ? x.adeudos : []);

const AdeudosForm = ({
  empresa,
  setEmpresa,
  adeudosGuardados,
  setAdeudosGuardados,
  validationErrors = {},
  empresasDisponibles = [],
  mostrarVistaPrevia,
  setVistaPrevia
}) => {
  const adeudosList = toArray(adeudosGuardados);


  const getError = (field) => validationErrors[field];
  const [importeBloqueado, setImporteBloqueado] = useState(false);
  const [mostrarFormularioLiquidacion, setMostrarFormularioLiquidacion] = useState(false);
  const [honorariosSinIVA, setHonorariosSinIVA] = useState(0);
  
  // Nuevo estado para controlar las vistas
  const [vistaActual, setVistaActual] = useState('principal'); // 'principal', 'borrador', 'liquidacion'
  const [empresaSeleccionadaBorrador, setEmpresaSeleccionadaBorrador] = useState('');
  const [empresaSeleccionadaLiquidacion, setEmpresaSeleccionadaLiquidacion] = useState('');
  const [mostrarVistaPreviaPdf, setMostrarVistaPreviaPdf] = useState(false);
  const [tipoPdfPrevia, setTipoPdfPrevia] = useState(''); // 'borrador' o 'liquidacion'

  console.log("Estado adeudosGuardados:", adeudosList);
  console.log("Es array:", Array.isArray(adeudosList));
  
  const adeudosEmpresa = adeudosList.filter(a => a.empresa_cif === empresa.empresa_cif);

  const handleGenerarBorrador = () => {
    if (!empresa.empresa_cif || adeudosEmpresa.length === 0) return;
    setVistaActual('borrador');
    setEmpresaSeleccionadaBorrador(empresa.empresa_cif);
  };

  const handleGenerarLiquidacionClick = () => {
    if (!empresa.empresa_cif || adeudosEmpresa.length === 0) return;
    setVistaActual('liquidacion');
    setEmpresaSeleccionadaLiquidacion(empresa.empresa_cif);
  };

  const [estadoAdeudos, setEstadoAdeudos] = useState({
    pendientes: 0,
    liquidados: 0,
    total: 0
  });

  // 1. Función modificada para generar liquidación final con numeración automática
  const handleGenerarLiquidacionFinal = async () => {
    if (!empresaSeleccionadaLiquidacion) {
      alert("Selecciona una empresa válida.");
      return;
    }

    if (!honorariosSinIVA || isNaN(honorariosSinIVA) || honorariosSinIVA <= 0) {
      alert("Ingresa los honorarios sin IVA (debe ser mayor a 0).");
      return;
    }

    try {
      // Verificar primero si hay adeudos pendientes
      const checkResponse = await fetch(`http://localhost:3000/api/adeudos/empresa/${empresaSeleccionadaLiquidacion}/check-pendientes`);
      
      if (!checkResponse.ok) {
        throw new Error("Error al verificar adeudos pendientes");
      }
      
      const checkData = await checkResponse.json();
      
      if (!checkData.hay_pendientes) {
        alert("No hay adeudos pendientes para liquidar en esta empresa.");
        return;
      }

      const confirmMessage = `¿Confirmar liquidación de ${checkData.total_pendientes} adeudos pendientes?`;
      if (!confirm(confirmMessage)) {
        return;
      }

      // Llamar al backend para crear la liquidación
      const response = await fetch("http://localhost:3000/api/liquidaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          empresa_cif: empresaSeleccionadaLiquidacion,
          honorarios_sin_iva: parseFloat(honorariosSinIVA)
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al crear la liquidación");
      }

      const result = await response.json();
      const numeroLiquidacion = result.num_liquidacion;

      // Obtener los adeudos que se acaban de liquidar para el PDF
      const adeudosLiquidadosResponse = await fetch(`http://localhost:3000/api/liquidaciones/${empresaSeleccionadaLiquidacion}/${numeroLiquidacion}`);
      const adeudosLiquidados = await adeudosLiquidadosResponse.json();

      // Generar PDF con el número de liquidación
      generarPdfLiquidacionFinal(empresaSeleccionadaLiquidacion, adeudosLiquidados, honorariosSinIVA, numeroLiquidacion);
      
      alert(`${result.mensaje || 'Liquidación creada exitosamente'}`);
      
      // Actualizar la vista previa con los datos actualizados
      await fetchAdeudos(empresaSeleccionadaLiquidacion);

    } catch (error) {
      console.error("Error al crear liquidación:", error);
      alert(`Error al crear la liquidación: ${error.message}`);
    }
  };

  const handleGenerarPdfBorrador = () => {
    if (!empresaSeleccionadaBorrador) {
      alert("Selecciona una empresa válida.");
      return;
    }

    const adeudosEmpresa = adeudosList.filter(
      a => a.empresa_cif === empresaSeleccionadaBorrador
    );

    if (adeudosEmpresa.length === 0) {
      alert("No hay adeudos guardados para esta empresa.");
      return;
    }

    setTipoPdfPrevia('borrador');
    setMostrarVistaPreviaPdf(true);
  };

  const handleVerPreviaLiquidacion = () => {
    if (!empresaSeleccionadaLiquidacion) {
      alert("Selecciona una empresa válida.");
      return;
    }

    const adeudosEmpresa = adeudosList.filter(
      a => a.empresa_cif === empresaSeleccionadaLiquidacion
    );

    if (adeudosEmpresa.length === 0) {
      alert("No hay adeudos guardados para esta empresa.");
      return;
    }

    if (!honorariosSinIVA || isNaN(honorariosSinIVA)) {
      alert("Ingresa los honorarios sin IVA.");
      return;
    }

    setTipoPdfPrevia('liquidacion');
    setMostrarVistaPreviaPdf(true);
  };

  const confirmarDescargaPdf = async () => {
    if (tipoPdfPrevia === 'borrador') {
      const adeudosEmpresa = adeudosList.filter(
        a => a.empresa_cif === empresaSeleccionadaBorrador
      );
      generarPdfBorrador(empresaSeleccionadaBorrador, adeudosEmpresa);
    } else if (tipoPdfPrevia === 'liquidacion') {
      // Para liquidación final, usar la función que incluye el proceso completo
      setMostrarVistaPreviaPdf(false);
      await handleGenerarLiquidacionFinal();
      return; // No ejecutar el resto
    }
    setMostrarVistaPreviaPdf(false);
  };

  const volverFormularioPrincipal = () => {
    setVistaActual('principal');
    setEmpresaSeleccionadaBorrador('');
    setEmpresaSeleccionadaLiquidacion('');
    setHonorariosSinIVA(0);
    setMostrarVistaPreviaPdf(false);
  };

  // Función para obtener datos calculados
  const obtenerDatosCalculados = (empresaCif, adeudos, honorariosSinIVA = 0) => {
    const adeudosFiltrados = adeudos.filter(a => a.empresa_cif === empresaCif);
    const empresaNombre = empresasDisponibles.find(e => e.cif === empresaCif)?.nombre || empresaCif;
    
    // Calcular totales
    const totalImporte = adeudosFiltrados.reduce((acc, a) => acc + Number(a.importe || 0), 0);
    const totalIVA = adeudosFiltrados.reduce((acc, a) => acc + Number(a.iva || 0), 0);
    const totalRetencion = adeudosFiltrados.reduce((acc, a) => acc + Number(a.retencion || 0), 0);
    const totalConceptosSinIVA = adeudosFiltrados.reduce((acc, a) => acc + Number(a.cs_iva || 0), 0);
    const totalFacturas = adeudosFiltrados.reduce((acc, a) => acc + Number(a.total || 0), 0);
    
    // Honorarios
    const honorariosConIVA = Number(honorariosSinIVA || 0) * 1.21;
    const anticipo = Number(adeudosFiltrados[0]?.anticipo || 0);
    
    // Adeudo pendiente
    const adeudoPendiente = totalFacturas + honorariosConIVA - anticipo;

    // Fechas
    const fechas = adeudosFiltrados
      .map(a => new Date(a.ff))
      .filter(f => !isNaN(f.getTime()))
      .sort((a, b) => a - b);

    return {
      adeudosFiltrados,
      empresaNombre,
      totalImporte,
      totalIVA,
      totalRetencion,
      totalConceptosSinIVA,
      totalFacturas,
      honorariosSinIVA: Number(honorariosSinIVA || 0),
      honorariosConIVA,
      anticipo,
      adeudoPendiente,
      fechas,
      fechaDesde: fechas.length > 0 ? fechas[0] : null,
      fechaHasta: fechas.length > 0 ? fechas[fechas.length - 1] : null
    };
  };

  const formatearFecha = (fecha) => {
    const meses = [
      "enero", "febrero", "marzo", "abril", "mayo", "junio",
      "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
    ];
    return `${fecha.getDate()} de ${meses[fecha.getMonth()]} de ${fecha.getFullYear()}`;
  };

  const renderVistaPreviaPdf = () => {
    if (!mostrarVistaPreviaPdf) return null;

    const empresaCif = tipoPdfPrevia === 'borrador' ? empresaSeleccionadaBorrador : empresaSeleccionadaLiquidacion;
    const datos = obtenerDatosCalculados(empresaCif, adeudosList, honorariosSinIVA);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg max-w-6xl max-h-[95vh] overflow-y-auto w-full mx-4 shadow-2xl">
          {/* Header del modal */}
          <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center rounded-t-lg">
            <div>
              <h3 className="text-2xl font-bold text-gray-800">Vista Previa del PDF</h3>
              <p className="text-sm text-gray-600 mt-1">
                {tipoPdfPrevia === 'borrador' ? 'Borrador de liquidación' : 'Liquidación final'}
              </p>
            </div>
            <button
              onClick={() => setMostrarVistaPreviaPdf(false)}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold w-8 h-8 flex items-center justify-center"
            >
              ×
            </button>
          </div>

          {/* Contenido del documento */}
          <div className="p-8">
            <div className="bg-white border-2 border-gray-200 rounded-lg p-8 shadow-lg max-w-4xl mx-auto">
              
              {/* Encabezado del documento */}
              <div className="text-center mb-8 border-b-2 border-blue-600 pb-6">
                <div className="mb-4">
                  <h1 className="text-3xl font-bold text-blue-800 mb-2">FINATECH</h1>
                  <p className="text-sm text-gray-600">Servicios Financieros y Consultoría</p>
                </div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-3">
                  {tipoPdfPrevia === 'borrador' ? 'BORRADOR DE LIQUIDACIÓN DE ADEUDOS' : 'LIQUIDACIÓN FINAL DE ADEUDOS'}
                </h2>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>Fecha de generación:</strong> {new Date().toLocaleDateString('es-ES')}</p>
                  <p><strong>Empresa:</strong> {datos.empresaNombre}</p>
                  <p><strong>CIF:</strong> {empresaCif}</p>
                  {datos.fechaDesde && datos.fechaHasta && (
                    <p><strong>Período:</strong> {formatearFecha(datos.fechaDesde)} al {formatearFecha(datos.fechaHasta)}</p>
                  )}
                </div>
              </div>

              {/* Tabla de adeudos mejorada */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 border-l-4 border-blue-600 pl-3">
                  Detalle de Adeudos
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse bg-white rounded-lg overflow-hidden shadow-sm">
                    <thead>
                      <tr className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                        <th className="border border-blue-500 p-3 text-left text-sm font-semibold">Fecha</th>
                        <th className="border border-blue-500 p-3 text-left text-sm font-semibold">Concepto</th>
                        <th className="border border-blue-500 p-3 text-left text-sm font-semibold">Proveedor</th>
                        <th className="border border-blue-500 p-3 text-left text-sm font-semibold">N° Factura</th>
                        <th className="border border-blue-500 p-3 text-right text-sm font-semibold">Importe (€)</th>
                        <th className="border border-blue-500 p-3 text-right text-sm font-semibold">IVA (€)</th>
                        <th className="border border-blue-500 p-3 text-right text-sm font-semibold">Retención (€)</th>
                        <th className="border border-blue-500 p-3 text-right text-sm font-semibold">Total (€)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {datos.adeudosFiltrados.map((a, i) => (
                        <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                          <td className="border border-gray-300 p-3 text-sm">
                            {new Date(a.ff).toLocaleDateString('es-ES')}
                          </td>
                          <td className="border border-gray-300 p-3 text-sm">{a.concepto || "—"}</td>
                          <td className="border border-gray-300 p-3 text-sm">{a.proveedor || "—"}</td>
                          <td className="border border-gray-300 p-3 text-sm">{a.num_factura || "—"}</td>
                          <td className="border border-gray-300 p-3 text-sm text-right font-mono">
                            {Number(a.importe || 0).toLocaleString('es-ES', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                          </td>
                          <td className="border border-gray-300 p-3 text-sm text-right font-mono">
                            {Number(a.iva || 0).toLocaleString('es-ES', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                          </td>
                          <td className="border border-gray-300 p-3 text-sm text-right font-mono">
                            {Number(a.retencion || 0).toLocaleString('es-ES', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                          </td>
                          <td className="border border-gray-300 p-3 text-sm text-right font-mono font-semibold">
                            {Number(a.total || 0).toLocaleString('es-ES', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                          </td>
                        </tr>
                      ))}
                      
                      {/* Fila de totales */}
                      <tr className="bg-gradient-to-r from-gray-100 to-gray-200 font-bold border-t-2 border-gray-400">
                        <td className="border border-gray-400 p-3 text-right text-sm" colSpan={4}>
                          <strong>SUBTOTALES</strong>
                        </td>
                        <td className="border border-gray-400 p-3 text-right text-sm font-mono">
                          <strong>{datos.totalImporte.toLocaleString('es-ES', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</strong>
                        </td>
                        <td className="border border-gray-400 p-3 text-right text-sm font-mono">
                          <strong>{datos.totalIVA.toLocaleString('es-ES', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</strong>
                        </td>
                        <td className="border border-gray-400 p-3 text-right text-sm font-mono">
                          <strong>{datos.totalRetencion.toLocaleString('es-ES', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</strong>
                        </td>
                        <td className="border border-gray-400 p-3 text-right text-sm font-mono">
                          <strong>{datos.totalFacturas.toLocaleString('es-ES', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</strong>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Resumen financiero */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Resumen de facturas */}
                <div className="bg-blue-50 border-l-4 border-blue-600 p-5 rounded-r-lg">
                  <h3 className="font-semibold text-blue-800 mb-3 text-lg">Resumen de Facturas</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-700">Total de registros:</span>
                      <span className="font-semibold">{datos.adeudosFiltrados.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Total facturas pagadas:</span>
                      <span className="font-semibold font-mono">
                        {datos.totalFacturas.toLocaleString('es-ES', {minimumFractionDigits: 2, maximumFractionDigits: 2})} €
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Anticipo recibido:</span>
                      <span className="font-semibold font-mono">
                        {datos.anticipo.toLocaleString('es-ES', {minimumFractionDigits: 2, maximumFractionDigits: 2})} €
                      </span>
                    </div>
                  </div>
                </div>

                {/* Honorarios (solo para liquidación final) */}
                {tipoPdfPrevia === 'liquidacion' && (
                  <div className="bg-green-50 border-l-4 border-green-600 p-5 rounded-r-lg">
                    <h3 className="font-semibold text-green-800 mb-3 text-lg">Honorarios Finatech</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-700">Base imponible:</span>
                        <span className="font-semibold font-mono">
                          {datos.honorariosSinIVA.toLocaleString('es-ES', {minimumFractionDigits: 2, maximumFractionDigits: 2})} €
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700">IVA (21%):</span>
                        <span className="font-semibold font-mono">
                          {(datos.honorariosSinIVA * 0.21).toLocaleString('es-ES', {minimumFractionDigits: 2, maximumFractionDigits: 2})} €
                        </span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span className="text-gray-700 font-semibold">Total honorarios:</span>
                        <span className="font-bold font-mono text-green-700">
                          {datos.honorariosConIVA.toLocaleString('es-ES', {minimumFractionDigits: 2, maximumFractionDigits: 2})} €
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Liquidación final */}
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-400 rounded-lg p-6">
                <h3 className="font-bold text-yellow-800 mb-4 text-xl text-center">LIQUIDACIÓN FINAL</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <p className="text-sm text-gray-600 mb-1">Total Facturas</p>
                    <p className="text-lg font-bold text-gray-800 font-mono">
                      {datos.totalFacturas.toLocaleString('es-ES', {minimumFractionDigits: 2, maximumFractionDigits: 2})} €
                    </p>
                  </div>
                  {tipoPdfPrevia === 'liquidacion' && (
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <p className="text-sm text-gray-600 mb-1">Honorarios</p>
                      <p className="text-lg font-bold text-green-700 font-mono">
                        + {datos.honorariosConIVA.toLocaleString('es-ES', {minimumFractionDigits: 2, maximumFractionDigits: 2})} €
                      </p>
                    </div>
                  )}
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <p className="text-sm text-gray-600 mb-1">Anticipo Recibido</p>
                    <p className="text-lg font-bold text-blue-700 font-mono">
                      - {datos.anticipo.toLocaleString('es-ES', {minimumFractionDigits: 2, maximumFractionDigits: 2})} €
                    </p>
                  </div>
                </div>
                
                <div className="mt-6 text-center">
                  <div className="bg-white rounded-lg p-6 shadow-lg border-2 border-yellow-400">
                    <p className="text-lg font-semibold text-gray-700 mb-2">ADEUDO PENDIENTE</p>
                    <p className={`text-3xl font-bold font-mono ${datos.adeudoPendiente >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {datos.adeudoPendiente.toLocaleString('es-ES', {minimumFractionDigits: 2, maximumFractionDigits: 2})} €
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      {datos.adeudoPendiente >= 0 ? 'Pendiente de pago por el cliente' : 'Saldo a favor del cliente'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-8 pt-6 border-t border-gray-300 text-center text-xs text-gray-500">
                <p>Documento generado automáticamente por el sistema FINATECH</p>
                <p>Para consultas o aclaraciones, contacte con nuestro departamento financiero</p>
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="sticky bottom-0 bg-white border-t p-6 flex justify-end gap-3 rounded-b-lg">
            <button
              onClick={() => setMostrarVistaPreviaPdf(false)}
              className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={confirmarDescargaPdf}
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all font-medium shadow-lg"
            >
              Descargar PDF
            </button>
          </div>
        </div>
      </div>
    );
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    const camposNumericos = [
      "importe",
      "csiniva",
      "anticipocliente",
    ];

    const parsedValue = camposNumericos.includes(name)
      ? value === "" ? "" : parseFloat(value)
      : value;

    setEmpresa((prev) => {
      let updated = { ...prev, [name]: parsedValue };

      if (name === "concepto" && parsedValue === "Registro Mercantil de Madrid") {
        updated.importe = 200;
        setImporteBloqueado(true);
      } else if (name === "concepto") {
        setImporteBloqueado(false);
      }

      const importe = parseFloat(updated.importe) || 0;
      const csiniva = parseFloat(updated.csiniva) || 0;
      const anticipo_cliente = parseFloat(updated.anticipocliente) || 0;

      const iva = +(importe * 0.21).toFixed(2);
      const retencion = +(importe * 0.15).toFixed(2);
      const total = +(importe + iva - retencion + csiniva).toFixed(2);
      const total_adeudos = total;
      const adeudo_pendiente = +(total_adeudos - anticipo_cliente).toFixed(2);

      return {
        ...updated,
        iva,
        retencion,
        total,
        total_adeudos,
        adeudo_pendiente
      };
    });
  };

  const camposRequeridos = [
    "empresa_cif",
    "concepto",
    "proveedor",
    "fechafactura",
    "numfactura",
    "importe",
    "anticipocliente",
  ];

  const validarCampos = () => {
    for (const campo of camposRequeridos) {
      const valor = empresa[campo];
      if (valor === undefined || valor === "" || (typeof valor === "number" && isNaN(valor))) {
        alert(`El campo "${campo}" es obligatorio.`);
        return false;
      }
    }
    return true;
  };

  const [botonGuardarDeshabilitado, setBotonGuardarDeshabilitado] = useState(false);

  // 3. Función actualizada para obtener adeudos con manejo de estado
  const fetchAdeudos = async (empresaId) => {
    try {
      const response = await fetch(`http://localhost:3000/api/adeudos/empresa/${empresaId}`);
      if (!response.ok) throw new Error("Error al obtener adeudos");
      
      const data = await response.json();
      
      console.log("Datos del backend:", data);
      console.log("Longitud:", data?.length);
      console.log("Es array:", Array.isArray(data));

      // Si el backend devuelve el formato actualizado con resumen
      if (data.adeudos && data.resumen) {
      setAdeudosGuardados(Array.isArray(data.adeudos) ? data.adeudos : []);
      setEstadoAdeudos({
        pendientes: data.resumen.pendientes,
        liquidados: data.resumen.liquidados,
        total: data.resumen.total
      });
    } else {
      const adeudosArray = Array.isArray(data) ? data : [];
      setAdeudosGuardados(adeudosArray);
      
      const pendientes = adeudosArray.filter(a => !a.num_liquidacion).length;
      const liquidados = adeudosArray.filter(a => a.num_liquidacion).length;
      
      setEstadoAdeudos({
        pendientes,
        liquidados,
        total: adeudosArray.length
      });
    }

      
      setVistaPrevia(true);
      
    } catch (error) {
      console.error("Error al cargar adeudos:", error);
      alert("Error al cargar los adeudos de la empresa");
    }
  };

  // 4. Función para verificar si se puede generar liquidación
  const puedeGenerarLiquidacion = (empresaCif) => {
    if (!empresaCif) return false;
    
    const adeudosEmpresa = adeudosList.filter(a => a.empresa_cif === empresaCif);
    const adeudosPendientes = adeudosEmpresa.filter(a => a.estado === 'PENDIENTE' || !a.num_liquidacion);
    
    return adeudosPendientes.length > 0;
  };

  // 5. Función para mostrar el estado de liquidación en la vista previa
  const renderEstadoLiquidacion = (adeudo) => {
    if (adeudo.num_liquidacion) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Liquidado N° {adeudo.num_liquidacion}
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          Pendiente
        </span>
      );
    }
  };

  // 6. Componente para mostrar resumen de estados
  const renderResumenEstados = () => {
    if (estadoAdeudos.total === 0) return null;
    
    return (
      <div className="bg-gray-50 border rounded-lg p-4 mb-4">
        <h4 className="font-semibold text-gray-700 mb-2">Resumen de Adeudos</h4>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-yellow-100 rounded p-2">
            <div className="text-2xl font-bold text-yellow-800">{estadoAdeudos.pendientes}</div>
            <div className="text-sm text-yellow-600">Pendientes</div>
          </div>
          <div className="bg-green-100 rounded p-2">
            <div className="text-2xl font-bold text-green-800">{estadoAdeudos.liquidados}</div>
            <div className="text-sm text-green-600">Liquidados</div>
          </div>
          <div className="bg-blue-100 rounded p-2">
            <div className="text-2xl font-bold text-blue-800">{estadoAdeudos.total}</div>
            <div className="text-sm text-blue-600">Total</div>
          </div>
        </div>
      </div>
    );
  };

  const handleGuardarAdeudo = async () => {
    if (!validarCampos()) return;

    const cleanedEmpresa = {
      num_factura: empresa.numfactura,
      concepto: empresa.concepto,
      proveedor: empresa.proveedor,
      ff: empresa.fechafactura,
      importe: parseFloat(empresa.importe) || 0,
      iva: parseFloat(empresa.iva) || 0,
      retencion: parseFloat(empresa.retencion) || 0,
      empresa_cif: empresa.empresa_cif
    };

    try {
      const response = await fetch("http://localhost:3000/api/adeudos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adeudo: cleanedEmpresa,
          protocolo: {
            num_factura: empresa.numfactura,
            protocolo_entrada: empresa.protocoloentrada,
            cs_iva: parseFloat(empresa.csiniva) || 0
          },
          ajuste: {
            num_factura: empresa.numfactura,
            diferencia: parseFloat(empresa.total_adeudos) - parseFloat(empresa.anticipocliente || 0)
          }
        })
      });

      if (response.status === 409) {
        const errorData = await response.json();
        alert(errorData.error || "El número de factura ya existe.");
        return;
      }

      if (!response.ok) throw new Error("Error al guardar el adeudo");

      alert("Adeudo guardado correctamente.");

      fetchAdeudos(empresa.empresa_cif);
      setVistaPrevia(true);
    } catch (error) {
      console.error("Error al guardar:", error);
      alert(`Ocurrió un error: ${error.message}`);
    }
  };

// Funciones corregidas para generar PDFs con tablas que se ajusten al ancho de la página

  const generarPdfBorrador = (empresaCif, adeudos) => {
    const datos = obtenerDatosCalculados(empresaCif, adeudos);

    const tabla = [
      [
        { text: "Fecha", style: 'tableHeader', fillColor: '#3B82F6' },
        { text: "Concepto", style: 'tableHeader', fillColor: '#3B82F6' },
        { text: "Proveedor", style: 'tableHeader', fillColor: '#3B82F6' },
        { text: "N° Factura", style: 'tableHeader', fillColor: '#3B82F6' },
        { text: "Importe (€)", style: 'tableHeader', alignment: 'right', fillColor: '#3B82F6' },
        { text: "IVA (€)", style: 'tableHeader', alignment: 'right', fillColor: '#3B82F6' },
        { text: "Retención (€)", style: 'tableHeader', alignment: 'right', fillColor: '#3B82F6' },
        { text: "Total (€)", style: 'tableHeader', alignment: 'right', fillColor: '#3B82F6' }
      ],
      ...datos.adeudosFiltrados.map((a, index) => [
        { text: new Date(a.ff).toLocaleDateString('es-ES'), style: 'tableCell' },
        { text: a.concepto || "—", style: 'tableCell' },
        { text: a.proveedor || "—", style: 'tableCell' },
        { text: a.num_factura || "—", style: 'tableCell' },
        { text: Number(a.importe || 0).toLocaleString('es-ES', {minimumFractionDigits: 2}), style: 'tableCell', alignment: 'right' },
        { text: Number(a.iva || 0).toLocaleString('es-ES', {minimumFractionDigits: 2}), style: 'tableCell', alignment: 'right' },
        { text: Number(a.retencion || 0).toLocaleString('es-ES', {minimumFractionDigits: 2}), style: 'tableCell', alignment: 'right' },
        { text: Number(a.total || 0).toLocaleString('es-ES', {minimumFractionDigits: 2}), style: 'tableCell', alignment: 'right', bold: true }
      ])
    ];

    // Fila de totales
    tabla.push([
      { text: "SUBTOTALES", colSpan: 4, alignment: "right", style: 'tableTotals', fillColor: '#F3F4F6' },
      {}, {}, {},
      { text: datos.totalImporte.toLocaleString('es-ES', {minimumFractionDigits: 2}), style: 'tableTotals', alignment: 'right', fillColor: '#F3F4F6' },
      { text: datos.totalIVA.toLocaleString('es-ES', {minimumFractionDigits: 2}), style: 'tableTotals', alignment: 'right', fillColor: '#F3F4F6' },
      { text: datos.totalRetencion.toLocaleString('es-ES', {minimumFractionDigits: 2}), style: 'tableTotals', alignment: 'right', fillColor: '#F3F4F6' },
      { text: datos.totalFacturas.toLocaleString('es-ES', {minimumFractionDigits: 2}), style: 'tableTotals', alignment: 'right', fillColor: '#F3F4F6' }
    ]);

    const docDefinition = {
      pageSize: 'A4',
      pageOrientation: 'landscape', // Cambiar a horizontal para más espacio
      pageMargins: [30, 50, 30, 60], // Reducir márgenes
      
      header: {
        columns: [
          {
            width: '*',
            text: 'FINATECH - Servicios Financieros',
            style: 'companyHeader',
            alignment: 'center',
            margin: [0, 15, 0, 0]
          }
        ]
      },
      
      footer: (currentPage, pageCount) => ({
        columns: [
          {
            width: '*',
            text: `Página ${currentPage} de ${pageCount}`,
            alignment: 'center',
            style: 'footer'
          }
        ],
        margin: [0, 10, 0, 0]
      }),

      content: [
        { text: "BORRADOR DE LIQUIDACIÓN DE ADEUDOS", style: "title", margin: [0, 0, 0, 10] },
        
        // Información de la empresa
        {
          columns: [
            {
              width: '50%',
              stack: [
                { text: `Empresa: ${datos.empresaNombre}`, style: 'infoText' },
                { text: `CIF: ${empresaCif}`, style: 'infoText' },
                { text: `Fecha de generación: ${new Date().toLocaleDateString('es-ES')}`, style: 'infoText' }
              ]
            },
            {
              width: '50%',
              stack: [
                { text: `Total registros: ${datos.adeudosFiltrados.length}`, style: 'infoText', alignment: 'right' },
                datos.fechaDesde && datos.fechaHasta ? {
                  text: `Período: ${formatearFecha(datos.fechaDesde)} al ${formatearFecha(datos.fechaHasta)}`,
                  style: 'infoText',
                  alignment: 'right'
                } : {}
              ]
            }
          ],
          margin: [0, 0, 0, 15]
        },

        // Tabla principal con anchos relativos
        {
          table: {
            headerRows: 1,
            // Usar anchos relativos que se ajusten al 100% del ancho disponible
            widths: ['10%', '25%', '15%', '12%', '12%', '9%', '9%', '8%'],
            body: tabla
          },
          layout: {
            fillColor: (rowIndex) => rowIndex === 0 ? '#3B82F6' : (rowIndex % 2 === 0 ? '#F8FAFC' : null),
            hLineWidth: () => 0.5,
            vLineWidth: () => 0.5,
            hLineColor: () => '#E2E8F0',
            vLineColor: () => '#E2E8F0'
          },
          margin: [0, 0, 0, 15]
        },

        // Resumen
        {
          table: {
            widths: ['*', '15%'],
            body: [
              [
                { text: 'TOTAL FACTURAS PAGADAS:', style: 'summaryLabel', border: [false, false, false, false] },
                { text: `${datos.totalFacturas.toLocaleString('es-ES', {minimumFractionDigits: 2})} €`, style: 'summaryValue', border: [false, false, false, false] }
              ],
              [
                { text: 'ANTICIPO RECIBIDO:', style: 'summaryLabel', border: [false, false, false, false] },
                { text: `${datos.anticipo.toLocaleString('es-ES', {minimumFractionDigits: 2})} €`, style: 'summaryValue', border: [false, false, false, false] }
              ],
              [
                { text: 'ADEUDO PENDIENTE:', style: 'summaryTotal', border: [false, true, false, false], borderColor: '#374151' },
                { text: `${(datos.totalFacturas - datos.anticipo).toLocaleString('es-ES', {minimumFractionDigits: 2})} €`, style: 'summaryTotal', border: [false, true, false, false], borderColor: '#374151' }
              ]
            ]
          },
          margin: [0, 10, 0, 0]
        }
      ],

      styles: {
        companyHeader: {
          fontSize: 14,
          bold: true,
          color: '#1F2937'
        },
        title: {
          fontSize: 16,
          bold: true,
          alignment: 'center',
          color: '#1E40AF'
        },
        infoText: {
          fontSize: 9,
          color: '#4B5563',
          margin: [0, 1]
        },
        tableHeader: {
          fontSize: 8,
          bold: true,
          color: 'white',
          margin: [2, 3]
        },
        tableCell: {
          fontSize: 7,
          color: '#374151',
          margin: [2, 2]
        },
        tableTotals: {
          fontSize: 8,
          bold: true,
          color: '#1F2937',
          margin: [2, 3]
        },
        summaryLabel: {
          fontSize: 10,
          bold: true,
          color: '#374151',
          alignment: 'right',
          margin: [0, 2]
        },
        summaryValue: {
          fontSize: 10,
          bold: true,
          color: '#1F2937',
          alignment: 'right',
          margin: [5, 2]
        },
        summaryTotal: {
          fontSize: 11,
          bold: true,
          color: '#DC2626',
          alignment: 'right',
          margin: [0, 4]
        },
        footer: {
          fontSize: 8,
          color: '#6B7280'
        }
      }
    };

    pdfMake.createPdf(docDefinition).download(`borrador_liquidacion_${datos.empresaNombre}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const generarPdfLiquidacionFinal = (empresaCif, adeudos, honorariosSinIVA, numeroLiquidacion) => {
    const datos = obtenerDatosCalculados(empresaCif, adeudos, honorariosSinIVA);

    const tabla = [
      [
        { text: "Fecha", style: 'tableHeader', fillColor: '#059669' },
        { text: "Concepto", style: 'tableHeader', fillColor: '#059669' },
        { text: "Proveedor", style: 'tableHeader', fillColor: '#059669' },
        { text: "N° Factura", style: 'tableHeader', fillColor: '#059669' },
        { text: "Importe (€)", style: 'tableHeader', alignment: 'right', fillColor: '#059669' },
        { text: "IVA (€)", style: 'tableHeader', alignment: 'right', fillColor: '#059669' },
        { text: "Retención (€)", style: 'tableHeader', alignment: 'right', fillColor: '#059669' },
        { text: "Total (€)", style: 'tableHeader', alignment: 'right', fillColor: '#059669' }
      ],
      ...datos.adeudosFiltrados.map((a, index) => [
        { text: new Date(a.ff).toLocaleDateString('es-ES'), style: 'tableCell' },
        { text: a.concepto || "—", style: 'tableCell' },
        { text: a.proveedor || "—", style: 'tableCell' },
        { text: a.num_factura || "—", style: 'tableCell' },
        { text: Number(a.importe || 0).toLocaleString('es-ES', {minimumFractionDigits: 2}), style: 'tableCell', alignment: 'right' },
        { text: Number(a.iva || 0).toLocaleString('es-ES', {minimumFractionDigits: 2}), style: 'tableCell', alignment: 'right' },
        { text: Number(a.retencion || 0).toLocaleString('es-ES', {minimumFractionDigits: 2}), style: 'tableCell', alignment: 'right' },
        { text: Number(a.total || 0).toLocaleString('es-ES', {minimumFractionDigits: 2}), style: 'tableCell', alignment: 'right', bold: true }
      ])
    ];

    // Fila de totales
    tabla.push([
      { text: "SUBTOTALES", colSpan: 4, alignment: "right", style: 'tableTotals', fillColor: '#F3F4F6' },
      {}, {}, {},
      { text: datos.totalImporte.toLocaleString('es-ES', {minimumFractionDigits: 2}), style: 'tableTotals', alignment: 'right', fillColor: '#F3F4F6' },
      { text: datos.totalIVA.toLocaleString('es-ES', {minimumFractionDigits: 2}), style: 'tableTotals', alignment: 'right', fillColor: '#F3F4F6' },
      { text: datos.totalRetencion.toLocaleString('es-ES', {minimumFractionDigits: 2}), style: 'tableTotals', alignment: 'right', fillColor: '#F3F4F6' },
      { text: datos.totalFacturas.toLocaleString('es-ES', {minimumFractionDigits: 2}), style: 'tableTotals', alignment: 'right', fillColor: '#F3F4F6' }
    ]);

    const docDefinition = {
      pageSize: 'A4',
      pageOrientation: 'landscape', // Cambiar a horizontal para más espacio
      pageMargins: [30, 50, 30, 80], // Reducir márgenes
      
      header: {
        columns: [
          {
            width: '*',
            text: 'FINATECH - Servicios Financieros',
            style: 'companyHeader',
            alignment: 'center',
            margin: [0, 15, 0, 0]
          }
        ]
      },
      
      footer: (currentPage, pageCount) => ({
        columns: [
          {
            width: '*',
            text: `Página ${currentPage} de ${pageCount}`,
            alignment: 'center',
            style: 'footer'
          }
        ],
        margin: [0, 10, 0, 0]
      }),

      content: [
        { 
        text: `LIQUIDACIÓN FINAL DE ADEUDOS N° ${numeroLiquidacion}`, 
        style: "title", 
        margin: [0, 0, 0, 10] 
      },
        
        // Información de la empresa
        {
          columns: [
            {
              width: '50%',
              stack: [
                { text: `Empresa: ${datos.empresaNombre}`, style: 'infoText' },
                { text: `CIF: ${empresaCif}`, style: 'infoText' },
                { text: `Fecha de generación: ${new Date().toLocaleDateString('es-ES')}`, style: 'infoText' }
              ]
            },
            {
              width: '50%',
            stack: [
              { text: `Liquidación N°: ${numeroLiquidacion}`, style: 'infoTextBold', alignment: 'right' },
              { text: `Total registros: ${datos.adeudosFiltrados.length}`, style: 'infoText', alignment: 'right' },
              datos.fechaDesde && datos.fechaHasta ? {
                text: `Período: ${formatearFecha(datos.fechaDesde)} al ${formatearFecha(datos.fechaHasta)}`,
                style: 'infoText',
                alignment: 'right'
              } : {}
            ]
          }
        ],
        margin: [0, 0, 0, 15]
        },

        // Tabla principal con anchos relativos
        {
          table: {
            headerRows: 1,
            // Usar anchos relativos que se ajusten al 100% del ancho disponible
            widths: ['10%', '25%', '15%', '12%', '12%', '9%', '9%', '8%'],
            body: tabla
          },
          layout: {
            fillColor: (rowIndex) => rowIndex === 0 ? '#059669' : (rowIndex % 2 === 0 ? '#F0FDF4' : null),
            hLineWidth: () => 0.5,
            vLineWidth: () => 0.5,
            hLineColor: () => '#D1FAE5',
            vLineColor: () => '#D1FAE5'
          },
          margin: [0, 0, 0, 15]
        },

        // Sección de honorarios
        {
          text: "HONORARIOS FINATECH",
          style: "subtitle",
          margin: [0, 10, 0, 8]
        },
        
        {
          table: {
            widths: ['*', '15%'],
            body: [
              [
                { text: 'Base imponible:', style: 'honorariosLabel', border: [false, false, false, false] },
                { text: `${datos.honorariosSinIVA.toLocaleString('es-ES', {minimumFractionDigits: 2})} €`, style: 'honorariosValue', border: [false, false, false, false] }
              ],
              [
                { text: 'IVA (21%):', style: 'honorariosLabel', border: [false, false, false, false] },
                { text: `${(datos.honorariosSinIVA * 0.21).toLocaleString('es-ES', {minimumFractionDigits: 2})} €`, style: 'honorariosValue', border: [false, false, false, false] }
              ],
              [
                { text: 'Total honorarios:', style: 'honorariosTotal', border: [false, true, false, false], borderColor: '#059669' },
                { text: `${datos.honorariosConIVA.toLocaleString('es-ES', {minimumFractionDigits: 2})} €`, style: 'honorariosTotal', border: [false, true, false, false], borderColor: '#059669' }
              ]
            ]
          },
          margin: [0, 0, 0, 15]
        },

        // Liquidación final
        {
          text: "LIQUIDACIÓN FINAL",
          style: "subtitle",
          color: '#DC2626',
          margin: [0, 10, 0, 8]
        },

        {
          table: {
            widths: ['*', '15%'],
            body: [
              [
                { text: 'TOTAL FACTURAS PAGADAS:', style: 'summaryLabel', border: [false, false, false, false] },
                { text: `${datos.totalFacturas.toLocaleString('es-ES', {minimumFractionDigits: 2})} €`, style: 'summaryValue', border: [false, false, false, false] }
              ],
              [
                { text: 'HONORARIOS FINATECH:', style: 'summaryLabel', border: [false, false, false, false] },
                { text: `+ ${datos.honorariosConIVA.toLocaleString('es-ES', {minimumFractionDigits: 2})} €`, style: 'summaryValue', color: '#059669', border: [false, false, false, false] }
              ],
              [
                { text: 'ANTICIPO RECIBIDO:', style: 'summaryLabel', border: [false, false, false, false] },
                { text: `- ${datos.anticipo.toLocaleString('es-ES', {minimumFractionDigits: 2})} €`, style: 'summaryValue', color: '#2563EB', border: [false, false, false, false] }
              ],
              [
                { text: 'ADEUDO PENDIENTE:', style: 'summaryFinal', border: [false, true, false, false], borderColor: '#DC2626', fillColor: '#FEF2F2' },
                { text: `${datos.adeudoPendiente.toLocaleString('es-ES', {minimumFractionDigits: 2})} €`, style: 'summaryFinal', color: datos.adeudoPendiente >= 0 ? '#DC2626' : '#059669', border: [false, true, false, false], borderColor: '#DC2626', fillColor: '#FEF2F2' }
              ]
            ]
          }
        },

        // Nota final
        {
          text: datos.adeudoPendiente >= 0 ? 
            "El importe indicado como 'Adeudo Pendiente' deberá ser abonado por el cliente." :
            "El importe indicado representa un saldo a favor del cliente.",
          style: 'note',
          margin: [0, 10, 0, 0]
        }
      ],

      styles: {
        
        infoTextBold: {
        fontSize: 10,
        bold: true,
        color: '#DC2626', // Color rojo para destacar el número
        margin: [0, 1]
      },
      
        companyHeader: {
          fontSize: 14,
          bold: true,
          color: '#1F2937'
        },
        title: {
          fontSize: 16,
          bold: true,
          alignment: 'center',
          color: '#059669'
        },
        subtitle: {
          fontSize: 12,
          bold: true,
          color: '#374151'
        },
        infoText: {
          fontSize: 9,
          color: '#4B5563',
          margin: [0, 1]
        },
        tableHeader: {
          fontSize: 8,
          bold: true,
          color: 'white',
          margin: [2, 3]
        },
        tableCell: {
          fontSize: 7,
          color: '#374151',
          margin: [2, 2]
        },
        tableTotals: {
          fontSize: 8,
          bold: true,
          color: '#1F2937',
          margin: [2, 3]
        },
        honorariosLabel: {
          fontSize: 9,
          color: '#374151',
          alignment: 'right',
          margin: [0, 2]
        },
        honorariosValue: {
          fontSize: 9,
          bold: true,
          color: '#059669',
          alignment: 'right',
          margin: [5, 2]
        },
        honorariosTotal: {
          fontSize: 10,
          bold: true,
          color: '#059669',
          alignment: 'right',
          margin: [0, 3]
        },
        summaryLabel: {
          fontSize: 10,
          bold: true,
          color: '#374151',
          alignment: 'right',
          margin: [0, 2]
        },
        summaryValue: {
          fontSize: 10,
          bold: true,
          color: '#1F2937',
          alignment: 'right',
          margin: [5, 2]
        },
        summaryFinal: {
          fontSize: 12,
          bold: true,
          alignment: 'right',
          margin: [0, 5]
        },
        note: {
          fontSize: 8,
          italics: true,
          color: '#6B7280',
          alignment: 'center'
        },
        footer: {
          fontSize: 8,
          color: '#6B7280'
        }
      }
    };

    pdfMake.createPdf(docDefinition).download(`liquidacion_final_${numeroLiquidacion}_${datos.empresaNombre}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const renderInput = (label, name, readOnly = false, required = true, type = "text", maxLength = null) => (
    <div className="flex flex-col">
      <label htmlFor={name}>{label}</label>
      <input
        id={name}
        name={name}
        type={type}
        value={empresa[name] !== undefined && empresa[name] !== null ? empresa[name] : ""}
        onChange={handleChange}
        readOnly={readOnly}
        maxLength={maxLength || undefined}
        required={required}
        className={`w-full border rounded-md ${readOnly ? "bg-gray-100" : ""}
          ${getError(name) ? "border-red-500" : "border-gray-300"}`}
      />
    </div>
  );

  const honorarios = adeudosList
    .filter((a) => a.empresa_cif === empresa.empresa_cif)
    .reduce((acc, a) => acc + parseFloat(a.honorarios || 0), 0);

  // VISTA DE BORRADOR
  if (vistaActual === 'borrador') {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-bold mb-4 text-center">Generar Borrador de Liquidación</h2>
      
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
        <p className="text-sm text-blue-700">
          <strong>Nota:</strong> El borrador incluirá solo los adeudos pendientes de liquidar.
        </p>
      </div>
      
      {/* Select Empresa para Borrador */}
      <div className="grid grid-cols-1 m-3">
        <div className="flex flex-col">
          <label htmlFor="empresa_borrador">Seleccionar Empresa:</label>
          <select
            id="empresa_borrador"
            value={empresaSeleccionadaBorrador}
            onChange={(e) => setEmpresaSeleccionadaBorrador(e.target.value)}
            className="w-full border rounded-md border-gray-300"
          >
            <option value="">Selecciona una empresa</option>
            {empresasDisponibles.map((e) => (
              <option key={e.cif} value={e.cif}>
                {e.cif} - {e.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Mostrar información de adeudos pendientes */}
      {empresaSeleccionadaBorrador && (
        <div className="m-3 p-3 bg-gray-50 rounded border">
          <p className="text-sm">
            Adeudos pendientes: <strong>
              {adeudosList.filter(a => 
                a.empresa_cif === empresaSeleccionadaBorrador && 
                (!a.num_liquidacion || a.estado === 'PENDIENTE')
              ).length}
            </strong>
          </p>
        </div>
      )}

      {/* Botones */}
      <div className="grid grid-cols-2 m-3 gap-4">
        <button
          type="button"
          onClick={handleGenerarPdfBorrador}
          disabled={!puedeGenerarLiquidacion(empresaSeleccionadaBorrador)}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          title={!puedeGenerarLiquidacion(empresaSeleccionadaBorrador) ? "No hay adeudos pendientes" : ""}
        >
          Vista Previa PDF Borrador
        </button>
        <button
          type="button"
          onClick={volverFormularioPrincipal}
          className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-md"
        >
          Volver a Generar Adeudo
        </button>
      </div>

      {renderVistaPreviaPdf()}
    </div>
  );
}

  // VISTA DE LIQUIDACIÓN
  if (vistaActual === 'liquidacion') {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-bold mb-4 text-center">Generar Liquidación Final</h2>
      
      <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-4">
        <p className="text-sm text-amber-700">
          <strong>Importante:</strong> Esta acción liquidará TODOS los adeudos pendientes de la empresa seleccionada.
          Una vez liquidados, no podrán modificarse.
        </p>
      </div>
      
      {/* Select Empresa para Liquidación */}
      <div className="grid grid-cols-1 m-3">
        <div className="flex flex-col">
          <label htmlFor="empresa_liquidacion">Seleccionar Empresa:</label>
          <select
            id="empresa_liquidacion"
            value={empresaSeleccionadaLiquidacion}
            onChange={(e) => setEmpresaSeleccionadaLiquidacion(e.target.value)}
            className="w-full border rounded-md border-gray-300"
          >
            <option value="">Selecciona una empresa</option>
            {empresasDisponibles.map((e) => (
              <option key={e.cif} value={e.cif}>
                {e.cif} - {e.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Mostrar información de adeudos pendientes */}
      {empresaSeleccionadaLiquidacion && (
        <div className="m-3 p-3 bg-gray-50 rounded border">
          <p className="text-sm">
            Adeudos que se liquidarán: <strong className="text-red-600">
              {adeudosList.filter(a => 
                a.empresa_cif === empresaSeleccionadaLiquidacion && 
                (!a.num_liquidacion || a.estado === 'PENDIENTE')
              ).length}
            </strong>
          </p>
          <p className="text-xs text-gray-600 mt-1">
            Estos adeudos cambiarán de estado "Pendiente" a "Liquidado"
          </p>
        </div>
      )}

      {/* Formulario de Honorarios */}
      <div className="m-3 border p-4 rounded shadow bg-gray-50">
        <h3 className="font-semibold text-gray-700 mb-2">Honorarios de Finatech</h3>
        <label className="block text-sm text-gray-600 mb-1">Honorarios sin IVA:</label>
        <input
          type="number"
          min="0"
          step="0.01"
          value={honorariosSinIVA || ""}
          onChange={(e) => {
            const val = parseFloat(e.target.value);
            setHonorariosSinIVA(isNaN(val) ? 0 : val);
          }}
          className="w-full px-3 py-2 border rounded mb-2"
        />
        <p className="text-sm text-gray-700">
          Total con IVA (21%): <strong>{(honorariosSinIVA * 1.21 || 0).toFixed(2)} €</strong>
        </p>
      </div>

      {/* Botones */}
      <div className="grid grid-cols-2 m-3 gap-4">
        <button
          type="button"
          onClick={handleVerPreviaLiquidacion}
          disabled={!puedeGenerarLiquidacion(empresaSeleccionadaLiquidacion) || !honorariosSinIVA}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          title={!puedeGenerarLiquidacion(empresaSeleccionadaLiquidacion) ? "No hay adeudos pendientes" : !honorariosSinIVA ? "Ingresa los honorarios" : ""}
        >
          Vista Previa PDF Liquidación
        </button>
        <button
          type="button"
          onClick={volverFormularioPrincipal}
          className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-md"
        >
          Volver a Generar Adeudo
        </button>
      </div>

      {renderVistaPreviaPdf()}
    </div>
  );
}

  // VISTA PRINCIPAL (formulario original)
  return (
    <div className="mb-6">
      {/* Select Empresa */}
      <div className="grid grid-cols-1 m-3">
        <div className="flex flex-col">
          <label htmlFor="empresa_cif">Empresa a la que se refiere el adeudo:</label>
          <select
            id="empresa_cif"
            name="empresa_cif"
            value={empresa.empresa_cif || ""}
            onChange={handleChange}
            className={`w-full border rounded-md ${getError('empresa_cif') ? 'border-red-500' : 'border-gray-300'}`}
          >
            <option value="">Selecciona una empresa</option>
            {empresasDisponibles.map((e) => (
              <option key={e.cif} value={e.cif}>
                {e.cif}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Formulario */}
      <div className="grid grid-cols-3 m-3 gap-4">
        {renderInput("Concepto:", "concepto", false, true, "text", 200)}
        {renderInput("Proveedor:", "proveedor", false, true, "text", 50)}
        {renderInput("Fecha Factura:", "fechafactura", false, true, "date")}
      </div>

      <div className="grid grid-cols-2 m-3 gap-4">
        {renderInput("Num Factura:", "numfactura", false, true, "text", 50)}
        {renderInput("Protocolo / Entrada:", "protocoloentrada", false, false, "text", 50)}
      </div>

      <div className="grid grid-cols-5 m-3 gap-4">
        {renderInput("Importe:", "importe", importeBloqueado, true, "number")}
        {renderInput("IVA:", "iva", true, false, "number")}
        {renderInput("Retención:", "retencion", true, false, "number")}
        {renderInput("Conceptos sin IVA:", "csiniva", false, false, "number")}
        {renderInput("Total:", "total", true, false, "number")}
      </div>

      {/* Botones */}
      <div className="grid grid-cols-3 m-3 gap-4">
      <button
        type="button"
        onClick={handleGuardarAdeudo}
        className={`bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md ${
          botonGuardarDeshabilitado ? "opacity-50 cursor-not-allowed" : ""
        }`}
        disabled={botonGuardarDeshabilitado}
      >
        Guardar Adeudo
      </button>
      <button
        disabled={!puedeGenerarLiquidacion(empresa.empresa_cif)}
        type="button"
        formNoValidate
        onClick={handleGenerarBorrador}
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
        title={!puedeGenerarLiquidacion(empresa.empresa_cif) ? "No hay adeudos pendientes" : ""}
      >
        Generar borrador de liquidación
      </button>
      <button
        disabled={!puedeGenerarLiquidacion(empresa.empresa_cif)}
        type="button"
        formNoValidate
        onClick={handleGenerarLiquidacionClick}
        className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
        title={!puedeGenerarLiquidacion(empresa.empresa_cif) ? "No hay adeudos pendientes" : ""}
      >
        Generar liquidación final
      </button>
    </div>

      {/* Vista previa (solo se muestra en la vista principal) */}
      {mostrarVistaPrevia && (
        <div className="m-3 mt-6 border-t-4 border-gray-400 pt-4">
          <h3 className="text-lg font-bold text-center mb-4">Vista previa de los adeudos</h3>
          {renderResumenEstados()}
          {/* NUEVO BLOQUE: Encabezado como en el Excel */}
          <div className="mb-4">
            <p className="text-sm font-semibold">
              Adeudos a Finatech de parte de {empresa.empresa_cif 
                ? (empresasDisponibles.find(e => e.cif === empresa.empresa_cif)?.nombre || empresa.empresa_cif) 
                : "No seleccionada"}
            </p>
            {(() => {
            const fechas = adeudosList
              .filter(a => a.empresa_cif === empresa.empresa_cif)
              .map(a => new Date(a.ff))
              .filter(f => !isNaN(f.getTime()))
              .sort((a, b) => a - b); // Ordenar por fecha ascendente

            if (fechas.length === 0) return null;

            const formatFecha = (fecha) => {
              const meses = [
                "enero", "febrero", "marzo", "abril", "mayo", "junio",
                "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
              ];
              return `${fecha.getDate()} de ${meses[fecha.getMonth()]} ${fecha.getFullYear()}`;
            };

            const desde = formatFecha(fechas[0]);
            const hasta = formatFecha(fechas[fechas.length - 1]);

            return (
              <p className="text-sm font-semibold">
                Adeudos a Finatech desde {desde} al {hasta}
              </p>
            );
          })()}
          </div>
          
          {/* Tu tabla intacta */}
          <table className="w-full text-sm border">
            <thead className="bg-gray-100">
              <tr>
              <th className="border p-2">Estado</th>
              <th className="border p-2">Concepto</th>
              <th className="border p-2">Proveedor</th>
              <th className="border p-2">Fecha factura</th>
              <th className="border p-2">Num factura</th>
              <th className="border p-2">Protocolo / Entrada</th>
              <th className="border p-2">Importe</th>
              <th className="border p-2">IVA</th>
              <th className="border p-2">Retención</th>
              <th className="border p-2">Conceptos sin IVA</th>
              <th className="border p-2">Total</th>
            </tr>
          </thead>
            <tbody>
              {adeudosList.map((a, i) => (
              <tr key={i} className={`text-center border ${a.num_liquidacion ? 'bg-green-50' : 'bg-white'}`}>
                <td className="border p-2">{renderEstadoLiquidacion(a)}</td>
                <td className="border p-2">{a.concepto}</td>
                <td className="border p-2">{a.proveedor}</td>
                <td className="border p-2">{new Date(a.ff).toLocaleDateString()}</td>
                <td className="border p-2">{a.num_factura}</td>
                <td className="border p-2">{a.protocolo_entrada}</td>
                <td className="border p-2">{parseFloat(a.importe || 0).toFixed(2)}</td>
                <td className="border p-2">{parseFloat(a.iva || 0).toFixed(2)}</td>
                <td className="border p-2">{parseFloat(a.retencion || 0).toFixed(2)}</td>
                <td className="border p-2">{parseFloat(a.cs_iva || 0).toFixed(2)}</td>
                <td className="border p-2">{parseFloat(a.total || 0).toFixed(2)}</td>
              </tr>
            ))}
            {/* Fila de totales solo para adeudos PENDIENTES */}
        <tr className="font-bold bg-yellow-50 border-2">
          <td colSpan={10} className="text-right pr-2 border">Total facturas PENDIENTES:</td>
          <td className="border">
            {adeudosList
              .filter((a) => a.empresa_cif === empresa.empresa_cif && (!a.num_liquidacion || a.estado === 'PENDIENTE'))
              .reduce((acc, a) => acc + parseFloat(a.total || 0), 0).toFixed(2)}
          </td>
        </tr>

        {/* Fila de totales para adeudos LIQUIDADOS */}
        {estadoAdeudos.liquidados > 0 && (
          <tr className="font-bold bg-green-50 border-2">
            <td colSpan={10} className="text-right pr-2 border">Total facturas LIQUIDADAS:</td>
            <td className="border">
              {adeudosList
                .filter((a) => a.empresa_cif === empresa.empresa_cif && (a.num_liquidacion || a.estado === 'LIQUIDADO'))
                .reduce((acc, a) => acc + parseFloat(a.total || 0), 0).toFixed(2)}
            </td>
          </tr>
        )}

        <tr className="bg-gray-50">
          <td colSpan={10} className="text-right pr-2 font-bold border">Anticipo por el cliente:</td>
          <td className="border">
            {adeudosList.length > 0
              ? parseFloat(adeudosList[0].anticipo || 0).toFixed(2)
              : "0.00"}
          </td>
        </tr>

        <tr className="bg-gray-50">
          <td colSpan={10} className="text-right pr-2 font-bold border">Honorarios FINATECH (IVA incluido):</td>
          <td className="border">{honorarios.toFixed(2)}</td>
        </tr> 

        {/* Adeudo pendiente solo para facturas PENDIENTES */}
        <tr className="bg-yellow-100 font-bold border-2">
          <td colSpan={10} className="text-right pr-2 border">Adeudo pendiente (solo facturas pendientes):</td>
          <td className="border">
            {(() => {
              const totalFacturasPendientes = adeudosList
                .filter((a) => a.empresa_cif === empresa.empresa_cif && (!a.num_liquidacion || a.estado === 'PENDIENTE'))
                .reduce((acc, a) => acc + parseFloat(a.total || 0), 0);

              const anticipo = parseFloat(adeudosList[0]?.anticipo || 0);
              const pendiente = totalFacturasPendientes - anticipo;
              
              return pendiente.toFixed(2);
            })()}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
      )}

    </div>
  );

};

export default AdeudosForm;