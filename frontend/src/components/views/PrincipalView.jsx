import React from 'react';
import FormInput from '../Forminput.jsx';
import VistaPreviaAdeudos from '../VistaPreviaAdeudos';
import RMMFields from '../RMMFields.jsx';

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
  anticipo,
  protocolosDisponibles = [],
  prefillDesdeProtocolo,  
  rmmReadOnly = false,     
  rmmDatos = null, 
  registrarProtocoloLocal = () => {},
  rmm, setRmm

}) => {
  const getError = (field) => validationErrors[field];
  const esRegistroMercantil = empresa?.proveedor?.toLowerCase().includes('registro mercantil de madrid'); 
  const [mostrandoNuevoProtocolo, setMostrandoNuevoProtocolo] = React.useState(false);
  const normalizados = React.useMemo(
    () => protocolosDisponibles.map(p => String(p).trim().toLowerCase()),
    [protocolosDisponibles]
  );
  const valorProtocolo = String(empresa.protocoloentrada || '').trim();
  const esProtocoloExistente =
    esRegistroMercantil &&
    !!valorProtocolo &&
    normalizados.includes(valorProtocolo.toLowerCase()) &&
    !!rmmDatos && !mostrandoNuevoProtocolo;
    console.log('🔧 DEBUG Lógica RMM:', {
    esRegistroMercantil,
    protocoloentrada: empresa.protocoloentrada,
    mostrandoNuevoProtocolo,
    esProtocoloExistente,
    protocolosDisponibles: protocolosDisponibles.slice(0, 3) + '...',
    'mostrar formulario estándar': (!esRegistroMercantil || mostrandoNuevoProtocolo || !esProtocoloExistente),
    'mostrar formulario RMM': esProtocoloExistente
});
  // Se elimina la lógica de estado local (protocoloSeleccion y nuevoProtocolo).
  // Se elimina la variable `protocoloExiste` porque depende de `protocoloSeleccion`.

  React.useEffect(() => {
    const protocoloExiste = esProtocoloExistente && !mostrandoNuevoProtocolo;

    if (protocoloExiste && !mostrandoNuevoProtocolo) {
      setRmm(prev => ({
        ...prev,
        empresa_cif: empresa?.empresa_cif || "",
        num_entrada: empresa?.protocoloentrada || "",
      }));
    } else {
      setRmm(prev => ({
        ...prev,
        num_entrada: "",
        fecha_anticipo: "",
        diferencia: "",
        fecha_devolucion_diferencia: "",
        num_factura_final: ""
      }));
    }
  }, [esProtocoloExistente, mostrandoNuevoProtocolo, empresa?.empresa_cif, empresa?.protocoloentrada, empresa?.fechafactura, rmmDatos, setRmm]);

  // Se eliminan las funciones handleSelectProtocolo y handleNuevoProtocolo.
  // El `onChange` pasado como prop es suficiente.

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

  console.log('🔍 DEBUG PrincipalView:', {
  proveedor: empresa?.proveedor,
  esRegistroMercantil,
  protocolosDisponibles: protocolosDisponibles.length,
  protocolos: protocolosDisponibles
});
  return (
    <div className="mb-6">
      {/* Empresa */}
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

      {/* Concepto / Proveedor / Fecha */}
      <div className="grid grid-cols-3 m-3 gap-4">
        <FormInput
          label="Concepto:"
          name="concepto"
          value={esRegistroMercantil ? 'Inscripción Registro Mercantil' : (empresa.concepto || '')}
          onChange={onChange}
          readOnly={esRegistroMercantil} // 👈 forzado en RMM
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
          label={esRegistroMercantil ? "Fecha Anticipo:" : "Fecha Factura:"}
          name="fechafactura"
          value={empresa.fechafactura}
          onChange={onChange}
          type="date"
          readOnly={esProtocoloExistente && rmmReadOnly} // 👈 si vino de histórico la bloqueamos
          error={getError('fechafactura')}
        />
      </div>

      <div className="grid grid-cols-2 m-3 gap-4">
        {/* Num Factura: NO se muestra cuando es RMM */}
        {!esRegistroMercantil && (
          <FormInput
            label="Num Factura:"
            name="numfactura"
            value={empresa.numfactura}
            onChange={onChange}
            maxLength={50}
            error={getError('numfactura')}
          />
        )}

        {/* Protocolo / Entrada */}
        {!esRegistroMercantil ? (
          <FormInput
            label="Protocolo / Entrada:"
            name="protocoloentrada"
            value={empresa.protocoloentrada}
            onChange={onChange}
            maxLength={50}
            required={false}
            error={getError('protocoloentrada')}
          />
        ) : (
          <div className="flex flex-col">
            <label htmlFor="protocoloentrada">Protocolo / Entrada:</label>
            <select
              id="protocoloentrada"
              className={`w-full border rounded-md px-2 py-2 ${getError('protocoloentrada') ? 'border-red-500' : 'border-gray-300'}`}
              value={mostrandoNuevoProtocolo ? '__nuevo__' : valorProtocolo}
              onChange={async (e) => {
  const v = e.target.value;

  if (v === '__nuevo__') {
    setMostrandoNuevoProtocolo(true);
    // 🔧 IMPORTANTE: Limpiar rmmDatos cuando es nuevo protocolo
    setRmm(prev => ({
      ...prev,
      num_entrada: "",
      fecha_anticipo: "",
      diferencia: "",
      fecha_devolucion_diferencia: "",
      num_factura_final: "",
      ff: ""
    }));
    onChange({ target: { name: 'protocoloentrada', value: '' } });
    return;
  }

  setMostrandoNuevoProtocolo(false);
  onChange({ target: { name: 'protocoloentrada', value: v } });

  // Si selecciona uno EXISTENTE, pedimos prefill al backend
  if (v && prefillDesdeProtocolo) {
    try {
      await prefillDesdeProtocolo(empresa.empresa_cif, v);
    } catch (err) {
      console.error('prefillDesdeProtocolo error:', err);
    }
  }
}}
              name="protocoloentrada"
            >
              <option value="">Selecciona protocolo/entrada</option>
              {protocolosDisponibles.length === 0 && <option disabled>No hay protocolos disponibles</option>}
              {protocolosDisponibles.map((p, i) => (
                <option key={`${p}-${i}`} value={p}>{p}</option>
              ))}
              <option value="__nuevo__">+ Nuevo protocolo/entrada…</option>
            </select>

            {/* Campo editable SOLO si está en modo "nuevo" */}
            {mostrandoNuevoProtocolo && (
              <input
                type="text"
                className="mt-2 w-full border rounded-md px-2 py-2 border-gray-300"
                placeholder="Escribe el nuevo protocolo/entrada"
                name="protocoloentrada"
                value={empresa.protocoloentrada || ""}
                onChange={onChange}
              />
            )}
          </div>
        )}
      </div>

      {/* Variante A (normal): cuando NO es RMM o es RMM pero SIN protocolo existente */}
      {(!esRegistroMercantil || mostrandoNuevoProtocolo || !esProtocoloExistente) && (
        <div className="grid grid-cols-5 m-3 gap-4">
          <FormInput
            label={esRegistroMercantil ? "Anticipo:" : "Base Imponible:"}
            name="importe"
            value={empresa.importe}
            onChange={onChange}
            type="number"
            error={getError('importe')}
          />
          <FormInput
            label="IVA:"
            name="iva"
            value={empresa.iva}
            onChange={onChange}
            type="number"
            readOnly
            required={false}
            error={getError('iva')}
          />
          <FormInput
            label="Retención:"
            name="retencion"
            value={empresa.retencion}
            onChange={onChange}
            type="number"
            readOnly
            required={false}
            error={getError('retencion')}
          />
          <FormInput
            label="Conceptos sin IVA:"
            name="csiniva"
            value={esRegistroMercantil ? 0 : empresa.csiniva}
            onChange={onChange}
            type="number"
            required={false}
            readOnly={esRegistroMercantil}
            disabled={esRegistroMercantil}
            error={getError('csiniva')}
          />
          <FormInput
            label="Total:"
            name="total"
            value={empresa.total}
            onChange={onChange}
            type="number"
            readOnly
            required={false}
            error={getError('total')}
          />
        </div>
      )}

      {/* Variante B (RMM): protocolo existente => mostrar RMMFields (sin anticipo) */}
      {esProtocoloExistente && !mostrandoNuevoProtocolo && (
        <RMMFields
        rmm={rmm}
        setRmm={setRmm}
        readOnlyFecha={rmmReadOnly}
        validationErrors={validationErrors}
      />
      )}

      {/* Botones */}
      <div className="grid grid-cols-3 m-3 gap-4">
        <button
          type="button"
          onClick={() => onGuardarAdeudo(rmm)}
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