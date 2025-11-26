// hooks/useAdeudosManager.js - Versión sin lógica de anticipo
import { useState, useEffect } from 'react';
import { updateAdeudos, deleteAdeudos } from '../api/moduloAdeudos/adeudos'
import { Extendible } from '../components/elements/Historico/Expandible';

export const useAdeudosManager = () => {
    const {
        isRMM
    } = Extendible();
    const [selectedClient, setSelectedClient] = useState(null);
    const [originalRows, setOriginalRows] = useState([]);
    const [editedRows, setEditedRows] = useState([]);
    const [selectedRows, setSelectedRows] = useState(new Set());
    const [editingRows, setEditingRows] = useState(new Set());
    const [hasChanges, setHasChanges] = useState(false);
    const [isInitializing, setIsInitializing] = useState(false);

    const checkForChanges = () => {
        if (isInitializing) {
            console.log('Saltando checkForChanges durante inicialización');
            return;
        }

        const rowsChanged = editedRows.some((row) => {
            const original = originalRows.find(orig => orig._internal_id === row._internal_id);

            if (!original) {
                console.log('No se encontró original para:', row._internal_id);
                return true;
            }

            const hasChanges = Object.keys(row).some(key => {
                if (key === 'total' || key === '_internal_id') return false;

                const changed = row[key] !== original[key];
                if (changed) {
                    console.log(`Cambio detectado en ${key}: ${original[key]} -> ${row[key]} para ID: ${row._internal_id}`);
                }
                return changed;
            });

            return hasChanges;
        });

        const isEditing = editingRows.size > 0;

        setHasChanges(rowsChanged || isEditing);
    };

    useEffect(() => {
        if (!isInitializing && originalRows.length > 0 && editedRows.length > 0) {
            checkForChanges();
        }
    }, [editedRows, editingRows]);

    const handleCellChange = (index, field, value) => {
        const newRows = [...editedRows];
        newRows[index][field] = value;

        // Recalcular total si es necesario
        if (['importe', 'iva', 'retencion', 'cs_iva'].includes(field)) {
            const row = newRows[index];
            newRows[index].total = (parseFloat(row.importe) || 0) +
                (parseFloat(row.iva) || 0) -
                Math.abs(parseFloat(row.retencion) || 0) +
                (parseFloat(row.cs_iva) || 0);
        }

        setEditedRows(newRows);
    };

    const handleRowSelection = (internalId, isChecked) => {
        const newSelectedRows = new Set(selectedRows);

        if (isChecked) {
            newSelectedRows.add(internalId);
        } else {
            newSelectedRows.delete(internalId);

            const newEditingRows = new Set(editingRows);
            newEditingRows.delete(internalId);
            setEditingRows(newEditingRows);
        }

        setSelectedRows(newSelectedRows);
    };

    const handleSelectAll = (isChecked) => {
        if (isChecked) {
            const allInternalIds = editedRows.map(row => row._internal_id);
            setSelectedRows(new Set(allInternalIds));
        } else {
            setSelectedRows(new Set());
            setEditingRows(new Set());
        }
    };

    const handleEditSelected = () => {
        if (selectedRows.size === 0) {
            alert("Debes seleccionar al menos una fila para editar");
            return;
        }
        setEditingRows(new Set(selectedRows));
    };

    const handleDeleteSelected = async (deleteApiCall = deleteAdeudos) => {
        if (selectedRows.size === 0) {
            alert("Debes seleccionar al menos una fila para eliminar");
            return;
        }

        const confirmDelete = window.confirm(`¿Estás seguro de eliminar ${selectedRows.size} registro(s)?`);
        if (!confirmDelete) return;

        try {
            const facturasAEliminar = editedRows
                .filter(row => selectedRows.has(row._internal_id))
                .map(row => {
                    const original = originalRows.find(orig => orig._internal_id === row._internal_id);
                    const data = {
                        num_factura: original ? original.num_factura : row.num_factura,
                        empresa_cif: selectedClient.cif
                    }
                    return data;
                });

            if (deleteApiCall) {
                const response = await deleteApiCall(facturasAEliminar);
                if (!response.success) {
                    alert(response.error || "Error al eliminar los registros");
                    return;
                }
            }

            const newRows = editedRows.filter(row => !selectedRows.has(row._internal_id));
            setEditedRows(newRows);
            setOriginalRows(newRows);
            setSelectedRows(new Set());
            setEditingRows(new Set());

            alert(`${facturasAEliminar.length} registro(s) eliminado(s) exitosamente`);
            return true;

        } catch (error) {
            console.error("Error al eliminar:", error);
            alert("Error al eliminar los registros");
            return false;
        }
    };

    const agruparProtocoloPorFactura = (cambios) => {
        const map = {};

        cambios.forEach(item => {
            if (!map[item.num_factura]) {
                map[item.num_factura] = { num_factura: item.num_factura };
            }
            if ('num_protocolo' in item) map[item.num_factura].num_protocolo = item.num_protocolo;
        });

        return Object.values(map);
    };

    const agruparRmmPorEntrada = (cambios) => {
        const map = {};

        cambios.forEach(item => {
            if (!map[item.num_entrada_original]) {
                map[item.num_entrada_original] = { num_entrada_original: item.num_entrada_original }
            }
            if ('anticipo_pagado' in item) map[item.num_entrada_original].anticipo_pagado = item.anticipo_pagado;
            if ('fecha_anticipo' in item) map[item.num_entrada_original].fecha_anticipo = item.fecha_anticipo;
            if ('diferencia' in item) map[item.num_entrada_original].diferencia = item.diferencia;
            if ('fecha_devolucion_diferencia' in item) map[item.num_entrada_original].fecha_devolucion_diferencia = item.fecha_devolucion_diferencia;
            if ('num_entrada' in item) map[item.num_entrada_original].num_entrada = item.num_entrada;
        })

        return Object.values(map);
    }

    const handleSaveChanges = async (saveApiCall = updateAdeudos) => {
        try {
            // Validaciones
            for (const row of editedRows) {
                const camposObligatorios = ["concepto", "proveedor", "importe", "iva", "retencion"];
                for (const campo of camposObligatorios) {
                    if (!row[campo] || row[campo].toString().trim() === "") {
                        alert(`El campo "${campo}" no puede estar vacío en la factura ${row.num_factura || "(sin número)"}`);
                        return;
                    }
                }
            }

            const cambiosProtocolo = [];
            const cambiosRMM = [];
            const cambiosEstado = [];

            const cambiosFilas = editedRows
                .map((row, index) => {
                    const original = originalRows.find(orig => orig._internal_id === row._internal_id);
                    console.log(original)

                    if (!original) {
                        console.log(`No se encontró original para fila ${index}`);
                        return null;
                    }

                    const cambios = {};
                    let hayCambios = false;

                    Object.keys(row).forEach(key => {
                        if (key === 'total' || key === '_internal_id') return;

                        if (key === 'num_protocolo' && isRMM(row.proveedor)) {
                            if (row[key] !== original[key]) {
                                cambiosRMM.push({
                                    num_entrada_original: original[key],
                                    num_entrada: row[key]
                                })
                            }
                            return
                        } 

                        if (key === 'num_protocolo') {
                            if (row[key] !== original[key]) {
                                cambiosProtocolo.push({
                                    num_factura: row.num_factura,
                                    [key]: row[key]
                                });
                            }
                            return;
                        }

                        if (key === 'anticipo_pagado' || key === 'fecha_anticipo' || key === 'diferencia' || key === 'fecha_devolucion_diferencia') {
                            if (row[key] !== original[key]) {
                                cambiosRMM.push({
                                    num_entrada_original: original.num_protocolo || row.num_entrada,
                                    [key]: row[key]
                                })
                            }
                            return
                        }

                        if (key === 'num_liquidacion') {
                            cambios[key] = row[key];
                            return
                        }

                        if (key === 'estado') {
                            if (row[key] !== original[key]) {
                                cambiosEstado.push({
                                    num_liquidacion: row.num_liquidacion,
                                    nuevo_estado: row[key]
                                });
                            }
                            return;
                        }

                        if (row[key] !== original[key]) {
                            cambios[key] = row[key];
                            hayCambios = true;
                        }
                    });

                    if (row.num_factura !== original.num_factura) {
                        if (!original.num_factura || original.num_factura.trim() === "") {
                            return {
                                num_factura_original: original.num_factura,
                                concepto: row.concepto,
                                proveedor: row.proveedor,
                                ff: row.ff,
                                num_factura: row.num_factura,
                                importe: row.importe,
                                num_entrada_original: row.num_protocolo || row.num_entrada,
                                ...cambios
                            };
                        } else {
                            return {
                                num_factura_original: original.num_factura,
                                ...cambios
                            };
                        }
                    }

                    return hayCambios ? {
                        num_factura_original: original.num_factura,
                        ...cambios
                    } : null;
                })
                .filter(Boolean);

            const estadosPorLiquidacion = {};
            for (const cambio of cambiosEstado) {
                const key = cambio.num_liquidacion || 'pendientes';

                if (estadosPorLiquidacion[key] && estadosPorLiquidacion[key] !== cambio.nuevo_estado) {
                    alert(`Error: Hay estados diferentes para la misma liquidación (${key}). Todos los adeudos de una liquidación deben tener el mismo estado.`);
                    return;
                }

                estadosPorLiquidacion[key] = cambio.nuevo_estado;
            }

            let cambioEstadoFinal = null;
            if (cambiosEstado.length > 0) {
                const primerCambio = cambiosEstado[0];
                cambioEstadoFinal = {
                    num_liquidacion: primerCambio.num_liquidacion || null,
                    nuevo_estado: primerCambio.nuevo_estado
                };
            }

            const payload = {
                empresa_cif: selectedClient?.cif,
                ...(cambiosFilas.length > 0 && { cambios_filas: cambiosFilas }),
                ...(cambiosRMM.length > 0 && { cambios_RMM: agruparRmmPorEntrada(cambiosRMM) }),
                ...(cambiosProtocolo.length > 0 && { cambios_protocolo: agruparProtocoloPorFactura(cambiosProtocolo) }),
                ...(cambioEstadoFinal && { cambio_estado: cambioEstadoFinal })
            };

            console.log("PAYLOAD FINAL:", payload);

            if (saveApiCall) {
                const response = await saveApiCall(payload);

                if (!response.success) {
                    alert(response.error || "Error al guardar cambios");
                    return;
                }
            }

            setHasChanges(false);
            setEditingRows(new Set());
            setSelectedRows(new Set());

            alert("Cambios guardados exitosamente");
            return true;
        } catch (error) {
            console.error("Error al guardar cambios:", error);
            alert("Error al guardar cambios");
            return false;
        }
    };

    const handleCancelChanges = () => {
        setEditedRows(originalRows.map(row => ({ ...row })));
        setHasChanges(false);
        setEditingRows(new Set());
        setSelectedRows(new Set());
    };

    const resetState = () => {
        setIsInitializing(true);
        setOriginalRows([]);
        setEditedRows([]);
        setSelectedRows(new Set());
        setEditingRows(new Set());
        setHasChanges(false);
        setIsInitializing(false);
    };

    const initializeData = (adeudos) => {
        setIsInitializing(true);
        const adeudosWithId = adeudos.map((row, index) => ({
            ...row,
            _internal_id: `row_${index}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        }));

        setOriginalRows(JSON.parse(JSON.stringify(adeudosWithId)));
        setEditedRows(JSON.parse(JSON.stringify(adeudosWithId)));

        setSelectedRows(new Set());
        setEditingRows(new Set());
        setHasChanges(false);

        setTimeout(() => {
            setIsInitializing(false);
        }, 0);
    };

    // Estados calculados
    const isAllSelected = selectedRows.size > 0 && selectedRows.size === editedRows.length;
    const isIndeterminate = selectedRows.size > 0 && selectedRows.size < editedRows.length;

    return {
        // Estados
        selectedClient,
        setSelectedClient,
        originalRows,
        editedRows,
        selectedRows,
        editingRows,
        hasChanges,
        isAllSelected,
        isIndeterminate,
        isInitializing,

        // Funciones
        handleCellChange,
        handleRowSelection,
        handleSelectAll,
        handleEditSelected,
        handleDeleteSelected,
        handleSaveChanges,
        handleCancelChanges,
        resetState,
        initializeData
    };
};