// src/components/RMMFields.jsx
import React, { useEffect } from "react";
import FormInput from "./Forminput.jsx";

/**
 * Props:
 * - rmm: {
 *     num_entrada: string,
 *     empresa_cif: string,
 *     fecha_anticipo: string,
 *     ff: string,
 *     base_imponible: number | "",      // NUEVO: Base que ingresa el usuario
 *     iva: number,                       // CALCULADO: base_imponible * 0.21
 *     retencion: number,                 // CALCULADO: base_imponible * 0.15
 *     cs_iva: number,                    // Conceptos sin IVA (normalmente 0 en RMM)
 *     total: number,                     // CALCULADO: base + iva - retencion + cs_iva
 *     diferencia: number | "",           // CALCULADO: total - 200
 *     fecha_devolucion_diferencia: string | "",
 *     num_factura_final: string | ""
 *   }
 * - setRmm: React.Dispatch<...>
 * - validationErrors: Record<string, string>
 * - readOnlyFecha: boolean
 */
const RMMFields = ({ rmm, setRmm, validationErrors = {}, readOnlyFecha = false }) => {
  const getErr = (k) => validationErrors[k];
  const ANTICIPO_RMM = 200; // Anticipo fijo para Registro Mercantil de Madrid

  // Calcular automáticamente cuando cambia la base imponible
  useEffect(() => {
    const baseImponible = parseFloat(rmm?.base_imponible || 0);
    const csIva = parseFloat(rmm?.cs_iva || 0);
    
    const iva = (baseImponible * 0.21);
    const retencion = (baseImponible * 0.15);
    const total = baseImponible + iva - retencion + csIva;
    const diferencia = ANTICIPO_RMM - total;  // 👈 CORREGIDO: Anticipo - Total

    setRmm((prev) => ({
      ...prev,
      iva: iva.toFixed(2),
      retencion: retencion.toFixed(2),
      total: total.toFixed(2),
      diferencia: diferencia.toFixed(2)
    }));
  }, [rmm?.base_imponible, rmm?.cs_iva, setRmm]);

  const onChange = (e) => {
    const { name, value } = e.target;
    
    // Para campos numéricos
    if (name === "base_imponible" || name === "cs_iva") {
      const numValue = value === "" ? "" : parseFloat(value);
      setRmm((prev) => ({ ...prev, [name]: numValue }));
    } else {
      setRmm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const diferenciaNum = parseFloat(rmm?.diferencia || 0);
  const totalNum = parseFloat(rmm?.total || 0);
  const ivaNum = parseFloat(rmm?.iva || 0);
  const retencionNum = parseFloat(rmm?.retencion || 0);

  return (
    <div className="m-3 p-3 border rounded-md bg-blue-50">
      <h3 className="font-semibold mb-3 text-blue-900">
        Datos de Registro Mercantil de Madrid
      </h3>

      {/* Fila 1: Datos básicos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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

        {/* fecha_anticipo */}
        <FormInput
          label="Fecha de anticipo"
          name="fecha_anticipo"
          type="date"
          value={rmm.fecha_anticipo || ""}
          onChange={onChange}
          readOnly={readOnlyFecha}
          error={getErr("fecha_anticipo")}
        />
      </div>

      {/* Fila 2: Cálculos financieros */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
        {/* Base Imponible - EDITABLE */}
        <FormInput
          label="Base Imponible"
          name="base_imponible"
          type="number"
          value={rmm.base_imponible === 0 ? 0 : (rmm.base_imponible || "")}
          onChange={onChange}
          step="0.01"
          min="0"
          placeholder="0.00"
          required
          error={getErr("base_imponible")}
        />

        {/* IVA - CALCULADO (21%) */}
        <div className="flex flex-col">
          <label className="block text-sm font-medium mb-1">
            IVA (21%):
          </label>
          <input
            type="text"
            value={`${ivaNum.toFixed(2)} €`}
            readOnly
            className="w-full px-3 py-2 border rounded-md bg-gray-50 text-gray-700"
            title="Calculado: Base Imponible × 0.21"
          />
        </div>

        {/* Retención - CALCULADO (15%) */}
        <div className="flex flex-col">
          <label className="block text-sm font-medium mb-1">
            Retención (15%):
          </label>
          <input
            type="text"
            value={`${retencionNum.toFixed(2)} €`}
            readOnly
            className="w-full px-3 py-2 border rounded-md bg-gray-50 text-gray-700"
            title="Calculado: Base Imponible × 0.15"
          />
        </div>

        {/* Conceptos sin IVA - EDITABLE */}
        <FormInput
          label="Conceptos sin IVA"
          name="cs_iva"
          type="number"
          value={rmm.cs_iva === 0 ? 0 : (rmm.cs_iva || "")}
          onChange={onChange}
          step="0.01"
          min="0"
          placeholder="0.00"
          required={false}
          error={getErr("cs_iva")}
        />

        {/* Total - CALCULADO */}
        <div className="flex flex-col">
          <label className="block text-sm font-medium mb-1">
            Total:
          </label>
          <input
            type="text"
            value={`${totalNum.toFixed(2)} €`}
            readOnly
            className="w-full px-3 py-2 border rounded-md bg-blue-100 text-blue-900 font-semibold"
            title="Base + IVA - Retención + Cs.IVA"
          />
          <span className="text-xs text-gray-600 mt-1">
            Base + IVA - Retención
          </span>
        </div>
      </div>

      {/* Fila 3: Anticipo y Diferencia */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Anticipo RMM - FIJO 200€ */}
        <div className="flex flex-col">
          <label className="block text-sm font-medium mb-1">
            Anticipo RMM (fijo):
          </label>
          <input
            type="text"
            value="200.00 €"
            readOnly
            className="w-full px-3 py-2 border rounded-md bg-gray-100 text-gray-600 font-semibold"
            title="Anticipo fijo para Registro Mercantil de Madrid"
          />
          <span className="text-xs text-blue-600 mt-1">
            Anticipo fijo para RMM
          </span>
        </div>

        {/* Diferencia - CALCULADO (200€ - Total) */}
        <div className="flex flex-col">
          <label className="block text-sm font-medium mb-1">
            Diferencia (200€ - Total):
          </label>
          <input
            type="text"
            value={`${diferenciaNum.toFixed(2)} €`}
            readOnly
            className={`w-full px-3 py-2 border-2 rounded-md font-bold ${
              diferenciaNum < 0 
                ? 'bg-red-50 text-red-700 border-red-400' 
                : diferenciaNum > 0
                ? 'bg-green-50 text-green-700 border-green-400'
                : 'bg-gray-100 text-gray-700 border-gray-300'
            }`}
            title="Calculado: 200€ - Total"
          />
          <span className={`text-xs mt-1 font-medium ${
            diferenciaNum < 0 ? 'text-red-600' : diferenciaNum > 0 ? 'text-green-600' : 'text-gray-600'
          }`}>
            {diferenciaNum < 0 
              ? `⚠️ Cliente debe ${Math.abs(diferenciaNum).toFixed(2)}€` 
              : diferenciaNum > 0
              ? `✓ Devolver ${diferenciaNum.toFixed(2)}€`
              : '✓ Sin diferencia'}
          </span>
        </div>

        {/* Fecha devolución/cobro - Solo si hay diferencia */}
        {diferenciaNum !== 0 && (
          <FormInput
            label={diferenciaNum < 0 ? "Fecha devolución" : "Fecha cobro diferencia"}
            name="fecha_devolucion_diferencia"
            type="date"
            value={rmm.fecha_devolucion_diferencia || ""}
            onChange={onChange}
            required={diferenciaNum !== 0}
            error={getErr("fecha_devolucion_diferencia")}
          />
        )}
      </div>

      {/* Fila 4: Factura final */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Número de factura final */}
        <FormInput
          label="Número de factura final"
          name="num_factura_final"
          value={rmm.num_factura_final || ""}
          onChange={onChange}
          maxLength={50}
          required
          error={getErr("num_factura_final")}
        />

        {/* Fecha de la factura */}
        <FormInput
          label="Fecha de la factura"
          name="ff"
          type="date"
          value={rmm.ff || ""}
          onChange={onChange}
          required
          error={getErr("ff")}
        />
      </div>

      {/* Caja informativa con el cálculo */}
      <div className="mt-4 p-3 bg-blue-100 border border-blue-300 rounded text-sm">
        <div className="font-semibold mb-2">ℹ️ Cálculo automático:</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
          <div>
            <strong>Total:</strong> Base ({(parseFloat(rmm?.base_imponible || 0)).toFixed(2)}€) + 
            IVA ({ivaNum.toFixed(2)}€) - 
            Retención ({retencionNum.toFixed(2)}€) = 
            <strong className="text-blue-700"> {totalNum.toFixed(2)}€</strong>
          </div>
          <div>
            <strong>Diferencia:</strong> Anticipo (200.00€) - 
            Total ({totalNum.toFixed(2)}€) = 
            <strong className={diferenciaNum < 0 ? 'text-red-700' : diferenciaNum > 0 ? 'text-green-700' : ''}>
              {' '}{diferenciaNum.toFixed(2)}€
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RMMFields;