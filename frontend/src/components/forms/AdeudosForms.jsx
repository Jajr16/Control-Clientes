import React, { useState } from "react";
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';


const AdeudosForm = ({
  empresa,
  setEmpresa,
  adeudosGuardados,
  setAdeudosGuardados,
  validationErrors = {},
  empresasDisponibles = []
}) => {

  const getError = (field) => validationErrors[field];

  const handleChange = (e) => {
    const { name, value } = e.target;

    const camposNumericos = [
      "importe",
      "csiniva",
      "anticipocliente",
      "honorarios"
    ];

    const parsedValue = camposNumericos.includes(name)
      ? value === "" ? "" : parseFloat(value)
      : value;

    setEmpresa((prev) => {
      const updated = { ...prev, [name]: parsedValue };

      const importe = parseFloat(updated.importe) || 0;
      const csiniva = parseFloat(updated.csiniva) || 0;
      const anticipo_cliente = parseFloat(updated.anticipocliente) || 0;
      const honorarios = parseFloat(updated.honorarios) || 0;

      const iva = +(importe * 0.21).toFixed(2);
      const retencion = +(importe * 0.15).toFixed(2);
      const total = +(importe + iva - retencion + csiniva).toFixed(2);
      const total_adeudos = total;
      const adeudo_pendiente = +(total_adeudos + honorarios - anticipo_cliente).toFixed(2);

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
    "honorarios"
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

  const handleGuardarAdeudo = () => {
    if (!validarCampos()) return;

    const cleanedEmpresa = {
        ...empresa,
        importe: parseFloat(empresa.importe) || 0,
        iva: parseFloat(empresa.iva) || 0,
        retencion: parseFloat(empresa.retencion) || 0,
        csiniva: parseFloat(empresa.csiniva) || 0,
        total: parseFloat(empresa.total) || 0,
        anticipocliente: parseFloat(empresa.anticipocliente) || 0,
        honorarios: parseFloat(empresa.honorarios) || 0,
        adeudo_pendiente: parseFloat(empresa.adeudo_pendiente) || 0,
    };

    setAdeudosGuardados((prev) => [...prev, cleanedEmpresa]);
    setVistaPrevia(true);
    alert("Adeudo guardado correctamente.");
    };

  const handleNuevoAdeudo = () => {
    setEmpresa({
      empresa_cif: "",
      concepto: "",
      proveedor: "",
      fechafactura: "",
      numfactura: "",
      protocoloentrada: "",
      importe: "",
      iva: 0,
      retencion: 0,
      csiniva: "",
      total: 0,
      anticipocliente: "",
      honorarios: "",
      total_adeudos: 0,
      adeudo_pendiente: 0
    });
    setVistaPrevia(false);

  };

    // Nuevo state
    const [mostrarVistaPrevia, setVistaPrevia] = useState(null);

    const exportarExcel = async () => {
  if (adeudosGuardados.length === 0) {
    alert("No hay adeudos guardados para exportar.");
    return;
  }
    const adeudosEmpresa = adeudosGuardados.filter(
    a => a.empresa_cif === empresa.empresa_cif
    );

    if (adeudosEmpresa.length === 0) {
    alert("No hay adeudos registrados para la empresa seleccionada.");
    return;
    }

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Adeudos");

  const empresaNombre = empresa.empresa_cif
    ? (empresasDisponibles.find(e => e.cif === empresa.empresa_cif)?.nombre || empresa.empresa_cif)
    : "No seleccionada";

  // Rango de fechas
  const fechas = adeudosGuardados.map(a => new Date(a.fechafactura)).filter(f => !isNaN(f));
  let periodoTexto = "Sin fechas registradas";
  if (fechas.length > 0) {
    const maxDate = new Date(Math.max(...fechas));
    const inicio = new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);
    const fin = new Date(maxDate.getFullYear(), maxDate.getMonth() + 1, 0);
    const meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
    periodoTexto = `${inicio.getDate()} de ${meses[inicio.getMonth()]} ${inicio.getFullYear()} al ${fin.getDate()} de ${meses[fin.getMonth()]} ${fin.getFullYear()}`;
  }

  // Encabezado personalizado
  worksheet.addRow([`Adeudos a Finatech de parte de la empresa ${empresaNombre}`]).font = { bold: true };
  worksheet.addRow([`Adeudos a Finatech desde ${periodoTexto}`]).font = { italic: true };
  worksheet.addRow([]); // Espacio

  const headers = [
    "Concepto", "Proveedor", "Fecha factura", "Num factura", "Protocolo / Entrada",
    "Importe", "IVA", "Retención", "Conceptos sin IVA", "Total"
  ];

  worksheet.addRow(headers);

  adeudosEmpresa.forEach((a) => {
    worksheet.addRow([
        a.concepto,
        a.proveedor,
        a.fechafactura,
        a.numfactura,
        a.protocoloentrada,
        a.importe,
        a.iva,
        a.retencion,
        a.csiniva,
        a.total
    ]);
    });


  // Totales
    worksheet.addRow(["", "", "", "", "", "", "", "", "Total facturas pagadas:", 
    adeudosEmpresa.reduce((acc, a) => acc + parseFloat(a.total || 0), 0)
    ]);
    worksheet.addRow(["", "", "", "", "", "", "", "", "Anticipo por el cliente:", 
    parseFloat(adeudosEmpresa[0].anticipocliente || 0)
    ]);
    worksheet.addRow(["", "", "", "", "", "", "", "", "Honorarios FINATECH (IVA incluido):", 
    parseFloat(adeudosEmpresa[0].honorarios || 0)
    ]);
    worksheet.addRow(["", "", "", "", "", "", "", "", "Adeudo pendiente:",
    (
        adeudosEmpresa.reduce((acc, a) => acc + parseFloat(a.total || 0), 0) +
        parseFloat(adeudosEmpresa[0].honorarios || 0) -
        parseFloat(adeudosEmpresa[0].anticipocliente || 0)
    )
    ]);


  // Estilo para encabezado
  worksheet.getRow(4).font = { bold: true };
  worksheet.getRow(4).alignment = { horizontal: 'center' };
  worksheet.getRow(4).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFD9D9D9' }
  };

  // Bordes para toda la tabla de datos
  const startRow = 5;
  const endRow = worksheet.lastRow.number - 5;
  for (let i = startRow; i <= worksheet.lastRow.number; i++) {
    worksheet.getRow(i).eachCell((cell) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });
  }

  worksheet.columns.forEach((col) => {
    col.width = 20;
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const fileName = `Adeudos_Finatech_Empresa_${empresaNombre.replace(/\s+/g, '_')}.xlsx`;
  saveAs(new Blob([buffer]), fileName);
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
                {e.nombre}
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
        {renderInput("Importe:", "importe", false, true, "number")}
        {renderInput("IVA:", "iva", true, false, "number")}
        {renderInput("Retención:", "retencion", true, false, "number")}
        {renderInput("Conceptos sin IVA:", "csiniva", false, false, "number")}
        {renderInput("Total:", "total", true, false, "number")}
      </div>

      <div className="grid grid-cols-2 m-3 gap-4">
        {renderInput("Anticipo por el cliente:", "anticipocliente", false, true, "number")}
        {renderInput("Honorarios Finatech (IVA incluido):", "honorarios", false, true, "number")}
      </div>

      <div className="grid grid-cols-1 m-3">
        {renderInput("Adeudo Pendiente:", "adeudo_pendiente", true, false, "number")}
      </div>

      {/* Botones */}
      <div className="grid grid-cols-3 m-3 gap-4">
        <button
          type="button"
          onClick={handleGuardarAdeudo}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md"
        >
          Guardar Adeudo
        </button>
        <button
          type="button"
          onClick={handleNuevoAdeudo}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md"
        >
          Agregar Otro Adeudo
        </button>
        <button
          type="button"
          onClick={exportarExcel}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md"
        >
          Descargar Excel
        </button>
      </div>

      {mostrarVistaPrevia && (
  <div className="m-3 mt-6 border-t-4 border-gray-400 pt-4">
    <h3 className="text-lg font-bold text-center mb-4">Vista previa del reporte Excel</h3>

    {/* NUEVO BLOQUE: Encabezado como en el Excel */}
    <div className="mb-4">
      <p className="text-sm font-semibold">
        Adeudos a Finatech de parte de {empresa.empresa_cif 
          ? (empresasDisponibles.find(e => e.cif === empresa.empresa_cif)?.nombre || empresa.empresa_cif) 
          : "No seleccionada"}
      </p>
      <p className="text-sm font-semibold">
        Adeudos a Finatech desde {
          (() => {
            const fechas = adeudosGuardados.map(a => new Date(a.fechafactura)).filter(f => !isNaN(f));
            if (fechas.length === 0) return "Sin fechas registradas";
            const maxDate = new Date(Math.max(...fechas));
            const inicio = new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);
            const fin = new Date(maxDate.getFullYear(), maxDate.getMonth() + 1, 0);
            const meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
            return `${inicio.getDate()} de ${meses[inicio.getMonth()]} ${inicio.getFullYear()} al ${fin.getDate()} de ${meses[fin.getMonth()]} ${fin.getFullYear()}`;
          })()
        }
      </p>
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
        {adeudosGuardados
            .filter((a) => a.empresa_cif === empresa.empresa_cif)
            .map((a, i) => (
          <tr key={i} className="text-center border">
            <td>{a.concepto}</td>
            <td>{a.proveedor}</td>
            <td>{a.fechafactura}</td>
            <td>{a.numfactura}</td>
            <td>{a.protocoloentrada}</td>
            <td>{parseFloat(a.importe || 0).toFixed(2)}</td>
            <td>{parseFloat(a.iva || 0).toFixed(2)}</td>
            <td>{parseFloat(a.retencion || 0).toFixed(2)}</td>
            <td>{parseFloat(a.csiniva || 0).toFixed(2)}</td>
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
            {adeudosGuardados.length > 0 ? parseFloat(adeudosGuardados[0].anticipocliente || 0).toFixed(2) : "0.00"}
          </td>
        </tr>
        <tr className="bg-gray-50">
          <td colSpan={9} className="text-right pr-2 font-bold">Honorarios FINATECH (IVA incluido):</td>
          <td>
            {adeudosGuardados.length > 0 ? parseFloat(adeudosGuardados[0].honorarios || 0).toFixed(2) : "0.00"}
          </td>
        </tr>
        <tr className="bg-yellow-100 font-bold">
          <td colSpan={9} className="text-right pr-2">Adeudo pendiente:</td>
          <td>
            {adeudosGuardados.length > 0
              ? (
                  adeudosGuardados
  .filter((a) => a.empresa_cif === empresa.empresa_cif)
  .reduce((acc, a) => acc + parseFloat(a.total || 0), 0) +
                  parseFloat(adeudosGuardados[0].honorarios || 0) -
                  parseFloat(adeudosGuardados[0].anticipocliente || 0)
                ).toFixed(2)
              : "0.00"}
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
