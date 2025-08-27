import exceljs from 'exceljs'
import { parseFecha } from './fechaFormato.js';

export function historicoExcel(data) {
    console.log(data)
    const anticipoValor = parseFloat(data.anticipo?.anticipo ?? 0);
    const nombreEmpresa = data.nombreEmpresa;
    const adeudosLista = data.adeudos;

    const workbook = new exceljs.Workbook()
    const hoy = new Date();
    const fechaFormateada = `${hoy.getFullYear()}-${(hoy.getMonth() + 1).toString().padStart(2, '0')}-${hoy.getDate().toString().padStart(2, '0')}`;
    const horaFormateada = `${hoy.getHours().toString().padStart(2, '0')}-${hoy.getMinutes().toString().padStart(2, '0')}`;
    const worksheet = workbook.addWorksheet(`Histórico_${nombreEmpresa}_${fechaFormateada}_${horaFormateada}`);

    // Definir encabezados 
    worksheet.mergeCells('A1:K1')
    const titulo = worksheet.getCell('A1')
    titulo.value = `Adeudos a Finatech de ${nombreEmpresa}`
    titulo.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '5b3c1b' }
    }
    titulo.alignment = { vertical: "middle", horizontal: 'center' };
    titulo.font = { size: 16, bold: true, color: { argb: "FFFFFFFF" } }

    // Ordenar por fecha
    adeudosLista.sort((a, b) => parseFecha(a.ff) - parseFecha(b.ff));

    const fechaMasVieja = adeudosLista[0].ff;
    const fechaMasReciente = adeudosLista[adeudosLista.length - 1].ff;

    worksheet.mergeCells('A2:K2')
    const periodo = worksheet.getCell('A2')
    periodo.value = `Adeudos a Finatech de ${fechaMasVieja} a ${fechaMasReciente}`
    periodo.alignment = { vertical: "middle", horizontal: "center" }
    periodo.font = { size: 12, bold: true, color: { argb: "FFFFFFFF" } }
    periodo.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '5b3c1b' }
    }


    // Agrupar adeudos por número de liquidación
    const adeudosAgrupados = {};

    adeudosLista.forEach(adeudo => {
        const numLiquidacion = adeudo.num_liquidacion || 'SIN_LIQUIDACION';

        if (!adeudosAgrupados[numLiquidacion]) {
            adeudosAgrupados[numLiquidacion] = {
                adeudos: [],
                totales: {
                    importe: 0,
                    iva: 0,
                    retencion: 0,
                    cs_iva: 0,
                    total: 0
                },
                // Los honorarios son únicos por liquidación, no se suman
                honorarios: {
                    base: parseFloat(adeudo.honorarios_base || 0),
                    iva: parseFloat(adeudo.honorarios_iva || 0)
                }
            };
        }

        // Agregar adeudo al grupo
        adeudosAgrupados[numLiquidacion].adeudos.push(adeudo);

        // Calcular totales del grupo (sin honorarios)
        const totales = adeudosAgrupados[numLiquidacion].totales;
        totales.importe += parseFloat(adeudo.importe || 0);
        totales.iva += parseFloat(adeudo.iva || 0);
        totales.retencion += parseFloat(adeudo.retencion || 0);
        totales.cs_iva += parseFloat(adeudo.cs_iva || 0);

        // Actualizar honorarios solo si el adeudo actual tiene honorarios diferentes de 0
        if (parseFloat(adeudo.honorarios_base || 0) > 0) {
            adeudosAgrupados[numLiquidacion].honorarios.base = parseFloat(adeudo.honorarios_base);
        }
        if (parseFloat(adeudo.honorarios_iva || 0) > 0) {
            adeudosAgrupados[numLiquidacion].honorarios.iva = parseFloat(adeudo.honorarios_iva);
        }
    });

    // Crear encabezados de tabla
    let currentRow = 3;
    let filasConTotales = []; // Para guardar las filas que tienen totales

    // Procesar cada grupo de liquidación
    Object.keys(adeudosAgrupados).forEach((numLiquidacion, grupoIndex) => {
        const grupo = adeudosAgrupados[numLiquidacion];

        // Título del grupo de liquidación (solo si hay múltiples liquidaciones)
        if (Object.keys(adeudosAgrupados).length > 1) {
            worksheet.mergeCells(`A${currentRow}:K${currentRow}`);
            const tituloGrupo = worksheet.getCell(`A${currentRow}`);
            tituloGrupo.value = numLiquidacion === 'SIN_LIQUIDACION' ?
                'ADEUDOS SIN LIQUIDACIÓN' :
                `LIQUIDACIÓN N° ${numLiquidacion}`;
            tituloGrupo.font = { bold: true, size: 12 };
            tituloGrupo.alignment = { horizontal: 'center' };
            tituloGrupo.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'dad7cc' }
            };
            currentRow++;
        }

        const headers = ['Concepto', 'Proveedor', 'Fecha', 'Num Factura', 'Protocolo/Entrada', 'Importe', 'IVA', 'Retención', 'CS IVA', 'Total', 'Diferencia'];
        headers.forEach((header, index) => {
            const cell = worksheet.getCell(currentRow, index + 1);
            cell.value = header;
            cell.font = { bold: true };
            cell.alignment = { horizontal: 'center' };
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'dad7cc' }
            };
        });

        currentRow++;

        // Mostrar adeudos del grupo
        grupo.adeudos.forEach(adeudo => {
            const rowData = [
                adeudo.concepto,
                adeudo.proveedor,
                adeudo.ff,
                adeudo.num_factura,
                adeudo.protocolo_entrada,
                parseFloat(adeudo.importe || 0).toFixed(2),
                parseFloat(adeudo.iva || 0).toFixed(2),
                parseFloat(adeudo.retencion || 0).toFixed(2),
                parseFloat(adeudo.cs_iva || 0).toFixed(2)
            ];

            rowData.forEach((value, index) => {
                const cell = worksheet.getCell(currentRow, index + 1);
                cell.value = value;

                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: currentRow % 2 === 0 ? 'FFFFFFFF' : 'FFD3D3D3' }
                };

                if (index >= 5 && index <= 8) { // Columnas numéricas
                    cell.alignment = { horizontal: 'right' };
                    cell.numFmt = '#,##0.00';
                }
            });

            // Fórmula para el total: Importe + IVA - Retención + CS_IVA
            const totalCell = worksheet.getCell(currentRow, 10);
            const importeCol = worksheet.getColumn(6).letter;
            const ivaCol = worksheet.getColumn(7).letter;
            const retencionCol = worksheet.getColumn(8).letter;
            const csIvaCol = worksheet.getColumn(9).letter;

            totalCell.value = {
                formula: `${importeCol}${currentRow}+${ivaCol}${currentRow}-${retencionCol}${currentRow}+${csIvaCol}${currentRow}`
            };
            totalCell.alignment = { horizontal: 'right' };
            totalCell.numFmt = '#,##0.00';
            totalCell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: currentRow % 2 === 0 ? 'FFFFFFFF' : 'FFD3D3D3' }
            };

            const diferenciaCell = worksheet.getCell(currentRow, 11);
            diferenciaCell.value = adeudo.diferencia ?? adeudo.diferencia | '-';
            diferenciaCell.alignment = { horizontal: 'right' };
            diferenciaCell.numFmt = '#,##0.00';
            diferenciaCell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: currentRow % 2 === 0 ? 'FFFFFFFF' : 'FFD3D3D3' }
            };

            currentRow++;
        });

        // Fila de totales del grupo
        worksheet.mergeCells(`G${currentRow}:I${currentRow}`);
        const labelCell = worksheet.getCell(currentRow, 9);
        labelCell.value = 'TOTAL:';
        labelCell.font = { bold: true };
        labelCell.alignment = { horizontal: 'right' };

        for (let col = 8; col <= 10; col++) { // H, I, J
            worksheet.getCell(currentRow, col).border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
        }

        // Solo suma de la columna Total (columna 10)
        const startRow = currentRow - grupo.adeudos.length;
        const endRow = currentRow - 1;

        const totalCell = worksheet.getCell(currentRow, 10);
        const totalColLetter = worksheet.getColumn(10).letter;
        totalCell.value = {
            formula: `SUM(${totalColLetter}${startRow}:${totalColLetter}${endRow})`
        };
        totalCell.font = { bold: true };
        totalCell.alignment = { horizontal: 'right' };

        currentRow++;

        // Guardar la fila del total que no tiene liquidación
        if (numLiquidacion === 'SIN_LIQUIDACION') {
            filasConTotales.push(currentRow - 1);
        }

        // Mostrar honorarios si existen
        if (grupo.honorarios.base > 0 || grupo.honorarios.iva > 0) {
            worksheet.mergeCells(`G${currentRow}:I${currentRow}`);
            const honCell = worksheet.getCell(currentRow, 9);
            honCell.value = 'Honorarios FINATECH (IVA incluido):';
            honCell.font = { bold: true };
            honCell.alignment = { horizontal: 'right' };

            for (let col = 8; col <= 10; col++) { // H, I, J
                worksheet.getCell(currentRow, col).border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
            }

            const totalHonorarios = grupo.honorarios.base + grupo.honorarios.iva;
            const honValueCell = worksheet.getCell(currentRow, 10);
            honValueCell.value = totalHonorarios.toFixed(2);
            honValueCell.font = { bold: true };
            honValueCell.alignment = { horizontal: 'right' };
            honValueCell.numFmt = '#,##0.00';

            for (let col = 8; col <= 10; col++) { // H, I, J
                worksheet.getCell(currentRow, col).border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
            }

            currentRow++;

            // Total con honorarios
            worksheet.mergeCells(`G${currentRow}:I${currentRow}`);
            const totalConHonCell = worksheet.getCell(currentRow, 9);
            totalConHonCell.value = 'TOTAL CON HONORARIOS:';
            totalConHonCell.font = { bold: true };
            totalConHonCell.alignment = { horizontal: 'right' };

            for (let col = 8; col <= 10; col++) { // H, I, J
                worksheet.getCell(currentRow, col).border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
            }


            const totalConHonValueCell = worksheet.getCell(currentRow, 10);
            totalConHonValueCell.value = {
                formula: `${worksheet.getColumn(10).letter}${currentRow - 2}+${worksheet.getColumn(10).letter}${currentRow - 1}`
            };
            totalConHonValueCell.font = { bold: true };
            totalConHonValueCell.alignment = { horizontal: 'right' };
            totalConHonValueCell.numFmt = '#,##0.00';
            currentRow++;

            // Guardar también la fila del total con honorarios
            filasConTotales.push(currentRow - 1);

            currentRow++;

        } else {
            currentRow++;
        }
    });

    // Sección final de cálculos
    currentRow += 2;

    // Total genera
    worksheet.mergeCells(`H${currentRow}:I${currentRow}`);
    const totalGeneralLabel = worksheet.getCell(currentRow, 9);
    totalGeneralLabel.value = 'TOTAL GENERAL:';
    totalGeneralLabel.font = { bold: true, size: 14 };
    totalGeneralLabel.alignment = { horizontal: 'right' };

    const totalGeneralValue = worksheet.getCell(currentRow, 10);

    // Crear fórmula que sume todas las filas de totales
    let formulaTotalGeneral = '';
    if (filasConTotales.length > 0) {
        const totalCol = worksheet.getColumn(10).letter;
        formulaTotalGeneral = filasConTotales.map(fila => `${totalCol}${fila}`).join('+');
        totalGeneralValue.value = { formula: formulaTotalGeneral };
    } else {
        totalGeneralValue.value = 0;
    }

    totalGeneralValue.font = { bold: true, size: 14 };
    totalGeneralValue.alignment = { horizontal: 'right' };
    totalGeneralValue.numFmt = '#,##0.00';

    for (let col = 8; col <= 10; col++) { // H, I, J
        worksheet.getCell(currentRow, col).border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        };
    }

    currentRow++;

    // Anticipo
    if (anticipoValor > 0) {
        worksheet.mergeCells(`H${currentRow}:I${currentRow}`);
        const anticipoLabel = worksheet.getCell(currentRow, 9);
        anticipoLabel.value = 'Anticipo por el cliente:';
        anticipoLabel.font = { bold: true };
        anticipoLabel.alignment = { horizontal: 'right' };

        const anticipoValueCell = worksheet.getCell(currentRow, 10);
        anticipoValueCell.value = `-${anticipoValor.toFixed(2)}`;
        anticipoValueCell.font = { bold: true };
        anticipoValueCell.alignment = { horizontal: 'right' };
        anticipoValueCell.numFmt = '#,##0.00';

        for (let col = 8; col <= 10; col++) { // H, I, J
            worksheet.getCell(currentRow, col).border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
        }

        currentRow++;

        // Adeudo pendiente
        worksheet.mergeCells(`H${currentRow}:I${currentRow}`);
        const adeudoPendienteLabel = worksheet.getCell(currentRow, 9);
        adeudoPendienteLabel.value = 'Adeudo pendiente:';
        adeudoPendienteLabel.font = { bold: true, size: 12 };
        adeudoPendienteLabel.alignment = { horizontal: 'right' };

        const adeudoPendienteValue = worksheet.getCell(currentRow, 10);
        adeudoPendienteValue.value = {
            formula: `${worksheet.getColumn(10).letter}${currentRow - 2}+${worksheet.getColumn(10).letter}${currentRow - 1}`
        };
        adeudoPendienteValue.font = { bold: true, size: 12 };
        adeudoPendienteValue.alignment = { horizontal: 'right' };
        adeudoPendienteValue.numFmt = '#,##0.00';
    }

    for (let col = 8; col <= 10; col++) { // H, I, J
        worksheet.getCell(currentRow, col).border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        };
    }

    // Ajustar ancho de columnas
    worksheet.columns.forEach((column, index) => {
        if (index === 0 || index === 1) { // Concepto y Proveedor
            column.width = 25;
        } else if (index >= 5 && index <= 9) { // Columnas numéricas
            column.width = 12;
        } else if (index === 4) {
            column.width = 18;
        } else {
            column.width = 15;
        }
    });

    // Aplicar formato general
    worksheet.eachRow((row) => {
        row.eachCell((cell) => {
            if (!cell.font || !cell.font.size) {
                cell.font = { ...(cell.font || {}), size: 11 };
            }
        });
    });

    console.log('Adeudos agrupados por liquidación:', adeudosAgrupados);

    return workbook;
}