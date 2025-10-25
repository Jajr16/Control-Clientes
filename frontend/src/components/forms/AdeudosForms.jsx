import React from 'react';
import { useAdeudos } from "../../hooks/useAdeudos";
import PrincipalView from "../views/PrincipalView";
import BorradorView from "../views/BorradorView";
import LiquidacionView from "../views/LiquidacionView";

const AdeudosForm = ({
  empresa, setEmpresa,
  adeudosGuardados, setAdeudosGuardados,
  validationErrors = {},
  empresasDisponibles = [],
  mostrarVistaPrevia, setVistaPrevia,
  anticipo
}) => {
  const h = useAdeudos({ empresa, setEmpresa, adeudosGuardados, setAdeudosGuardados, setVistaPrevia });

  // CORRECCIÓN: Extraer anticipo_original o usar el número directamente
  const anticipoOriginal = React.useMemo(() => {
    if (typeof anticipo === 'number') {
      console.warn('ANTICIPO LLEGÓ COMO NÚMERO, debería ser un objeto con anticipo_original');
      return anticipo; // Usar el número directamente como fallback
    }
    return anticipo?.anticipo_original ?? anticipo?.anticipo_para_pdf ?? 0;
  }, [anticipo]);

  // NUEVO: estado local para los campos de entrada_rmm (frontend)
  const [rmm, setRmm] = React.useState({
    num_entrada: "",
    empresa_cif: empresa?.empresa_cif || "",
    anticipo_pagado: 200,
    fecha_anticipo: "",
    diferencia: "",
    fecha_devolucion_diferencia: "",
    num_factura_final: ""
  });

  React.useEffect(() => {
    if (!h.rmmDatos) return;
    setRmm(prev => ({
      ...prev,
      num_entrada: h.rmmDatos.num_entrada || prev.num_entrada,
      empresa_cif: h.rmmDatos.empresa_cif || prev.empresa_cif,
      // fecha_anticipo viene de BD y debe estar bloqueada (readOnly)
      fecha_anticipo: h.rmmDatos.fecha_anticipo || prev.fecha_anticipo,
      // diferencia / fecha_devolucion_diferencia si ya existen:
      diferencia: (h.rmmDatos.diferencia ?? prev.diferencia ?? ''),
      fecha_devolucion_diferencia: (h.rmmDatos.fecha_devolucion_diferencia || prev.fecha_devolucion_diferencia || ''),
      // num_factura_final y ff los introduce el usuario ahora
    }));
  }, [h.rmmDatos]);

  if (h.vistaActual === 'borrador') {
    return (
      <BorradorView
        empresaSeleccionada={h.empresaSeleccionadaBorrador}
        setEmpresaSeleccionada={h.setEmpresaSeleccionadaBorrador}
        empresasDisponibles={empresasDisponibles}
        adeudosList={h.adeudosList}
        mostrarVistaPreviaPdf={h.mostrarVistaPreviaPdf}
        setMostrarVistaPreviaPdf={h.setMostrarVistaPreviaPdf}
        onGenerarPdf={h.handleGenerarPdfBorrador}
        onVolver={h.volverFormularioPrincipal}
        onConfirmarDescarga={h.confirmarDescargaPdf}
        anticipo={{ anticipo_original: anticipoOriginal }}
      />
    );
  }

  if (h.vistaActual === 'liquidacion') {
    return (
      <LiquidacionView
        empresaSeleccionada={h.empresaSeleccionadaLiquidacion}
        setEmpresaSeleccionada={h.setEmpresaSeleccionadaLiquidacion}
        empresasDisponibles={empresasDisponibles}
        adeudosList={h.adeudosList}
        honorariosSinIVA={h.honorariosSinIVA}
        setHonorariosSinIVA={h.setHonorariosSinIVA}
        mostrarVistaPreviaPdf={h.mostrarVistaPreviaPdf}
        setMostrarVistaPreviaPdf={h.setMostrarVistaPreviaPdf}
        onVerPrevia={h.handleVerPreviaLiquidacion}
        onVolver={h.volverFormularioPrincipal}
        onConfirmarDescarga={h.confirmarDescargaPdf}
        anticipo={{ anticipo_original: anticipoOriginal }}
      />
    );
  }
  console.log('🔍 DEBUG AdeudosForm antes de PrincipalView:', {
  'h.protocolosDisponibles': h.protocolosDisponibles,
  'h.adeudosList.length': h.adeudosList.length,
  'empresa.empresa_cif': empresa.empresa_cif,
  'empresa.proveedor': empresa.proveedor
});
  return (
    <PrincipalView
      empresa={empresa}
      empresasDisponibles={empresasDisponibles}
      adeudosList={h.adeudosList}
      estadoAdeudos={h.estadoAdeudos}
      mostrarVistaPrevia={mostrarVistaPrevia}
      importeBloqueado={h.importeBloqueado}
      validationErrors={validationErrors}
      anticipo={anticipo}
      onChange={(e)=>{
        const { name, value } = e.target;
        const camposNum = ["importe","csiniva","anticipocliente"];
        const parsed = camposNum.includes(name) ? (value === "" ? "" : parseFloat(value)) : value;

        setEmpresa(prev => {
          let updated = { ...prev, [name]: parsed };
          if (name === "proveedor" && typeof parsed === 'string' &&
              /registro\s*mercantil.*madrid/i.test(parsed)) {
            // Defaults para RMM
            updated.importe = 200;
            updated.csiniva = 0;
            // Concepto fijo en RMM
            updated.concepto = "Inscripción Registro Mercantil";
          }
          const isRMM = (p) => /registro\s*mercantil.*madrid/i.test(p || '');
          const esRMM = isRMM(empresa.proveedor);          
          const importe = parseFloat(updated.importe) || 0;
          const csiniva = esRMM ? 0 : parseFloat(updated.csiniva) || 0;
          const anticipo_cliente = parseFloat(anticipo) || 0;
          const iva = esRMM ? 0 : +(importe * 0.21).toFixed(2);
          const retencion = esRMM ? 0 : +(importe * 0.15).toFixed(2);
          const total = +(importe + iva - retencion + csiniva).toFixed(2);
          return {
            ...updated,
            iva,
            retencion,
            total,
            total_adeudos: total,
            adeudo_pendiente: +(total - anticipo_cliente).toFixed(2)
          };
        });

        if (name === "empresa_cif" && parsed) h.fetchAdeudos(parsed);
      }}
      onGuardarAdeudo={(rmmState) => h.handleGuardarAdeudo(rmmState)}
      cargandoAdeudos={h.cargandoAdeudos}
      onGenerarBorrador={h.handleGenerarBorrador}
      onGenerarLiquidacion={h.handleGenerarLiquidacionClick}
      botonGuardarDeshabilitado={h.botonGuardarDeshabilitado}
      puedeGenerarLiquidacion={h.puedeGenerarLiquidacionLocal}
      protocolosDisponibles={h.protocolosDisponibles}
      prefillDesdeProtocolo={h.prefillDesdeProtocolo}
      rmmReadOnly={h.rmmReadOnly}
      rmmDatos={h.rmmDatos}
      registrarProtocoloLocal={h.registrarProtocoloLocal}
      rmm={rmm}
      setRmm={setRmm}
    />
  );
};

export default AdeudosForm;
