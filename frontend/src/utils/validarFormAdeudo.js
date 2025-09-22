import { VALIDACIONES_FORMULARIO } from './mensajesSistema';

export const esNumero = (valor) => /^\d+$/.test(valor) || /^\d+(\.\d+)?$/.test(valor); // admite enteros y decimales

export const validarAdeudo = (adeudoData) => {
    const errors = [];

    if (!adeudoData.concepto)
        errors.push({ field: "concepto", message: VALIDACIONES_FORMULARIO.REQUERIDO("Concepto") });

    if (!adeudoData.proveedor)
        errors.push({ field: "proveedor", message: VALIDACIONES_FORMULARIO.REQUERIDO("Proveedor") });

    if (!adeudoData.ff)
        errors.push({ field: "ff", message: VALIDACIONES_FORMULARIO.REQUERIDO("Fecha de factura") });

    if (!adeudoData.num_factura)
        errors.push({ field: "num_factura", message: VALIDACIONES_FORMULARIO.REQUERIDO("Número de factura") });

    if (!adeudoData.num_protocolo)
        errors.push({ field: "num_protocolo", message: VALIDACIONES_FORMULARIO.REQUERIDO("Protocolo / Entrada") });

    // Validación de campos numéricos
    const camposNumericos = [
        { campo: "importe", nombre: "Importe" },
        { campo: "iva", nombre: "IVA" },
        { campo: "retencion", nombre: "Retención" },
        { campo: "csiniva", nombre: "Conceptos sin IVA" },
        { campo: "total", nombre: "Total" },
        { campo: "anticipocliente", nombre: "Anticipo por el cliente" },
        // { campo: "honorarios", nombre: "Honorarios Finatech (IVA incluido)" }
    ];

    camposNumericos.forEach(({ campo, nombre }) => {
        if (adeudoData[campo] === undefined || adeudoData[campo] === "") {
            errors.push({ field: campo, message: VALIDACIONES_FORMULARIO.REQUERIDO(nombre) });
        } else if (!esNumero(adeudoData[campo])) {
            errors.push({ field: campo, message: VALIDACIONES_FORMULARIO.NUMBER(nombre) });
        }
    });

    return errors;
};
