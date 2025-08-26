import { useAdeudos } from "../../hooks/useAdeudos";
import PrincipalView from "../views/PrincipalView";
import BorradorView from "../views/BorradorView";
import LiquidacionView from "../views/LiquidacionView";

const AdeudosForm = ({
  empresa, setEmpresa,
  adeudosGuardados, setAdeudosGuardados,
  validationErrors = {},
  empresasDisponibles = [],
  mostrarVistaPrevia, setVistaPrevia
}) => {

  const h = useAdeudos({ empresa, setEmpresa, adeudosGuardados, setAdeudosGuardados, setVistaPrevia });  

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
      />
    );
  }

  return (
    <PrincipalView
      empresa={empresa}
      empresasDisponibles={empresasDisponibles}
      adeudosList={h.adeudosList}
      estadoAdeudos={h.estadoAdeudos}
      mostrarVistaPrevia={mostrarVistaPrevia}
      importeBloqueado={h.importeBloqueado}
      validationErrors={validationErrors}
      onChange={(e)=>{
        const { name, value } = e.target;
        // Reutiliza tu lógica anterior para calcular iva/retencion/total:
        const camposNum = ["importe","csiniva","anticipocliente"];
        const parsed = camposNum.includes(name) ? (value === "" ? "" : parseFloat(value)) : value;

        setEmpresa(prev => {
          let updated = { ...prev, [name]: parsed };
          if (name === "concepto" && parsed === "Registro Mercantil de Madrid") {
            updated.importe = 200;
          }
          const importe = parseFloat(updated.importe) || 0;
          const csiniva = parseFloat(updated.csiniva) || 0;
          const anticipo_cliente = parseFloat(updated.anticipocliente) || 0;
          const iva = +(importe * 0.21).toFixed(2);
          const retencion = +(importe * 0.15).toFixed(2);
          const total = +(importe + iva - retencion + csiniva).toFixed(2);
          return { ...updated, iva, retencion, total, total_adeudos: total, adeudo_pendiente: +(total - anticipo_cliente).toFixed(2) };
        });

        if (name === "empresa_cif" && parsed) h.fetchAdeudos(parsed);
      }}
      onGuardarAdeudo={h.handleGuardarAdeudo}
      cargandoAdeudos={h.cargandoAdeudos}
      onGenerarBorrador={h.handleGenerarBorrador}
      onGenerarLiquidacion={h.handleGenerarLiquidacionClick}
      botonGuardarDeshabilitado={h.botonGuardarDeshabilitado}
      puedeGenerarLiquidacion={h.puedeGenerarLiquidacionLocal}
    />
  );
};

export default AdeudosForm;
