import React from 'react';

const VistaPreviaAdeudos = ({
  adeudosList,
  empresa,
  empresasDisponibles,
  estadoAdeudos,
  anticipoP
}) => {

  console.log(adeudosList)

  // Comparador robusto por empresa
  const matchEmpresa = (a, empresaCif) => {
    const cif = a?.empresa_cif ?? a?.cif ?? a?.empresaCif ?? a?.empresa;
    // Si el adeudo no trae cif, lo consideramos de la empresa actual
    if (!cif) return true;
    return String(cif).trim().toLowerCase() === String(empresaCif || '').trim().toLowerCase();
  };

  // Clave estable por fila
  const rowKey = (a) => [
    a?.num_factura ?? 'nf',
    a?.protocolo_entrada ?? 'pe',
    a?.ff ?? 'f',
    a?.proveedor ?? 'pv'
  ].join('|');

  // Solo adeudos de esta empresa (con fallback si no traen cif)
  const adeudosEmpresa = adeudosList.filter(a => matchEmpresa(a, empresa?.empresa_cif));

  const renderEstadoLiquidacion = (adeudo) => {
    return adeudo.num_liquidacion ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        Liquidado N° {adeudo.num_liquidacion}
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
        Pendiente
      </span>
    );
  };

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

  const honorarios = adeudosEmpresa.reduce((acc, a) => acc + Number(a?.honorarios || 0), 0);

  return (
    <div className="m-3 mt-6 border-t-4 border-gray-400 pt-4">
      <h3 className="text-lg font-bold text-center mb-4">Vista previa de los adeudos</h3>
      {renderResumenEstados()}

      {/* Encabezado */}
      <div className="mb-4">
        <p className="text-sm font-semibold">
          Adeudos a Finatech de parte de {empresa?.empresa_cif
            ? (empresasDisponibles.find(e => e.cif === empresa.empresa_cif)?.nombre || empresa.empresa_cif)
            : "No seleccionada"}
        </p>
        {(() => {
          const fechas = adeudosEmpresa
            .map(a => new Date(a.ff))
            .filter(f => !isNaN(f.getTime()))
            .sort((a, b) => a - b);

          if (fechas.length === 0) return null;

          const meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
          const fmt = f => `${f.getDate()} de ${meses[f.getMonth()]} ${f.getFullYear()}`;
          return (
            <p className="text-sm font-semibold">Adeudos a Finatech desde {fmt(fechas[0])} al {fmt(fechas[fechas.length - 1])}</p>
          );
        })()}
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
            <th className="border p-2">Importe</th>
            <th className="border p-2">IVA</th>
            <th className="border p-2">Retención</th>
            <th className="border p-2">Conceptos sin IVA</th>
            <th className="border p-2">Total</th>
          </tr>
        </thead>
        <tbody>
          {adeudosEmpresa.map((a, index) => (
            <tr key={`${rowKey(a)}-${index}`} className={`text-center border ${a.num_liquidacion ? 'bg-green-50' : 'bg-white'}`}>
              <td className="border p-2">{renderEstadoLiquidacion(a)}</td>
              <td className="border p-2">{a.concepto}</td>
              <td className="border p-2">{a.proveedor}</td>
              <td className="border p-2">{a.ff}</td>
              <td className="border p-2">{a.num_factura}</td>
              <td className="border p-2">{a.protocolo_entrada}</td>
              <td className="border p-2">{Number(a.importe || 0).toFixed(2)}</td>
              <td className="border p-2">{Number(a.iva || 0).toFixed(2)}</td>
              <td className="border p-2">{Number(a.retencion || 0).toFixed(2)}</td>
              <td className="border p-2">{Number(a.cs_iva || 0).toFixed(2)}</td>
              <td className="border p-2">{Number(a.total || 0).toFixed(2)}</td>
            </tr>
          ))}

          {/* Totales PENDIENTES */}
          <tr className="font-bold bg-yellow-50 border-2">
            <td colSpan={10} className="text-right pr-2 border">Total facturas PENDIENTES:</td>
            <td className="border">
              {adeudosEmpresa
                .filter(a => !a.num_liquidacion || a.estado === 'PENDIENTE')
                .reduce((acc, a) => acc + Number(a.total || 0), 0)
                .toFixed(2)}
            </td>
          </tr>

          {/* Totales LIQUIDADOS */}
          {estadoAdeudos.liquidados > 0 && (
            <tr className="font-bold bg-green-50 border-2">
              <td colSpan={10} className="text-right pr-2 border">Total facturas LIQUIDADAS:</td>
              <td className="border">
                {adeudosEmpresa
                  .filter(a => a.num_liquidacion || a.estado === 'LIQUIDADO')
                  .reduce((acc, a) => acc + Number(a.total || 0), 0)
                  .toFixed(2)}
              </td>
            </tr>
          )}
          
          <tr className="bg-gray-50">
            <td colSpan={10} className="text-right pr-2 font-bold border">Anticipo por el cliente:</td>
            <td className="border">
              {adeudosEmpresa.length > 0
                ? Number(anticipoP || 0).toFixed(2)
                : "0.00"}
            </td>
          </tr>

          <tr className="bg-gray-50">
            <td colSpan={10} className="text-right pr-2 font-bold border">Honorarios FINATECH (IVA incluido):</td>
            <td className="border">{honorarios.toFixed(2)}</td>
          </tr>

          {/* Adeudo pendiente (solo pendientes) */}
          <tr className="bg-yellow-100 font-bold border-2">
            <td colSpan={10} className="text-right pr-2 border">Adeudo pendiente (solo facturas pendientes):</td>
            <td className="border">
              {(() => {
                const totalPend = adeudosEmpresa
                  .filter(a => !a.num_liquidacion || a.estado === 'PENDIENTE')
                  .reduce((acc, a) => acc + Number(a.total || 0), 0);

                const anticipo = Number(+anticipoP || 0);
                return (totalPend - anticipoP).toFixed(2);
              })()}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default VistaPreviaAdeudos;
