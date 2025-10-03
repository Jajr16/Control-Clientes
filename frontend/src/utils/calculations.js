export const obtenerDatosCalculados = (
  empresaCif,
  adeudos,
  honorariosSinIVA = 0,
  empresasDisponibles = [],
  anticipoOverride = null
) => {
  const adeudosFiltrados = (Array.isArray(adeudos) ? adeudos : []).filter(a => {
    const esDeEmpresa =
      String(a?.empresa_cif || '').trim().toLowerCase() === String(empresaCif || '').trim().toLowerCase();
    const estado = String(a?.estado || '').toLowerCase();
    const numLiq = a?.num_liquidacion;
    const esPendiente = estado === 'pendiente' || (!numLiq && estado !== 'liquidado');
    return esDeEmpresa && esPendiente;
  });

  const empresaNombre = empresasDisponibles.find(e => e.cif === empresaCif)?.nombre || empresaCif;

  const totalImporte         = adeudosFiltrados.reduce((acc, a) => acc + Number(a?.importe   || 0), 0);
  const totalIVA             = adeudosFiltrados.reduce((acc, a) => acc + Number(a?.iva       || 0), 0);
  const totalRetencion       = adeudosFiltrados.reduce((acc, a) => acc + Number(a?.retencion || 0), 0);
  const totalConceptosSinIVA = adeudosFiltrados.reduce((acc, a) => acc + Number(a?.cs_iva    || 0), 0);
  const totalFacturas        = adeudosFiltrados.reduce((acc, a) => acc + Number(a?.total     || 0), 0);

  const honorariosBase   = Number(honorariosSinIVA || 0);
  const honorariosConIVA = honorariosBase * 1.21;

  // SIEMPRE usar el override si existe, nunca buscar en las filas
  const anticipo = anticipoOverride != null ? Number(anticipoOverride) : 0;

  let adeudoPendiente = totalFacturas + honorariosConIVA - anticipo;
  if (adeudoPendiente < 0) adeudoPendiente = 0;

  const fechas = adeudosFiltrados
    .map(a => new Date(a.ff))
    .filter(f => !isNaN(f.getTime()))
    .sort((a, b) => a - b);

  return {
    adeudosFiltrados,
    empresaNombre,
    totalImporte,
    totalIVA,
    totalRetencion,
    totalConceptosSinIVA,
    totalFacturas,
    honorariosSinIVA: honorariosBase,
    honorariosConIVA,
    anticipo,
    adeudoPendiente,
    fechas,
    fechaDesde: fechas[0] || null,
    fechaHasta: fechas[fechas.length - 1] || null
  };
};

// Función para formatear fechas
export const formatearFecha = (fecha) => {
  const meses = [
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
  ];
  return `${fecha.getDate()} de ${meses[fecha.getMonth()]} de ${fecha.getFullYear()}`;
};

// Validaciones
export const validarCampos = (empresa, camposRequeridos) => {
  for (const campo of camposRequeridos) {
    const valor = empresa[campo];
    if (valor === undefined || valor === "" || (typeof valor === "number" && isNaN(valor))) {
      alert(`El campo "${campo}" es obligatorio.`);
      return false;
    }
  }
  return true;
};

// Función mejorada para verificar si se puede generar liquidación
export const puedeGenerarLiquidacion = (empresaCif, adeudosList) => {
  if (!empresaCif) return false;
  
  const adeudosEmpresa = adeudosList.filter(a => a.empresa_cif === empresaCif);
  if (adeudosEmpresa.length === 0) return false;
  
  // Contar adeudos que realmente están pendientes
  const adeudosPendientes = adeudosEmpresa.filter(a => 
    !a.num_liquidacion && a.estado !== 'LIQUIDADO'
  );
  
  return adeudosPendientes.length > 0;
};