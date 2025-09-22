// Normaliza cualquier respuesta para obtener SIEMPRE un array de adeudos
export const toArray = (x) =>
  Array.isArray(x)
    ? x
    : (x && Array.isArray(x.adeudos) ? x.adeudos : []);

// Función para obtener datos calculados
export const obtenerDatosCalculados = (empresaCif, adeudos, honorariosSinIVA = 0, empresasDisponibles = []) => {
  // Filtrar solo adeudos de la empresa y que estén pendientes
  const adeudosFiltrados = adeudos.filter(a => 
    a.empresa_cif === empresaCif && 
    (!a.num_liquidacion || a.estado === 'PENDIENTE')
  );
  
  const empresaNombre = empresasDisponibles.find(e => e.cif === empresaCif)?.nombre || empresaCif;
  
  // Calcular totales
  const totalImporte = adeudosFiltrados.reduce((acc, a) => acc + Number(a.importe || 0), 0);
  const totalIVA = adeudosFiltrados.reduce((acc, a) => acc + Number(a.iva || 0), 0);
  const totalRetencion = adeudosFiltrados.reduce((acc, a) => acc + Number(a.retencion || 0), 0);
  const totalConceptosSinIVA = adeudosFiltrados.reduce((acc, a) => acc + Number(a.cs_iva || 0), 0);
  const totalFacturas = adeudosFiltrados.reduce((acc, a) => acc + Number(a.total || 0), 0);
  
  // Honorarios
  const honorariosConIVA = Number(honorariosSinIVA || 0) * 1.21;
  const anticipo = Number(adeudosFiltrados[0]?.anticipo || 0);
  
  // Adeudo pendiente
  const adeudoPendiente = totalFacturas + honorariosConIVA - anticipo;

  // Fechas
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
    honorariosSinIVA: Number(honorariosSinIVA || 0),
    honorariosConIVA,
    anticipo,
    adeudoPendiente,
    fechas,
    fechaDesde: fechas.length > 0 ? fechas[0] : null,
    fechaHasta: fechas.length > 0 ? fechas[fechas.length - 1] : null
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