import React from 'react';

const VistaPreviaAdeudos = ({
  adeudosList = [],
  empresa,
  empresasDisponibles = [],
  anticipoP = 0,
}) => {
  // --- Utils ---
  const norm = (s) => String(s || '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toUpperCase().trim();

  // Estado canónico por fila
  const getStatus = (a) => {
    const est = norm(a?.estado);
    if (a?.num_liquidacion) return 'LIQUIDADO';
    if (est === 'PENDIENTE DE ENVIAR') return 'LIQUIDADO';
    return 'PENDIENTE';
  };

  const isPendiente = (a) => getStatus(a) === 'PENDIENTE';

  // Comparador por empresa
  const matchEmpresa = (a, empresaCif) => {
    const cif = a?.empresa_cif ?? a?.cif ?? a?.empresaCif ?? a?.empresa;
    if (!cif) return true;
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

  // Quedarnos SOLO con LIQUIDACIÓN EN CURSO
  const adeudosPendientes = adeudosEmpresa.filter(isPendiente);

  // Resumen solo de pendientes
  const resumen = {
    pendientes: adeudosPendientes.length,
    total: adeudosPendientes.length,
  };

  // Totales solo de pendientes
  const totalPend = adeudosPendientes.reduce((acc, a) => acc + Number(a?.total || 0), 0);

  // (opcional) Si tus filas traen honorarios; si no, puedes quitar esta línea/bloque
  const honorarios = adeudosPendientes.reduce((acc, a) => acc + Number(a?.honorarios || 0), 0);

  const anticipo = Number(anticipoP || 0);
  const adeudoPendiente = (totalPend - anticipo).toFixed(2);

  // Render helpers
  const renderEstadoChip = () => (
    // Etiqueta fija de "LIQUIDACIÓN EN CURSO"
    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800">
      LIQUIDACIÓN EN CURSO
    </span>
  );

  const adeudoPendienteNum = Math.max(totalPend - anticipo, 0);

  const renderResumenEstados = () => {
    if (resumen.total === 0) return null;
    return (
      <div className="bg-gray-50 border rounded-lg p-4 mb-4">
        <h4 className="font-semibold text-gray-700 mb-2">Resumen de Adeudos</h4>
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="bg-yellow-100 rounded p-2">
            <div className="text-2xl font-bold text-yellow-800">{resumen.pendientes}</div>
            <div className="text-sm text-yellow-600">LIQUIDACIÓN EN CURSO</div>
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
          {/* Renderizar solo pendientes */}
          {adeudosPendientes.map((a, index) => (
            <tr
              key={`${rowKey(a)}-${index}`}
              className={`text-center border bg-white ${
                a.es_entrada_rmm_pendiente ? 'bg-yellow-50 border-l-4 border-yellow-400' : ''
              }`}
            >
              <td className="border p-2">{renderEstadoChip()}</td>
              <td className="border p-2">{a?.concepto}</td>
              <td className="border p-2">{a?.proveedor}</td>
              <td className="border p-2">
                {/* CORREGIDO: Mostrar texto adecuado para RMM pendientes */}
                {a.es_entrada_rmm_pendiente ? 
                  <em className="text-gray-500">Pendiente</em> : 
                  (a?.ff || '-')
                }
              </td>
              <td className="border p-2">
                {a.es_entrada_rmm_pendiente ? 
                  <em className="text-gray-500">Pendiente factura final</em> : 
                  (a?.num_factura || '-')
                }
              </td>
              <td className="border p-2">{a?.num_protocolo}</td>
              <td className="border p-2">{Number(a?.importe || 0).toFixed(2)}</td>
              <td className="border p-2">{Number(a?.iva || 0).toFixed(2)}</td>
              <td className="border p-2">{Number(a?.retencion || 0).toFixed(2)}</td>
              <td className="border p-2">{Number(a?.cs_iva || 0).toFixed(2)}</td>
              <td className="border p-2">{Number(a?.total || 0).toFixed(2)}</td>
            </tr>
          ))}

          {/* Totales solo de pendientes */}
          <tr className="font-bold bg-yellow-50 border-2">
            <td colSpan={10} className="text-right pr-2 border">Total facturas LIQUIDACIÓN EN CURSO:</td>
            <td className="border">{totalPend.toFixed(2)}</td>
          </tr>

          <tr className="bg-gray-50">
            <td colSpan={10} className="text-right pr-2 font-bold border">Anticipo por el cliente:</td>
            <td className="border">{anticipo.toFixed(2)}</td>
          </tr>

          {/* (opcional) Honorarios si aplican a pendientes */}
          <tr className="bg-gray-50">
            <td colSpan={10} className="text-right pr-2 font-bold border">Honorarios FINATECH (IVA incluido):</td>
            <td className="border">{honorarios.toFixed(2)}</td>
          </tr>

          {/* Adeudo pendiente (solo pendientes) */}
          <tr className="bg-yellow-100 font-bold border-2">
            <td colSpan={10} className="text-right pr-2 border">
              Adeudo con LIQUIDACIÓN EN CURSO (solo facturas con LIQUIDACIÓN EN CURSO):
            </td>
            <td className="border">{adeudoPendienteNum.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default VistaPreviaAdeudos;