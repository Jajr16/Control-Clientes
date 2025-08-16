export const toNum = (v) => (v == null || v === '' ? 0 : Number(v));

export const normalizeAdeudoForPdf = (a) => {
  const rawFecha = a.ff ?? a.fecha ?? null;
  const date = rawFecha ? new Date(rawFecha) : null;

  return {
    ...a,
    ff: rawFecha,
    fecha_str: date && !isNaN(date) ? date.toLocaleDateString('es-ES') : '',
    num_factura: a.num_factura ?? a.numfactura ?? a.num ?? '',
    protocolo_entrada: a.protocolo_entrada ?? a.protocolo ?? a.protocoloentrada ?? '',
    importe: toNum(a.importe),
    iva: toNum(a.iva),
    retencion: toNum(a.retencion),
    cs_iva: toNum(a.cs_iva ?? a.csiniva),
    total: toNum(a.total),
    estado: (a.estado || a.Estado || a.ESTADO || '').toUpperCase(),
    num_liquidacion: a.num_liquidacion ?? a.numeroLiquidacion ?? a.liquidacion ?? null,
  };
};

export const matchEmpresa = (empresaCif) => (a) => {
  const cif = a?.empresa_cif ?? a?.cif ?? a?.empresaCif ?? a?.empresa;
  if (!empresaCif) return false;
  if (!cif) return true;
  return String(cif).trim().toLowerCase() === String(empresaCif).trim().toLowerCase();
};

export const isPendiente = (a) => {
  const estado = (a?.estado || a?.Estado || a?.ESTADO || "").toLowerCase();
  const rawNum = a?.num_liquidacion ?? a?.numeroLiquidacion ?? a?.liquidacion;
  const tieneNum = rawNum !== null && rawNum !== undefined && String(rawNum).trim() !== "";
  const numOk = tieneNum && !isNaN(Number(rawNum)) && Number(rawNum) > 0;
  return estado === "pendiente" || (!numOk && estado !== "liquidado");
};
