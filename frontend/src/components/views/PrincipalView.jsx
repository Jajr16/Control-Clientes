import React from 'react';
import FormInput from '../Forminput.jsx';
import VistaPreviaAdeudos from '../VistaPreviaAdeudos';

const PrincipalView = ({ 
  empresa,
  empresasDisponibles,
  adeudosList,
  estadoAdeudos,
  mostrarVistaPrevia,
  importeBloqueado,
  validationErrors,
  onChange,
  onGuardarAdeudo,
  onGenerarBorrador,
  onGenerarLiquidacion,
  botonGuardarDeshabilitado,
  puedeGenerarLiquidacion,
  cargandoAdeudos,
  anticipo
}) => {
  const getError = (field) => validationErrors[field];

  const getDebugInfo = () => {
    if (!empresa.empresa_cif) return { pendientes: 0 };
    
    const adeudosArray = Array.isArray(adeudosList) ? adeudosList : [];
    const adeudosEmpresa = adeudosArray.filter(a => {
      if (!a) return false;
      const empresaCifAdeudo = a.empresa_cif || a.cif || a.empresaCif;
      if (!empresaCifAdeudo) return false;
      return String(empresaCifAdeudo).toLowerCase().trim() === String(empresa.empresa_cif).toLowerCase().trim();
    });
    
    const adeudosPendientes = adeudosEmpresa.filter(a => {
      const estado = a.estado || a.Estado || a.ESTADO;
      const numLiquidacion = a.num_liquidacion || a.numeroLiquidacion || a.liquidacion;
      
      const estadoPendiente = estado && String(estado).toLowerCase() === 'pendiente';
      const sinLiquidacion = !numLiquidacion || numLiquidacion === null || String(numLiquidacion).trim() === '';
      const noEsLiquidado = !estado || String(estado).toLowerCase() !== 'liquidado';
      
      return estadoPendiente || (sinLiquidacion && noEsLiquidado);
    });
    
    return { pendientes: adeudosPendientes.length, empresa: adeudosEmpresa.length };
  };
  
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
            onChange={onChange}
            className={`w-full border rounded-md ${getError('empresa_cif') ? 'border-red-500' : 'border-gray-300'}`}
          >
            <option value="">Selecciona una empresa</option>
            {empresasDisponibles.map((e) => (
              <option key={e.cif} value={e.cif}>
                {e.clave} - {e.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Formulario */}
      <div className="grid grid-cols-3 m-3 gap-4">
        <FormInput
          label="Concepto:"
          name="concepto"
          value={empresa.concepto}
          onChange={onChange}
          maxLength={200}
          error={getError('concepto')}
        />
        <FormInput
          label="Proveedor:"
          name="proveedor"
          value={empresa.proveedor}
          onChange={onChange}
          maxLength={50}
          error={getError('proveedor')}
        />
        <FormInput
          label="Fecha Factura:"
          name="fechafactura"
          value={empresa.fechafactura}
          onChange={onChange}
          type="date"
          error={getError('fechafactura')}
        />
      </div>

      <div className="grid grid-cols-2 m-3 gap-4">
        <FormInput
          label="Num Factura:"
          name="numfactura"
          value={empresa.numfactura}
          onChange={onChange}
          maxLength={50}
          error={getError('numfactura')}
        />
        <FormInput
          label="Protocolo / Entrada:"
          name="protocoloentrada"
          value={empresa.protocoloentrada}
          onChange={onChange}
          maxLength={50}
          required={false}
          error={getError('protocoloentrada')}
        />
      </div>

      <div className="grid grid-cols-5 m-3 gap-4">
        <FormInput
          label="Importe:"
          name="importe"
          value={empresa.importe}
          onChange={onChange}
          type="number"
          readOnly={importeBloqueado}
          error={getError('importe')}
        />
        <FormInput
          label="IVA:"
          name="iva"
          value={empresa.iva}
          onChange={onChange}
          type="number"
          readOnly={true}
          required={false}
          error={getError('iva')}
        />
        <FormInput
          label="Retención:"
          name="retencion"
          value={empresa.retencion}
          onChange={onChange}
          type="number"
          readOnly={true}
          required={false}
          error={getError('retencion')}
        />
        <FormInput
          label="Conceptos sin IVA:"
          name="csiniva"
          value={empresa.csiniva}
          onChange={onChange}
          type="number"
          required={false}
          error={getError('csiniva')}
        />
        <FormInput
          label="Total:"
          name="total"
          value={empresa.total}
          onChange={onChange}
          type="number"
          readOnly={true}
          required={false}
          error={getError('total')}
        />
      </div>

      {/* Botones */}
      <div className="grid grid-cols-3 m-3 gap-4">
        <button
          type="button"
          onClick={onGuardarAdeudo}
          className={`bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md ${
            botonGuardarDeshabilitado ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={botonGuardarDeshabilitado}
        >
          Guardar Adeudo
        </button>
        <button
        disabled={cargandoAdeudos || !puedeGenerarLiquidacion(empresa.empresa_cif)}
        type="button"
        onClick={onGenerarBorrador}
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
        title={
            cargandoAdeudos
            ? "Cargando adeudos…"
            : !puedeGenerarLiquidacion(empresa.empresa_cif)
                ? "No hay adeudos pendientes"
                : ""
        }
        >
        Generar borrador de liquidación
        </button>

        <button
        disabled={cargandoAdeudos || !puedeGenerarLiquidacion(empresa.empresa_cif)}
        type="button"
        onClick={onGenerarLiquidacion}
        className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
        title={
            cargandoAdeudos
            ? "Cargando adeudos…"
            : !puedeGenerarLiquidacion(empresa.empresa_cif)
                ? "No hay adeudos pendientes"
                : ""
        }
        >
        Generar liquidación final
        </button>

      </div>

      {/* Debug info mejorado */}
      {/* {empresa.empresa_cif && (
        <div className="m-3 p-2 bg-yellow-100 text-xs">
          <strong>Debug:</strong> CIF: {empresa.empresa_cif} | 
          Puede generar: {puedeGenerarLiquidacion(empresa.empresa_cif) ? 'SÍ' : 'NO'} | 
          Adeudos totales: {adeudosList.length} | 
          De esta empresa: {getDebugInfo().empresa || 0} |
          Pendientes: {getDebugInfo().pendientes}
        </div>
      )} */}

      {/* Vista previa (solo se muestra en la vista principal) */}
      {mostrarVistaPrevia && (
        <VistaPreviaAdeudos
          adeudosList={adeudosList}
          empresa={empresa}
          empresasDisponibles={empresasDisponibles}
          estadoAdeudos={estadoAdeudos}
          anticipoP={anticipo}
        />
      )}
    </div>
  );
};

export default PrincipalView;