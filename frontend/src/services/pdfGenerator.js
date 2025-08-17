import * as pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from "pdfmake/build/vfs_fonts";
pdfMake.vfs = pdfFonts.vfs;

import { obtenerDatosCalculados, formatearFecha } from '../utils/calculations';

// --- helpers locales ---
const toNum = (v) => (v == null || v === '' ? 0 : Number(v));
const normalizeItems = (src) => {
  if (Array.isArray(src)) return src;
  if (Array.isArray(src?.adeudos)) return src.adeudos;
  if (Array.isArray(src?.detalle)) return src.detalle;
  if (Array.isArray(src?.data)) return src.data;
  return [];
};


export const pdfGenerator = {
  // Generar PDF de borrador
 generarPdfBorrador(empresaCif, adeudos, empresasDisponibles = []) {
  // usa exactamente lo que te pasan desde la UI
  const items = normalizeItems(adeudos);

  // usamos la utilidad solo para nombre/periodo, pero
  // forzamos qué filas y totales se usarán en el PDF
  const base = obtenerDatosCalculados(empresaCif, items, 0, empresasDisponibles);

  // totales re-calculados con 'items'
  const totalImporte   = items.reduce((a, x) => a + toNum(x.importe),   0);
  const totalIVA       = items.reduce((a, x) => a + toNum(x.iva),       0);
  const totalRetencion = items.reduce((a, x) => a + toNum(x.retencion), 0);
  const totalFacturas  = items.reduce((a, x) => a + toNum(x.total),     0);

  const anticipo = toNum(items[0]?.anticipo);

  // fechas visibles (con lo mismo que mostramos)
  const fechas = items
    .map(a => new Date(a.ff))
    .filter(d => !isNaN(d.getTime()))
    .sort((a,b) => a - b);
  const fechaDesde = fechas[0] || null;
  const fechaHasta = fechas[fechas.length - 1] || null;

  // tabla
  const tabla = [
    [
      { text: "Fecha", style: 'tableHeader', fillColor: '#3B82F6' },
      { text: "Concepto", style: 'tableHeader', fillColor: '#3B82F6' },
      { text: "Proveedor", style: 'tableHeader', fillColor: '#3B82F6' },
      { text: "N° Factura", style: 'tableHeader', fillColor: '#3B82F6' },
      { text: "Importe (€)", style: 'tableHeader', alignment: 'right', fillColor: '#3B82F6' },
      { text: "IVA (€)", style: 'tableHeader', alignment: 'right', fillColor: '#3B82F6' },
      { text: "Retención (€)", style: 'tableHeader', alignment: 'right', fillColor: '#3B82F6' },
      { text: "Total (€)", style: 'tableHeader', alignment: 'right', fillColor: '#3B82F6' }
    ],
    ...items.map((a) => [
      { text: a.ff ? new Date(a.ff).toLocaleDateString('es-ES') : "—", style: 'tableCell' },
      { text: a.concepto || "—", style: 'tableCell' },
      { text: a.proveedor || "—", style: 'tableCell' },
      { text: a.num_factura || a.numfactura || "—", style: 'tableCell' },
      { text: toNum(a.importe).toLocaleString('es-ES', {minimumFractionDigits: 2}), style: 'tableCell', alignment: 'right' },
      { text: toNum(a.iva).toLocaleString('es-ES', {minimumFractionDigits: 2}), style: 'tableCell', alignment: 'right' },
      { text: toNum(a.retencion).toLocaleString('es-ES', {minimumFractionDigits: 2}), style: 'tableCell', alignment: 'right' },
      { text: toNum(a.total).toLocaleString('es-ES', {minimumFractionDigits: 2}), style: 'tableCell', alignment: 'right', bold: true }
    ])
  ];

  tabla.push([
    { text: "SUBTOTALES", colSpan: 4, alignment: "right", style: 'tableTotals', fillColor: '#F3F4F6' },
    {}, {}, {},
    { text: totalImporte.toLocaleString('es-ES', {minimumFractionDigits: 2}), style: 'tableTotals', alignment: 'right', fillColor: '#F3F4F6' },
    { text: totalIVA.toLocaleString('es-ES', {minimumFractionDigits: 2}), style: 'tableTotals', alignment: 'right', fillColor: '#F3F4F6' },
    { text: totalRetencion.toLocaleString('es-ES', {minimumFractionDigits: 2}), style: 'tableTotals', alignment: 'right', fillColor: '#F3F4F6' },
    { text: totalFacturas.toLocaleString('es-ES', {minimumFractionDigits: 2}), style: 'tableTotals', alignment: 'right', fillColor: '#F3F4F6' }
  ]);

  const datos = {
    ...base,
    // 👇 Forzamos lo que usa _createDocumentDefinition
    adeudosFiltrados: items,
    totalImporte,
    totalIVA,
    totalRetencion,
    totalFacturas,
    anticipo,
    fechaDesde,
    fechaHasta,
    honorariosSinIVA: 0,
    honorariosConIVA: 0,
    adeudoPendiente: totalFacturas - anticipo,
  };

  const docDefinition = this._createDocumentDefinition({
    title: "BORRADOR DE LIQUIDACIÓN DE ADEUDOS",
    datos,
    empresaCif,
    tabla,
    tipo: 'borrador'
  });

  pdfMake.createPdf(docDefinition).download(
    `borrador_liquidacion_${datos.empresaNombre}_${new Date().toISOString().split('T')[0]}.pdf`
  );
},


  // Generar PDF de liquidación final
  generarPdfLiquidacionFinal(empresaCif, adeudos, honorariosSinIVA, numeroLiquidacion, empresasDisponibles = []) {
  const items = normalizeItems(adeudos);

  const base = obtenerDatosCalculados(empresaCif, items, honorariosSinIVA, empresasDisponibles);

  const totalImporte   = items.reduce((a, x) => a + toNum(x.importe),   0);
  const totalIVA       = items.reduce((a, x) => a + toNum(x.iva),       0);
  const totalRetencion = items.reduce((a, x) => a + toNum(x.retencion), 0);
  const totalFacturas  = items.reduce((a, x) => a + toNum(x.total),     0);

  const anticipo = toNum(items[0]?.anticipo);

  const honorariosBase = toNum(honorariosSinIVA);
  const honorariosIVA  = honorariosBase * 0.21;
  const honorariosTot  = honorariosBase + honorariosIVA;

  const fechas = items
    .map(a => new Date(a.ff))
    .filter(d => !isNaN(d.getTime()))
    .sort((a,b) => a - b);
  const fechaDesde = fechas[0] || null;
  const fechaHasta = fechas[fechas.length - 1] || null;

  const tabla = [
    [
      { text: "Fecha", style: 'tableHeader', fillColor: '#059669' },
      { text: "Concepto", style: 'tableHeader', fillColor: '#059669' },
      { text: "Proveedor", style: 'tableHeader', fillColor: '#059669' },
      { text: "N° Factura", style: 'tableHeader', fillColor: '#059669' },
      { text: "Importe (€)", style: 'tableHeader', alignment: 'right', fillColor: '#059669' },
      { text: "IVA (€)", style: 'tableHeader', alignment: 'right', fillColor: '#059669' },
      { text: "Retención (€)", style: 'tableHeader', alignment: 'right', fillColor: '#059669' },
      { text: "Total (€)", style: 'tableHeader', alignment: 'right', fillColor: '#059669' }
    ],
    ...items.map((a) => [
      { text: a.ff ? new Date(a.ff).toLocaleDateString('es-ES') : "—", style: 'tableCell' },
      { text: a.concepto || "—", style: 'tableCell' },
      { text: a.proveedor || "—", style: 'tableCell' },
      { text: a.num_factura || a.numfactura || "—", style: 'tableCell' },
      { text: toNum(a.importe).toLocaleString('es-ES', {minimumFractionDigits: 2}), style: 'tableCell', alignment: 'right' },
      { text: toNum(a.iva).toLocaleString('es-ES', {minimumFractionDigits: 2}), style: 'tableCell', alignment: 'right' },
      { text: toNum(a.retencion).toLocaleString('es-ES', {minimumFractionDigits: 2}), style: 'tableCell', alignment: 'right' },
      { text: toNum(a.total).toLocaleString('es-ES', {minimumFractionDigits: 2}), style: 'tableCell', alignment: 'right', bold: true }
    ])
  ];

  tabla.push([
    { text: "SUBTOTALES", colSpan: 4, alignment: "right", style: 'tableTotals', fillColor: '#F3F4F6' },
    {}, {}, {},
    { text: totalImporte.toLocaleString('es-ES', {minimumFractionDigits: 2}), style: 'tableTotals', alignment: 'right', fillColor: '#F3F4F6' },
    { text: totalIVA.toLocaleString('es-ES', {minimumFractionDigits: 2}), style: 'tableTotals', alignment: 'right', fillColor: '#F3F4F6' },
    { text: totalRetencion.toLocaleString('es-ES', {minimumFractionDigits: 2}), style: 'tableTotals', alignment: 'right', fillColor: '#F3F4F6' },
    { text: totalFacturas.toLocaleString('es-ES', {minimumFractionDigits: 2}), style: 'tableTotals', alignment: 'right', fillColor: '#F3F4F6' }
  ]);

  const datos = {
    ...base,
    adeudosFiltrados: items,
    totalImporte,
    totalIVA,
    totalRetencion,
    totalFacturas,
    anticipo,
    fechaDesde,
    fechaHasta,
    honorariosSinIVA: honorariosBase,
    honorariosConIVA: honorariosTot,
    adeudoPendiente: totalFacturas + honorariosTot - anticipo,
  };

  const docDefinition = this._createDocumentDefinition({
    title: `LIQUIDACIÓN FINAL DE ADEUDOS N° ${numeroLiquidacion}`,
    datos,
    empresaCif,
    tabla,
    tipo: 'liquidacion',
    numeroLiquidacion
  });

  pdfMake.createPdf(docDefinition).download(
    `liquidacion_final_${numeroLiquidacion}_${datos.empresaNombre}_${new Date().toISOString().split('T')[0]}.pdf`
  );
},


  // Método privado para crear la definición del documento
  _createDocumentDefinition({ title, datos, empresaCif, tabla, tipo, numeroLiquidacion }) {
    const isLiquidacion = tipo === 'liquidacion';
    const headerColor = isLiquidacion ? '#059669' : '#3B82F6';
    const fillColor = isLiquidacion ? '#F0FDF4' : '#F8FAFC';

    const content = [
      { text: title, style: "title", margin: [0, 0, 0, 10] },
      
      // Información de la empresa
      {
        columns: [
          {
            width: '50%',
            stack: [
              { text: `Empresa: ${datos.empresaNombre}`, style: 'infoText' },
              { text: `CIF: ${empresaCif}`, style: 'infoText' },
              { text: `Fecha de generación: ${new Date().toLocaleDateString('es-ES')}`, style: 'infoText' }
            ]
          },
          {
            width: '50%',
            stack: [
              ...(isLiquidacion && numeroLiquidacion ? [
                { text: `Liquidación N°: ${numeroLiquidacion}`, style: 'infoTextBold', alignment: 'right' }
              ] : []),
              { text: `Total registros: ${datos.adeudosFiltrados.length}`, style: 'infoText', alignment: 'right' },
              ...(datos.fechaDesde && datos.fechaHasta ? [{
                text: `Período: ${formatearFecha(datos.fechaDesde)} al ${formatearFecha(datos.fechaHasta)}`,
                style: 'infoText',
                alignment: 'right'
              }] : [])
            ]
          }
        ],
        margin: [0, 0, 0, 15]
      },

      // Tabla principal
      {
        table: {
          headerRows: 1,
          widths: ['10%', '25%', '15%', '12%', '12%', '9%', '9%', '8%'],
          body: tabla
        },
        layout: {
          fillColor: (rowIndex) => rowIndex === 0 ? headerColor : (rowIndex % 2 === 0 ? fillColor : null),
          hLineWidth: () => 0.5,
          vLineWidth: () => 0.5,
          hLineColor: () => isLiquidacion ? '#D1FAE5' : '#E2E8F0',
          vLineColor: () => isLiquidacion ? '#D1FAE5' : '#E2E8F0'
        },
        margin: [0, 0, 0, 15]
      }
    ];

    // Agregar sección de honorarios solo para liquidación
    if (isLiquidacion) {
      content.push(
        { text: "HONORARIOS FINATECH", style: "subtitle", margin: [0, 10, 0, 8] },
        {
          table: {
            widths: ['*', '15%'],
            body: [
              [
                { text: 'Base imponible:', style: 'honorariosLabel', border: [false, false, false, false] },
                { text: `${datos.honorariosSinIVA.toLocaleString('es-ES', {minimumFractionDigits: 2})} €`, style: 'honorariosValue', border: [false, false, false, false] }
              ],
              [
                { text: 'IVA (21%):', style: 'honorariosLabel', border: [false, false, false, false] },
                { text: `${(datos.honorariosSinIVA * 0.21).toLocaleString('es-ES', {minimumFractionDigits: 2})} €`, style: 'honorariosValue', border: [false, false, false, false] }
              ],
              [
                { text: 'Total honorarios:', style: 'honorariosTotal', border: [false, true, false, false], borderColor: '#059669' },
                { text: `${datos.honorariosConIVA.toLocaleString('es-ES', {minimumFractionDigits: 2})} €`, style: 'honorariosTotal', border: [false, true, false, false], borderColor: '#059669' }
              ]
            ]
          },
          margin: [0, 0, 0, 15]
        }
      );
    }

    // Liquidación final
    content.push(
      { text: "LIQUIDACIÓN FINAL", style: "subtitle", color: '#DC2626', margin: [0, 10, 0, 8] },
      {
        table: {
          widths: ['*', '15%'],
          body: [
            [
              { text: 'TOTAL FACTURAS PAGADAS:', style: 'summaryLabel', border: [false, false, false, false] },
              { text: `${datos.totalFacturas.toLocaleString('es-ES', {minimumFractionDigits: 2})} €`, style: 'summaryValue', border: [false, false, false, false] }
            ],
            ...(isLiquidacion ? [[
              { text: 'HONORARIOS FINATECH:', style: 'summaryLabel', border: [false, false, false, false] },
              { text: `+ ${datos.honorariosConIVA.toLocaleString('es-ES', {minimumFractionDigits: 2})} €`, style: 'summaryValue', color: '#059669', border: [false, false, false, false] }
            ]] : []),
            [
              { text: 'ANTICIPO RECIBIDO:', style: 'summaryLabel', border: [false, false, false, false] },
              { text: `- ${datos.anticipo.toLocaleString('es-ES', {minimumFractionDigits: 2})} €`, style: 'summaryValue', color: '#2563EB', border: [false, false, false, false] }
            ],
            [
              { text: 'ADEUDO PENDIENTE:', style: 'summaryFinal', border: [false, true, false, false], borderColor: '#DC2626', fillColor: '#FEF2F2' },
              { text: `${(isLiquidacion ? datos.adeudoPendiente : (datos.totalFacturas - datos.anticipo)).toLocaleString('es-ES', {minimumFractionDigits: 2})} €`, style: 'summaryFinal', color: (isLiquidacion ? datos.adeudoPendiente : (datos.totalFacturas - datos.anticipo)) >= 0 ? '#DC2626' : '#059669', border: [false, true, false, false], borderColor: '#DC2626', fillColor: '#FEF2F2' }
            ]
          ]
        }
      }
    );

    // Nota final para liquidación
    if (isLiquidacion) {
      const adeudoPendiente = datos.adeudoPendiente;
      content.push({
        text: adeudoPendiente >= 0 ? 
          "El importe indicado como 'Adeudo Pendiente' deberá ser abonado por el cliente." :
          "El importe indicado representa un saldo a favor del cliente.",
        style: 'note',
        margin: [0, 10, 0, 0]
      });
    }

    return {
      pageSize: 'A4',
      pageOrientation: 'landscape',
      pageMargins: [30, 50, 30, isLiquidacion ? 80 : 60],
      
      header: {
        columns: [{
          width: '*',
          text: 'FINATECH - Servicios Financieros',
          style: 'companyHeader',
          alignment: 'center',
          margin: [0, 15, 0, 0]
        }]
      },
      
      footer: (currentPage, pageCount) => ({
        columns: [{
          width: '*',
          text: `Página ${currentPage} de ${pageCount}`,
          alignment: 'center',
          style: 'footer'
        }],
        margin: [0, 10, 0, 0]
      }),

      content,

      styles: {
        companyHeader: { fontSize: 14, bold: true, color: '#1F2937' },
        title: { fontSize: 16, bold: true, alignment: 'center', color: isLiquidacion ? '#059669' : '#1E40AF' },
        subtitle: { fontSize: 12, bold: true, color: '#374151' },
        infoText: { fontSize: 9, color: '#4B5563', margin: [0, 1] },
        infoTextBold: { fontSize: 10, bold: true, color: '#DC2626', margin: [0, 1] },
        tableHeader: { fontSize: 8, bold: true, color: 'white', margin: [2, 3] },
        tableCell: { fontSize: 7, color: '#374151', margin: [2, 2] },
        tableTotals: { fontSize: 8, bold: true, color: '#1F2937', margin: [2, 3] },
        honorariosLabel: { fontSize: 9, color: '#374151', alignment: 'right', margin: [0, 2] },
        honorariosValue: { fontSize: 9, bold: true, color: '#059669', alignment: 'right', margin: [5, 2] },
        honorariosTotal: { fontSize: 10, bold: true, color: '#059669', alignment: 'right', margin: [0, 3] },
        summaryLabel: { fontSize: 10, bold: true, color: '#374151', alignment: 'right', margin: [0, 2] },
        summaryValue: { fontSize: 10, bold: true, color: '#1F2937', alignment: 'right', margin: [5, 2] },
        summaryFinal: { fontSize: 12, bold: true, alignment: 'right', margin: [0, 5] },
        note: { fontSize: 8, italics: true, color: '#6B7280', alignment: 'center' },
        footer: { fontSize: 8, color: '#6B7280' }
      }
    };
  }
};