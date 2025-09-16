import React from 'react';
import { obtenerDatosCalculados, formatearFecha } from '../utils/calculations';

const rowKey = (a) => {
  const nf = a.num_factura ?? a.numfactura ?? '';
  const pe = a.num_protocolo ?? a.protocolo ?? '';
  const ff = a.ff ?? a.fecha ?? '';
  return `${String(nf)}|${String(pe)}|${String(ff)}`;
};

const VistaPreviaPdf = ({
  mostrarVistaPrevia,
  setMostrarVistaPrevia,
  tipoPdf,              // 'borrador' | 'liquidacion'
  empresaCif,
  adeudosList,
  honorariosSinIVA,
  empresasDisponibles,
  onConfirmarDescarga,
  anticipoP,
}) => {
  if (!mostrarVistaPrevia) return null;

  // Helpers coherentes con el resto de la app
  const matchEmpresa = (empresaId) => (a) => {
    const cif = a?.empresa_cif ?? a?.cif ?? a?.empresaCif ?? a?.empresa;
    if (!empresaId) return false;
    if (!cif) return true; // si falta el cif en el registro, lo contamos para la empresa actual
    return String(cif).trim().toLowerCase() === String(empresaId).trim().toLowerCase();
  };

  const isPendiente = (a) => {
    const estado = (a?.estado || a?.Estado || a?.ESTADO || '').toLowerCase();
    const rawNum = a?.num_liquidacion ?? a?.numeroLiquidacion ?? a?.liquidacion;
    const tieneNum = rawNum !== null && rawNum !== undefined && String(rawNum).trim() !== '';
    const numOk = tieneNum && !isNaN(Number(rawNum)) && Number(rawNum) > 0;
    // PENDIENTE si está marcado como tal o si no tiene num_liquidacion válido y no está marcado como LIQUIDADO
    return estado === 'pendiente' || (!numOk && estado !== 'liquidado');
  };

  // Calcula base con tu util (empresa, nombres, anticipo, etc.)
  const datos = obtenerDatosCalculados(empresaCif, adeudosList, honorariosSinIVA, empresasDisponibles);

  // Forzamos las filas a mostrar SOLO los pendientes de la empresa
  const base = Array.isArray(adeudosList) ? adeudosList : [];
  const adeudosFiltrados = base.filter(matchEmpresa(empresaCif)).filter(isPendiente);

  // Recalcular subtotales para lo que se pinta en la tabla
  const totalImporte   = adeudosFiltrados.reduce((acc, a) => acc + Number(a.importe || 0), 0);
  const totalIVA       = adeudosFiltrados.reduce((acc, a) => acc + Number(a.iva || 0), 0);
  const totalRetencion = adeudosFiltrados.reduce((acc, a) => acc + Number(a.retencion || 0), 0);
  const totalFacturas  = adeudosFiltrados.reduce((acc, a) => acc + Number(a.total || 0), 0);

  // Anticipo proveniente de la propia lista (inyectado en fetch) o del cálculo
  const anticipo = Number(
    (anticipoP) ??
    (Array.isArray(adeudosList) && anticipoP) ??
    anticipoP ??
    0
  );

  const honorariosBase = Number(honorariosSinIVA || 0);
  const honorariosIVA  = honorariosBase * 0.21;
  const honorariosTot  = honorariosBase + honorariosIVA;

  // Adeudo pendiente para el documento (borrador: sin honorarios; liquidación: con honorarios)
  const adeudoPendiente = tipoPdf === 'liquidacion'
    ? totalFacturas + honorariosTot - anticipo
    : totalFacturas - anticipo;

  // Fechas desde/hasta (con lo que se está mostrando)
  const fechasValidas = adeudosFiltrados
    .map(a => new Date(a.ff))
    .filter(d => !isNaN(d.getTime()))
    .sort((a, b) => a - b);

  const fechaDesde = fechasValidas[0] || null;
  const fechaHasta = fechasValidas[fechasValidas.length - 1] || null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-6xl max-h-[95vh] overflow-y-auto w-full mx-4 shadow-2xl">
        {/* Header del modal */}
        <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center rounded-t-lg">
          <div>
            <h3 className="text-2xl font-bold text-gray-800">Vista Previa del PDF</h3>
            <p className="text-sm text-gray-600 mt-1">
              {tipoPdf === 'borrador' ? 'Borrador de liquidación' : 'Liquidación final'}
            </p>
          </div>
          <button
            onClick={() => setMostrarVistaPrevia(false)}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold w-8 h-8 flex items-center justify-center"
          >
            ×
          </button>
        </div>

        {/* Contenido del documento */}
        <div className="p-8">
          <div className="bg-white border-2 border-gray-200 rounded-lg p-8 shadow-lg max-w-4xl mx-auto">
            {/* Encabezado */}
            <div className="text-center mb-8 border-b-2 border-blue-600 pb-6">
              <div className="mb-4">
                <h1 className="text-3xl font-bold text-blue-800 mb-2">FINATECH</h1>
                <p className="text-sm text-gray-600">Servicios Financieros y Consultoría</p>
              </div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-3">
                {tipoPdf === 'borrador' ? 'BORRADOR DE LIQUIDACIÓN DE ADEUDOS' : 'LIQUIDACIÓN FINAL DE ADEUDOS'}
              </h2>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Fecha de generación:</strong> {new Date().toLocaleDateString('es-ES')}</p>
                <p><strong>Empresa:</strong> {datos.empresaNombre}</p>
                <p><strong>CIF:</strong> {empresaCif}</p>
                {fechaDesde && fechaHasta && (
                  <p><strong>Período:</strong> {formatearFecha(fechaDesde)} al {formatearFecha(fechaHasta)}</p>
                )}
              </div>
            </div>

            {/* Tabla */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 border-l-4 border-blue-600 pl-3">
                Detalle de Adeudos (pendientes)
              </h3>

              {adeudosFiltrados.length === 0 ? (
                <div className="p-4 bg-yellow-50 text-yellow-700 rounded border border-yellow-200">
                  No hay adeudos pendientes para mostrar.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse bg-white rounded-lg overflow-hidden shadow-sm">
                    <thead>
                      <tr className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                        <th className="border border-blue-500 p-3 text-left text-sm font-semibold">Fecha</th>
                        <th className="border border-blue-500 p-3 text-left text-sm font-semibold">Concepto</th>
                        <th className="border border-blue-500 p-3 text-left text-sm font-semibold">Proveedor</th>
                        <th className="border border-blue-500 p-3 text-left text-sm font-semibold">N° Factura</th>
                        <th className="border border-blue-500 p-3 text-right text-sm font-semibold">Base Imponible (€)</th>
                        <th className="border border-blue-500 p-3 text-right text-sm font-semibold">IVA (€)</th>
                        <th className="border border-blue-500 p-3 text-right text-sm font-semibold">Retención (€)</th>
                        <th className="border border-blue-500 p-3 text-right text-sm font-semibold">Total (€)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adeudosFiltrados.map((a) => (
                        <tr key={rowKey(a)} className="bg-white even:bg-gray-50">
                          <td className="border border-gray-300 p-3 text-sm">
                            {a.ff ? new Date(a.ff).toLocaleDateString('es-ES') : '—'}
                          </td>
                          <td className="border border-gray-300 p-3 text-sm">{a.concepto || '—'}</td>
                          <td className="border border-gray-300 p-3 text-sm">{a.proveedor || '—'}</td>
                          <td className="border border-gray-300 p-3 text-sm">{a.num_factura || a.numfactura || '—'}</td>
                          <td className="border border-gray-300 p-3 text-sm text-right font-mono">
                            {Number(a.importe || 0).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="border border-gray-300 p-3 text-sm text-right font-mono">
                            {Number(a.iva || 0).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="border border-gray-300 p-3 text-sm text-right font-mono">
                            {Number(a.retencion || 0).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="border border-gray-300 p-3 text-sm text-right font-mono font-semibold">
                            {Number(a.total || 0).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))}

                      {/* Subtotales */}
                      <tr className="bg-gradient-to-r from-gray-100 to-gray-200 font-bold border-t-2 border-gray-400">
                        <td className="border border-gray-400 p-3 text-right text-sm" colSpan={4}>
                          <strong>SUBTOTALES</strong>
                        </td>
                        <td className="border border-gray-400 p-3 text-right text-sm font-mono">
                          <strong>{totalImporte.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                        </td>
                        <td className="border border-gray-400 p-3 text-right text-sm font-mono">
                          <strong>{totalIVA.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                        </td>
                        <td className="border border-gray-400 p-3 text-right text-sm font-mono">
                          <strong>{totalRetencion.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                        </td>
                        <td className="border border-gray-400 p-3 text-right text-sm font-mono">
                          <strong>{totalFacturas.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Resumen */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Resumen de facturas */}
              <div className="bg-blue-50 border-l-4 border-blue-600 p-5 rounded-r-lg">
                <h3 className="font-semibold text-blue-800 mb-3 text-lg">Resumen de Facturas</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-700">Total de registros:</span>
                    <span className="font-semibold">{adeudosFiltrados.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Total facturas:</span>
                    <span className="font-semibold font-mono">
                      {totalFacturas.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Anticipo recibido:</span>
                    <span className="font-semibold font-mono">
                      {anticipo.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                    </span>
                  </div>
                </div>
              </div>

              {/* Honorarios (solo en liquidación) */}
              {tipoPdf === 'liquidacion' && (
                <div className="bg-green-50 border-l-4 border-green-600 p-5 rounded-r-lg">
                  <h3 className="font-semibold text-green-800 mb-3 text-lg">Honorarios Finatech</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-700">Base imponible:</span>
                      <span className="font-semibold font-mono">
                        {honorariosBase.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">IVA (21%):</span>
                      <span className="font-semibold font-mono">
                        {honorariosIVA.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                      </span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-gray-700 font-semibold">Total honorarios:</span>
                      <span className="font-bold font-mono text-green-700">
                        {honorariosTot.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
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
                    {totalFacturas.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                  </p>
                </div>
                {tipoPdf === 'liquidacion' && (
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <p className="text-sm text-gray-600 mb-1">Honorarios</p>
                    <p className="text-lg font-bold text-green-700 font-mono">
                      + {honorariosTot.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                    </p>
                  </div>
                )}
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <p className="text-sm text-gray-600 mb-1">Anticipo Recibido</p>
                  <p className="text-lg font-bold text-blue-700 font-mono">
                    - {anticipo.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                  </p>
                </div>
              </div>

              <div className="mt-6 text-center">
                <div className="bg-white rounded-lg p-6 shadow-lg border-2 border-yellow-400">
                  <p className="text-lg font-semibold text-gray-700 mb-2">ADEUDO PENDIENTE</p>
                  <p className={`text-3xl font-bold font-mono ${adeudoPendiente >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {adeudoPendiente.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    {adeudoPendiente >= 0 ? 'Pendiente de pago por el cliente' : 'Saldo a favor del cliente'}
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
            onClick={() => setMostrarVistaPrevia(false)}
            className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirmarDescarga}
            className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all font-medium shadow-lg"
          >
            Descargar PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default VistaPreviaPdf;
