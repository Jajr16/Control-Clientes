import React, { useMemo } from 'react';
import VistaPreviaPdf from '../VistaPreviaPdf.jsx';

const LiquidacionView = ({ 
  empresaSeleccionada,
  setEmpresaSeleccionada,
  empresasDisponibles,
  adeudosList,
  honorariosSinIVA,
  setHonorariosSinIVA,
  mostrarVistaPreviaPdf,
  setMostrarVistaPreviaPdf,
  onVerPrevia,
  onVolver,
  onConfirmarDescarga
}) => {

const matchEmpresa = (empresaCif) => (a) => {
  const cif = a?.empresa_cif ?? a?.cif ?? a?.empresaCif ?? a?.empresa;
  if (!empresaCif) return false;
  if (!cif) return true; // si no tiene cif, lo contamos como actual
  return String(cif).trim().toLowerCase() === String(empresaCif).trim().toLowerCase();
};

const isPendiente = (a) => {
  const estado = (a?.estado || a?.Estado || a?.ESTADO || "").toLowerCase();
  const rawNum = a?.num_liquidacion ?? a?.numeroLiquidacion ?? a?.liquidacion;
  const tieneNum = rawNum !== null && rawNum !== undefined && String(rawNum).trim() !== "";
  const numOk = tieneNum && !isNaN(Number(rawNum)) && Number(rawNum) > 0;

  return estado === "pendiente" || (!numOk && estado !== "liquidado");
};

const { adeudosEmpresa, pendientes } = useMemo(() => {
  const lista = Array.isArray(adeudosList) ? adeudosList : [];
  const deEmpresa = lista.filter(matchEmpresa(empresaSeleccionada));
  const ptes = deEmpresa.filter(isPendiente);
  return { adeudosEmpresa: deEmpresa, pendientes: ptes };
}, [adeudosList, empresaSeleccionada]);


const countPendientes = (empresaCif) => {
  const lista = Array.isArray(adeudosList) ? adeudosList : [];
  return lista.filter(matchEmpresa(empresaCif)).filter(isPendiente).length;
};

const puedeGenerarLiquidacion = (empresaCif) => {
  if (!empresaCif) return false;
  return (Array.isArray(adeudosList) ? adeudosList : [])
    .filter(matchEmpresa(empresaCif))
    .filter(isPendiente)
    .length > 0;
};


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
          <label htmlFor="empresa_liquidacion">Empresa:</label>
          <select
            id="empresa_liquidacion"
            value={empresaSeleccionada}
            disabled
            onChange={(e) => setEmpresaSeleccionada(e.target.value)}
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
      {empresaSeleccionada && (
        <div className="m-3 p-3 bg-gray-50 rounded border">
          <p className="text-sm">
            Adeudos que se liquidarán: <strong className="text-red-600">
              {pendientes.length}
            </strong>
          </p>
          <p className="text-xs text-gray-600 mt-1">
            Estos adeudos cambiarán de estado "Pendiente" a "Liquidado"
          </p>
          
          {/* Debug info */}
          {/* <div className="mt-2 text-xs text-gray-500">
            <p>Total adeudos para esta empresa: {adeudosEmpresa.length}</p>
            <p>Puede generar liquidación: {puedeGenerarLiquidacion(empresaSeleccionada) ? 'SÍ' : 'NO'}</p>
          </div> */}
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
            onClick={onVerPrevia}
            disabled={!puedeGenerarLiquidacion(empresaSeleccionada)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            title={!puedeGenerarLiquidacion(empresaSeleccionada) ? "No hay adeudos pendientes" : ""}
            >
          Vista Previa PDF Liquidación
        </button>
        <button
          type="button"
          onClick={onVolver}
          className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-md"
        >
          Volver a Generar Adeudo
        </button>
      </div>

      <VistaPreviaPdf
        mostrarVistaPrevia={mostrarVistaPreviaPdf}
        setMostrarVistaPrevia={setMostrarVistaPreviaPdf}
        tipoPdf="liquidacion"
        empresaCif={empresaSeleccionada}
        adeudosList={adeudosList}
        honorariosSinIVA={honorariosSinIVA}
        empresasDisponibles={empresasDisponibles}
        onConfirmarDescarga={onConfirmarDescarga}
      />
    </div>
  );
};

export default LiquidacionView;