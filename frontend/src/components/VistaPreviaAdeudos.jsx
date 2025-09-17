import React from 'react';

const VistaPreviaAdeudos = ({
  adeudosList = [],
  empresa,
  empresasDisponibles = [],
  anticipoP = 0,
}) => {

  // --- Utils ---
  const norm = (s) => String(s || '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // quita acentos
    .toUpperCase().trim();

  // Estado canónico por fila (evita solapamientos)
  // Regla: si trae num_liquidacion => "LIQUIDADO" (etiqueta visual "PENDIENTE DE ENVIAR")
  //       si texto dice "PENDIENTE DE ENVIAR" => "LIQUIDADO"
  //       en cualquier otro caso => "PENDIENTE" (etiqueta "LIQUIDACIÓN EN CURSO")
  const getStatus = (a) => {
    const est = norm(a?.estado);
    if (a?.num_liquidacion) return 'LIQUIDADO';
    if (est === 'PENDIENTE DE ENVIAR') return 'LIQUIDADO';
    return 'PENDIENTE'; // "LIQUIDACION EN CURSO"
  };

  const isPendiente = (a) => getStatus(a) === 'PENDIENTE';
  const isLiquidado = (a) => getStatus(a) === 'LIQUIDADO';

  // Comparador robusto por empresa
  const matchEmpresa = (a, empresaCif) => {
    const cif = a?.empresa_cif ?? a?.cif ?? a?.empresaCif ?? a?.empresa;
    if (!cif) return true; // si no trae cif, lo consideramos de la empresa actual
    return String(cif).trim().toLowerCase() === String(empresaCif || '').trim().toLowerCase();
  };

  // Clave estable por fila
  const rowKey = (a) => [
    a?.num_factura ?? 'nf',
    a?.num_protocolo ?? 'pe',
    a?.ff ?? 'f',
    a?.proveedor ?? 'pv'
  ].join('|');

  // Filtrar por empresa
  const adeudosEmpresa = adeudosList.filter(a => matchEmpresa(a, empresa?.empresa_cif));

  // Resumen local (ya no dependemos de props externas)
  const resumen = {
    pendientes: adeudosEmpresa.filter(isPendiente).length,
    liquidados: adeudosEmpresa.filter(isLiquidado).length,
    total: adeudosEmpresa.length,
  };

  // Totales por estado (consistentes)
  const totalPend = adeudosEmpresa
    .filter(isPendiente)
    .reduce((acc, a) => acc + Number(a?.total || 0), 0);

  const totalLiq = adeudosEmpresa
    .filter(isLiquidado)
    .reduce((acc, a) => acc + Number(a?.total || 0), 0);

  const honorarios = adeudosEmpresa.reduce((acc, a) => acc + Number(a?.honorarios || 0), 0);
  const anticipo = Number(anticipoP || 0);
  const adeudoPendiente = (totalPend - anticipo).toFixed(2);

  // Render helpers
  const renderEstadoChip = (a) => {
    const status = getStatus(a);
    if (status === 'LIQUIDADO') {
      // Mantengo tu etiqueta visual original para "liquidados"
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          PENDIENTE DE ENVIAR
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
        LIQUIDACIÓN EN CURSO
      </span>
    );
  };

  const renderResumenEstados = () => {
    if (resumen.total === 0) return null;
    return (
      <div className="bg-gray-50 border rounded-lg p-4 mb-4">
        <h4 className="font-semibold text-gray-700 mb-2">Resumen de Adeudos</h4>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-yellow-100 rounded p-2">
            <div className="text-2xl font-bold text-yellow-800">{resumen.pendientes}</div>
            <div className="text-sm text-yellow-600">LIQUIDACIÓN EN CURSO</div>
          </div>
          <div className="bg-green-100 rounded p-2">
            <div className="text-2xl font-bold text-green-800">{resumen.liquidados}</div>
            <div className="text-sm text-green-600">PENDIENTE DE ENVIAR</div>
          </div>
          <div className="bg-blue-100 rounded p-2">
            <div className="text-2xl font-bold text-blue-800">{resumen.total}</div>
            <div className="text-sm text-blue-600">Total</div>
          </div>
        </div>
      </div>
    );
  };

  const nombreEmpresa =
    empresa?.empresa_cif
      ? (empresasDisponibles.find(e => e.cif === empresa.empresa_cif)?.nombre || empresa.empresa_cif)
      : 'No seleccionada';

  return (
    <div className="m-3 mt-6 border-t-4 border-gray-400 pt-4">
      <h3 className="text-lg font-bold text-center mb-4">Vista previa de los adeudos</h3>
      {renderResumenEstados()}

      {/* Encabezado */}
      <div className="mb-4">
        <p className="text-sm font-semibold">
          Adeudos a Finatech de parte de {nombreEmpresa}
        </p>
      </div>

      {/* Tabla */}
      <table className="w-full text-sm border">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">Estado</th>
            <th className="border p-2">Concepto</th>
            <th className="border p-2">Proveedor</th>
            <th className="border p-2">Fecha factura</th>
            <th className="border p-2">Num factura</th>
            <th className="border p-2">Protocolo / Entrada</th>
            <th className="border p-2">Base Imponible</th>
            <th className="border p-2">IVA</th>
            <th className="border p-2">Retención</th>
            <th className="border p-2">Conceptos sin IVA</th>
            <th className="border p-2">Total</th>
          </tr>
        </thead>
        <tbody>
          {adeudosEmpresa.map((a, index) => {
            const status = getStatus(a);
            const isRowLiquidado = status === 'LIQUIDADO';
            return (
              <tr
                key={`${rowKey(a)}-${index}`}
                className={`text-center border ${isRowLiquidado ? 'bg-green-50' : 'bg-white'}`}
              >
                <td className="border p-2">{renderEstadoChip(a)}</td>
                <td className="border p-2">{a?.concepto}</td>
                <td className="border p-2">{a?.proveedor}</td>
                <td className="border p-2">{a?.ff}</td>
                <td className="border p-2">{a?.num_factura}</td>
                <td className="border p-2">{a?.num_protocolo}</td>
                <td className="border p-2">{Number(a?.importe || 0).toFixed(2)}</td>
                <td className="border p-2">{Number(a?.iva || 0).toFixed(2)}</td>
                <td className="border p-2">{Number(a?.retencion || 0).toFixed(2)}</td>
                <td className="border p-2">{Number(a?.cs_iva || 0).toFixed(2)}</td>
                <td className="border p-2">{Number(a?.total || 0).toFixed(2)}</td>
              </tr>
            );
          })}

          {/* Totales PENDIENTES */}
          <tr className="font-bold bg-yellow-50 border-2">
            <td colSpan={10} className="text-right pr-2 border">Total facturas LIQUIDACIÓN EN CURSO:</td>
            <td className="border">{totalPend.toFixed(2)}</td>
          </tr>

          {/* Totales LIQUIDADOS */}
          {resumen.liquidados > 0 && (
            <tr className="font-bold bg-green-50 border-2">
              <td colSpan={10} className="text-right pr-2 border">Total facturas LIQUIDADAS:</td>
              <td className="border">{totalLiq.toFixed(2)}</td>
            </tr>
          )}

          <tr className="bg-gray-50">
            <td colSpan={10} className="text-right pr-2 font-bold border">Anticipo por el cliente:</td>
            <td className="border">{anticipo.toFixed(2)}</td>
          </tr>

          <tr className="bg-gray-50">
            <td colSpan={10} className="text-right pr-2 font-bold border">Honorarios FINATECH (IVA incluido):</td>
            <td className="border">{honorarios.toFixed(2)}</td>
          </tr>

          {/* Adeudo pendiente (solo pendientes) */}
          <tr className="bg-yellow-100 font-bold border-2">
            <td colSpan={10} className="text-right pr-2 border">
              Adeudo con LIQUIDACIÓN EN CURSO (solo facturas con LIQUIDACIÓN EN CURSO):
            </td>
            <td className="border">{adeudoPendiente}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default VistaPreviaAdeudos;
