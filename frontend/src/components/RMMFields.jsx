// src/components/RMMFields.jsx
import React from "react";
import FormInput from "./Forminput.jsx";

/**
 * Props:
 * - rmm: {
 *     num_entrada: string,
 *     empresa_cif: string,
 *     fecha_anticipo: string,          // yyyy-mm-dd
 *     ff: string,                      
 *     diferencia: number | "" ,
 *     fecha_devolucion_diferencia: string | "",
 *     num_factura_final: string | ""
 *   }
 * - setRmm: React.Dispatch<...>
 * - validationErrors: Record<string, string>
 * - readOnlyFecha: boolean  // bloquea fecha_anticipo si viene de histórico (opcional)
 */
const RMMFields = ({ rmm, setRmm, validationErrors = {}, readOnlyFecha = false }) => {
  const getErr = (k) => validationErrors[k];

  const onChange = (e) => {
    const { name, value } = e.target;
    const numericFields = ["diferencia"];
    let v = value;
    if (numericFields.includes(name)) v = value === "" ? "" : Number(value);
    setRmm((prev) => ({ ...prev, [name]: v }));
  };

  const diferenciaPositiva = Number(rmm?.diferencia || 0) > 0;

  return (
    <div className="m-3 p-3 border rounded-md bg-gray-50">
      <h3 className="font-semibold mb-2">Datos de Registro Mercantil de Madrid</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* num_entrada */}
        <FormInput
          label="Número de entrada (protocolo)"
          name="num_entrada"
          value={rmm.num_entrada || ""}
          onChange={onChange}
          readOnly
          title="Se toma del protocolo/entrada seleccionado"
          error={getErr("num_entrada")}
        />

        {/* empresa_cif */}
        <FormInput
          label="Empresa CIF"
          name="empresa_cif"
          value={rmm.empresa_cif || ""}
          onChange={onChange}
          readOnly
          error={getErr("empresa_cif")}
        />

        {/* fecha_anticipo (se puede dejar readOnly si viene de histórico) */}
        <FormInput
          label="Fecha de anticipo"
          name="fecha_anticipo"
          type="date"
          value={rmm.fecha_anticipo || ""}
          onChange={onChange}
          readOnly={readOnlyFecha}
          error={getErr("fecha_anticipo")}
        />

        {/* 👇 NUEVO: Fecha de la factura (obligatoria) */}
        <FormInput
          label="Fecha de la factura"
          name="ff"
          type="date"
          value={rmm.ff || ""}
          onChange={onChange}
          required
          error={getErr("ff")}
        />

        {/* diferencia */}
        <FormInput
          label="Diferencia"
          name="diferencia"
          type="number"
          value={rmm.diferencia === 0 ? 0 : (rmm.diferencia || "")}
          onChange={onChange}
          step="0.01"
          min="0"
          required={false}
          error={getErr("diferencia")}
        />

        {/* fecha_devolucion_diferencia (requerida si diferencia > 0) */}
        <FormInput
          label="Fecha devolución/cobro diferencia"
          name="fecha_devolucion_diferencia"
          type="date"
          value={rmm.fecha_devolucion_diferencia || ""}
          onChange={onChange}
          required={diferenciaPositiva}
          error={getErr("fecha_devolucion_diferencia")}
        />

        {/* num_factura_final (obligatorio y editable) */}
        <FormInput
          label="Número de factura final"
          name="num_factura_final"
          value={rmm.num_factura_final || ""}
          onChange={onChange}
          maxLength={50}
          required
          error={getErr("num_factura_final")}
        />
      </div>
    </div>
  );
};

export default RMMFields;
