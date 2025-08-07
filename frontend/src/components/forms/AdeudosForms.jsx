import { useState } from "react";
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

import * as pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from "pdfmake/build/vfs_fonts";
pdfMake.vfs = pdfFonts.vfs;

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

  const adeudosEmpresa = adeudosGuardados.filter(
    a => a.empresa_cif === empresa.empresa_cif
  );

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

  const handleGenerarLiquidacionFinal = () => {
    if (!empresaSeleccionadaLiquidacion) {
      alert("Selecciona una empresa válida.");
      return;
    }

    const adeudosEmpresa = adeudosGuardados.filter(
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

    generarPdfLiquidacionFinal(empresaSeleccionadaLiquidacion, adeudosEmpresa, honorariosSinIVA);
  };

  const handleGenerarPdfBorrador = () => {
    if (!empresaSeleccionadaBorrador) {
      alert("Selecciona una empresa válida.");
      return;
    }

    const adeudosEmpresa = adeudosGuardados.filter(
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

    const adeudosEmpresa = adeudosGuardados.filter(
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

  const confirmarDescargaPdf = () => {
    if (tipoPdfPrevia === 'borrador') {
      const adeudosEmpresa = adeudosGuardados.filter(
        a => a.empresa_cif === empresaSeleccionadaBorrador
      );
      generarPdfBorrador(empresaSeleccionadaBorrador, adeudosEmpresa);
    } else if (tipoPdfPrevia === 'liquidacion') {
      const adeudosEmpresa = adeudosGuardados.filter(
        a => a.empresa_cif === empresaSeleccionadaLiquidacion
      );
      generarPdfLiquidacionFinal(empresaSeleccionadaLiquidacion, adeudosEmpresa, honorariosSinIVA);
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

  const renderVistaPreviaPdf = () => {
    if (!mostrarVistaPreviaPdf) return null;

    const empresaCif = tipoPdfPrevia === 'borrador' ? empresaSeleccionadaBorrador : empresaSeleccionadaLiquidacion;
    const adeudosEmpresa = adeudosGuardados.filter(a => a.empresa_cif === empresaCif);
    const empresaNombre = empresasDisponibles.find(e => e.cif === empresaCif)?.nombre || empresaCif;

    const totalImporte = adeudosEmpresa.reduce((acc, a) => acc + Number(a.importe || 0), 0);
    const totalIVA = adeudosEmpresa.reduce((acc, a) => acc + Number(a.iva || 0), 0);
    const totalTotal = adeudosEmpresa.reduce((acc, a) => acc + Number(a.total || 0), 0);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg max-w-4xl max-h-[90vh] overflow-y-auto w-full mx-4">
          <div className="mb-4 flex justify-between items-center">
            <h3 className="text-lg font-bold">Vista Previa del PDF</h3>
            <button
              onClick={() => setMostrarVistaPreviaPdf(false)}
              className="text-gray-500 hover:text-gray-700 text-xl"
            >
              ×
            </button>
          </div>

          {/* Vista previa del documento */}
          <div className="border-2 border-gray-300 p-6 bg-white shadow-lg">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold">
                {tipoPdfPrevia === 'borrador' ? 'Borrador de liquidación de adeudos' : 'Liquidación final de adeudos'}
              </h1>
              <p className="text-sm text-gray-600 mt-2">
                Fecha de generación: {new Date().toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-600">
                Empresa: {empresaNombre}
              </p>
            </div>

            {/* Tabla de adeudos */}
            <table className="w-full border-collapse border border-gray-400 mb-6">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-400 p-2 text-left">Fecha</th>
                  <th className="border border-gray-400 p-2 text-left">Concepto</th>
                  <th className="border border-gray-400 p-2 text-left">Proveedor</th>
                  <th className="border border-gray-400 p-2 text-left">Factura</th>
                  <th className="border border-gray-400 p-2 text-right">Importe</th>
                  <th className="border border-gray-400 p-2 text-right">IVA</th>
                  <th className="border border-gray-400 p-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {adeudosEmpresa.map((a, i) => (
                  <tr key={i}>
                    <td className="border border-gray-400 p-2">{new Date(a.ff).toLocaleDateString()}</td>
                    <td className="border border-gray-400 p-2">{a.concepto || "—"}</td>
                    <td className="border border-gray-400 p-2">{a.proveedor || "—"}</td>
                    <td className="border border-gray-400 p-2">{a.num_factura || "—"}</td>
                    <td className="border border-gray-400 p-2 text-right">{Number(a.importe || 0).toFixed(2)}</td>
                    <td className="border border-gray-400 p-2 text-right">{Number(a.iva || 0).toFixed(2)}</td>
                    <td className="border border-gray-400 p-2 text-right">{Number(a.total || 0).toFixed(2)}</td>
                  </tr>
                ))}
                <tr className="bg-gray-100 font-bold">
                  <td className="border border-gray-400 p-2 text-right" colSpan={4}>TOTALES</td>
                  <td className="border border-gray-400 p-2 text-right">{totalImporte.toFixed(2)}</td>
                  <td className="border border-gray-400 p-2 text-right">{totalIVA.toFixed(2)}</td>
                  <td className="border border-gray-400 p-2 text-right">{totalTotal.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>

            {/* Sección de honorarios solo para liquidación final */}
            {tipoPdfPrevia === 'liquidacion' && (
              <div className="mt-6 pt-4 border-t border-gray-300">
                <h2 className="text-lg font-bold mb-4">Honorarios de Finatech</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-sm text-gray-600">Honorarios sin IVA:</p>
                    <p className="text-lg font-semibold">${Number(honorariosSinIVA || 0).toFixed(2)}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-sm text-gray-600">Honorarios con IVA (21%):</p>
                    <p className="text-lg font-semibold">${(honorariosSinIVA * 1.21 || 0).toFixed(2)}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Resumen final */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
              <h3 className="font-semibold text-blue-800 mb-2">Resumen</h3>
              <div className="text-sm">
                <p>Total de registros: <span className="font-semibold">{adeudosEmpresa.length}</span></p>
                <p>Total importe: <span className="font-semibold">${totalTotal.toFixed(2)}</span></p>
                {tipoPdfPrevia === 'liquidacion' && (
                  <p>Total con honorarios: <span className="font-semibold">${(totalTotal + (honorariosSinIVA * 1.21)).toFixed(2)}</span></p>
                )}
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end gap-3 mt-4">
            <button
              onClick={() => setMostrarVistaPreviaPdf(false)}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Cancelar
            </button>
            <button
              onClick={confirmarDescargaPdf}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
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

  const fetchAdeudos = async (empresaId) => {
    try {
      const response = await fetch(`http://localhost:3000/api/adeudos/empresa/${empresaId}`);
      if (!response.ok) throw new Error("Error al obtener adeudos");
      const data = await response.json();
      setAdeudosGuardados(data);
      setVistaPrevia(true);
    } catch (error) {
      console.error("Error al cargar adeudos:", error);
    }
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

  const generarPdfBorrador = (empresaCif, adeudos) => {
    const adeudosFiltrados = adeudos.filter(a => a.empresa_cif === empresaCif);

    const tabla = [
      [
        { text: "Fecha", bold: true },
        { text: "Concepto", bold: true },
        { text: "Proveedor", bold: true },
        { text: "Factura", bold: true },
        { text: "Importe", bold: true },
        { text: "IVA", bold: true },
        { text: "Total", bold: true }
      ],
      ...adeudosFiltrados.map(a => [
        a.fechafactura || "—",
        a.concepto || "—",
        a.proveedor || "—",
        a.factura || "—",
        Number(a.importe || 0).toFixed(2),
        Number(a.iva || 0).toFixed(2),
        Number(a.total || 0).toFixed(2)
      ])
    ];

    const totalImporte = adeudosFiltrados.reduce((acc, a) => acc + Number(a.importe || 0), 0);
    const totalIVA = adeudosFiltrados.reduce((acc, a) => acc + Number(a.iva || 0), 0);
    const totalTotal = adeudosFiltrados.reduce((acc, a) => acc + Number(a.total || 0), 0);

    tabla.push([
      { text: "TOTALES", colSpan: 4, alignment: "right", bold: true },
      {}, {}, {},
      { text: totalImporte.toFixed(2), bold: true },
      { text: totalIVA.toFixed(2), bold: true },
      { text: totalTotal.toFixed(2), bold: true }
    ]);

    const docDefinition = {
      content: [
        { text: "Borrador de liquidación de adeudos", style: "header" },
        { text: `Fecha de generación: ${new Date().toLocaleDateString()}`, margin: [0, 0, 0, 10] },
        {
          table: {
            headerRows: 1,
            widths: ['auto', '*', '*', '*', 'auto', 'auto', 'auto'],
            body: tabla
          }
        }
      ],
      styles: {
        header: {
          fontSize: 16,
          bold: true,
          alignment: 'center',
          margin: [0, 0, 0, 10]
        }
      }
    };

    pdfMake.createPdf(docDefinition).download("borrador_liquidacion.pdf");
  };

  const generarPdfLiquidacionFinal = (empresaCif, adeudos, honorariosSinIVA) => {
    const adeudosFiltrados = adeudos.filter(a => a.empresa_cif === empresaCif);

    const tabla = [
      [
        { text: "Fecha", bold: true },
        { text: "Concepto", bold: true },
        { text: "Proveedor", bold: true },
        { text: "Factura", bold: true },
        { text: "Importe", bold: true },
        { text: "IVA", bold: true },
        { text: "Total", bold: true }
      ],
      ...adeudosFiltrados.map(a => [
        a.fechafactura || "—",
        a.concepto || "—",
        a.proveedor || "—",
        a.factura || "—",
        Number(a.importe || 0).toFixed(2),
        Number(a.iva || 0).toFixed(2),
        Number(a.total || 0).toFixed(2)
      ])
    ];

    const totalImporte = adeudosFiltrados.reduce((acc, a) => acc + Number(a.importe || 0), 0);
    const totalIVA = adeudosFiltrados.reduce((acc, a) => acc + Number(a.iva || 0), 0);
    const totalTotal = adeudosFiltrados.reduce((acc, a) => acc + Number(a.total || 0), 0);

    tabla.push([
      { text: "TOTALES", colSpan: 4, alignment: "right", bold: true },
      {}, {}, {},
      { text: totalImporte.toFixed(2), bold: true },
      { text: totalIVA.toFixed(2), bold: true },
      { text: totalTotal.toFixed(2), bold: true }
    ]);

    const honorariosConIVA = Number(honorariosSinIVA || 0) * 1.21;

    const docDefinition = {
      content: [
        { text: "Liquidación final de adeudos", style: "header" },
        { text: `Fecha de generación: ${new Date().toLocaleDateString()}`, margin: [0, 0, 0, 10] },
        {
          table: {
            headerRows: 1,
            widths: ['auto', '*', '*', '*', 'auto', 'auto', 'auto'],
            body: tabla
          }
        },
        {
          text: "\nHonorarios de Finatech",
          style: "subheader",
          margin: [0, 20, 0, 10]
        },
        {
          columns: [
            {
              width: '*',
              text: `Honorarios sin IVA: $${Number(honorariosSinIVA || 0).toFixed(2)}`
            },
            {
              width: '*',
              text: `Honorarios con IVA (1.21): $${honorariosConIVA.toFixed(2)}`
            }
          ]
        }
      ],
      styles: {
        header: {
          fontSize: 16,
          bold: true,
          alignment: 'center',
          margin: [0, 0, 0, 10]
        },
        subheader: {
          fontSize: 14,
          bold: true
        }
      }
    };

    pdfMake.createPdf(docDefinition).download("liquidacion_final.pdf");
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

  const honorarios = adeudosGuardados
    .filter((a) => a.empresa_cif === empresa.empresa_cif)
    .reduce((acc, a) => acc + parseFloat(a.honorarios || 0), 0);

  // VISTA DE BORRADOR
  if (vistaActual === 'borrador') {
    return (
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-4 text-center">Generar Borrador de Liquidación</h2>
        
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

        {/* Botones */}
        <div className="grid grid-cols-2 m-3 gap-4">
          <button
            type="button"
            onClick={handleGenerarPdfBorrador}
            disabled={!empresaSeleccionadaBorrador || adeudosGuardados.filter(a => a.empresa_cif === empresaSeleccionadaBorrador).length === 0}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Vista Previa PDF Borrador
          </button>
          <button
            type="button"
            onClick={volverFormularioPrincipal}
            className="bg-red-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-md"
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
            Total con IVA (21%): <strong>${(honorariosSinIVA * 1.21 || 0).toFixed(2)}</strong>
          </p>
        </div>

        {/* Botones */}
        <div className="grid grid-cols-2 m-3 gap-4">
          <button
            type="button"
            onClick={handleVerPreviaLiquidacion}
            disabled={!empresaSeleccionadaLiquidacion || adeudosGuardados.filter(a => a.empresa_cif === empresaSeleccionadaLiquidacion).length === 0 || !honorariosSinIVA}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Vista Previa PDF Liquidación
          </button>
          <button
            type="button"
            onClick={volverFormularioPrincipal}
            className="bg-red-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-md"
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
          disabled={!empresa.empresa_cif || adeudosEmpresa.length === 0}
          type="button"
          formNoValidate
          onClick={handleGenerarBorrador}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Generar borrador de liquidación
        </button>
        <button
          disabled={!empresa.empresa_cif || adeudosEmpresa.length === 0}
          type="button"
          formNoValidate
          onClick={handleGenerarLiquidacionClick}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Generar liquidación
        </button>
      </div>

      {/* Vista previa (solo se muestra en la vista principal) */}
      {mostrarVistaPrevia && (
        <div className="m-3 mt-6 border-t-4 border-gray-400 pt-4">
          <h3 className="text-lg font-bold text-center mb-4">Vista previa de los adeudos</h3>

          {/* NUEVO BLOQUE: Encabezado como en el Excel */}
          <div className="mb-4">
            <p className="text-sm font-semibold">
              Adeudos a Finatech de parte de {empresa.empresa_cif 
                ? (empresasDisponibles.find(e => e.cif === empresa.empresa_cif)?.nombre || empresa.empresa_cif) 
                : "No seleccionada"}
            </p>
            {(() => {
            const fechas = adeudosGuardados
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
                <th>Concepto</th>
                <th>Proveedor</th>
                <th>Fecha factura</th>
                <th>Num factura</th>
                <th>Protocolo / Entrada</th>
                <th>Importe</th>
                <th>IVA</th>
                <th>Retención</th>
                <th>Conceptos sin IVA</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {adeudosGuardados.map((a, i) => (
              <tr key={i} className="text-center border">
                <td>{a.concepto}</td>
                <td>{a.proveedor}</td>
                <td>{new Date(a.ff).toLocaleDateString()}</td>
                <td>{a.num_factura}</td>
                <td>{a.protocolo_entrada}</td>
                <td>{parseFloat(a.importe || 0).toFixed(2)}</td>
                <td>{parseFloat(a.iva || 0).toFixed(2)}</td>
                <td>{parseFloat(a.retencion || 0).toFixed(2)}</td>
                <td>{parseFloat(a.cs_iva || 0).toFixed(2)}</td>
                <td>{parseFloat(a.total || 0).toFixed(2)}</td>
              </tr>
            ))}
              <tr className="font-bold bg-gray-50">
          <td colSpan={9} className="text-right pr-2">Total facturas pagadas:</td>
          <td>
            {adeudosGuardados
              .filter((a) => a.empresa_cif === empresa.empresa_cif)
              .reduce((acc, a) => acc + parseFloat(a.total || 0), 0).toFixed(2)}
          </td>
        </tr>

        <tr className="bg-gray-50">
          <td colSpan={9} className="text-right pr-2 font-bold">Anticipo por el cliente:</td>
          <td>
            {adeudosGuardados.length > 0
              ? parseFloat(adeudosGuardados[0].anticipo || 0).toFixed(2)
              : "0.00"}
          </td>
        </tr>

        <tr className="bg-gray-50">
          <td colSpan={9} className="text-right pr-2 font-bold">Honorarios FINATECH (IVA incluido):</td>
          <td>{honorarios.toFixed(2)}</td>
        </tr> 

        <tr className="bg-yellow-100 font-bold">
          <td colSpan={9} className="text-right pr-2">Adeudo pendiente:</td>
          <td>
            {(() => {
              const totalFacturas = adeudosGuardados
                .filter((a) => a.empresa_cif === empresa.empresa_cif)
                .reduce((acc, a) => acc + parseFloat(a.total || 0), 0);

              const honorarios = adeudosGuardados
                .filter((a) => a.empresa_cif === empresa.empresa_cif)
                .reduce((acc, a) => acc + parseFloat(a.honorarios || 0), 0);

              const anticipo = parseFloat(adeudosGuardados[0]?.anticipo || 0);

              const pendiente = anticipo - totalFacturas - honorarios;
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