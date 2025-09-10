import React, { useMemo } from "react";
import VistaPreviaPdf from '../VistaPreviaPdf.jsx';

const matchEmpresa = (empresaCif) => (a) => {
  const cif = a?.empresa_cif ?? a?.cif ?? a?.empresaCif ?? a?.empresa;
  if (!empresaCif) return false;
  if (!cif) return true; // si viene sin cif lo consideramos de la actual
  return String(cif).trim().toLowerCase() === String(empresaCif).trim().toLowerCase();
};

const isPendiente = (a) => {
  const estado = (a?.estado || a?.Estado || a?.ESTADO || "").toLowerCase();
  const rawNum = a?.num_liquidacion ?? a?.numeroLiquidacion ?? a?.liquidacion;
  const tieneNum = rawNum !== null && rawNum !== undefined && String(rawNum).trim() !== "";
  const numOk = tieneNum && !isNaN(Number(rawNum)) && Number(rawNum) > 0;
  // pendiente si el estado lo dice, o si no tiene nº de liquidación y no está marcado como liquidado
  return estado === "pendiente" || (!numOk && estado !== "liquidado");
};

const rowKey = (a) =>
  `${a?.empresa_cif || "NA"}|${a?.num_factura || a?.num || Math.random()}`;

const BorradorView = ({
  empresaSeleccionada,
  setEmpresaSeleccionada,
  empresasDisponibles,
  adeudosList,
  mostrarVistaPreviaPdf,
  setMostrarVistaPreviaPdf,
  onGenerarPdf,
  onVolver,
  onConfirmarDescarga,
  anticipo,
}) => {
  const { adeudosEmpresa, pendientes } = useMemo(() => {
    const lista = Array.isArray(adeudosList) ? adeudosList : [];
    const deEmpresa = lista.filter(matchEmpresa(empresaSeleccionada));
    const ptes = deEmpresa.filter(isPendiente);
    return { adeudosEmpresa: deEmpresa, pendientes: ptes };
  }, [adeudosList, empresaSeleccionada]);

  const empresaLabel = useMemo(() => {
    if (!empresaSeleccionada) return "";
    const e = empresasDisponibles.find((x) => x.cif === empresaSeleccionada);
    return e ? `${e.cif} - ${e.nombre || ""}` : empresaSeleccionada;
  }, [empresaSeleccionada, empresasDisponibles]);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold text-center mb-2">Agregar Adeudo</h2>
      <h3 className="text-lg font-semibold text-center mb-6">Generar Borrador de Liquidación</h3>

      <div className="mb-4">
        <label className="font-medium">Empresa:</label>
        <select
          className="w-full border rounded p-2 mt-1"
          disabled
          value={empresaSeleccionada || ""}
          onChange={(e) => setEmpresaSeleccionada(e.target.value)}
        >
          <option value="">Selecciona una empresa</option>
          {empresasDisponibles.map((e) => (
            <option key={e.cif} value={e.cif}>
              {e.cif} - {e.nombre}
            </option>
          ))}
        </select>
      </div>

      <div className="p-4 bg-gray-50 rounded border mb-6">
        <p className="font-semibold">
          Adeudos pendientes: <span>{pendientes.length}</span>
        </p>
        <p>Total adeudos para esta empresa: {adeudosEmpresa.length}</p>
        <p>Puede generar PDF: {pendientes.length > 0 ? "SÍ" : "NO"}</p>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onGenerarPdf}
          className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded disabled:opacity-50"
          disabled={pendientes.length === 0}
        >
          Vista Previa PDF Borrador
        </button>

        <button
          type="button"
          onClick={onVolver}
          className="flex-1 bg-slate-700 hover:bg-slate-800 text-white font-semibold py-3 rounded"
        >
          Volver a Generar Adeudo
        </button>
      </div>

      {/* Si quieres listar los pendientes, abajo */}
      {pendientes.length > 0 && (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-sm border">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-2">Estado</th>
                <th className="border p-2">Concepto</th>
                <th className="border p-2">Proveedor</th>
                <th className="border p-2">Fecha</th>
                <th className="border p-2">N° Factura</th>
                <th className="border p-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {pendientes.map((a) => (
                <tr key={rowKey(a)} className="border">
                  <td className="border p-2">Pendiente</td>
                  <td className="border p-2">{a.concepto}</td>
                  <td className="border p-2">{a.proveedor}</td>
                  <td className="border p-2">
                    {a.ff ? new Date(a.ff).toLocaleDateString("es-ES") : "—"}
                  </td>
                  <td className="border p-2">{a.num_factura || "—"}</td>
                  <td className="border p-2">{Number(a.total || 0).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <VistaPreviaPdf
  mostrarVistaPrevia={mostrarVistaPreviaPdf}
  setMostrarVistaPrevia={setMostrarVistaPreviaPdf}
  tipoPdf="borrador"
  empresaCif={empresaSeleccionada}
  adeudosList={adeudosList}
  honorariosSinIVA={0}              // no se usa en borrador
  empresasDisponibles={empresasDisponibles}
  onConfirmarDescarga={onConfirmarDescarga}
  anticipoP={anticipo}
/>
    </div>
  );
};

export default BorradorView;
