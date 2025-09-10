// hooks/useAdeudosManager.js
import { useState, useEffect } from 'react';
import { updateAdeudos, deleteAdeudos } from '../api/moduloAdeudos/adeudos'

export const useAdeudosManager = () => {
    const [selectedClient, setSelectedClient] = useState(null);
    const [originalRows, setOriginalRows] = useState([]);
    const [editedRows, setEditedRows] = useState([]);
    const [selectedRows, setSelectedRows] = useState(new Set());
    const [editingRows, setEditingRows] = useState(new Set());
    const [originalAnticipo, setOriginalAnticipo] = useState("");
    const [anticipoUnico, setAnticipoUnico] = useState("");
    const [hasChanges, setHasChanges] = useState(false);

    const checkForChanges = () => {
        const anticipoChanged = anticipoUnico !== originalAnticipo;

        const rowsChanged = editedRows.some((row, index) => {
            const original = originalRows[index];
            if (!original) return true;

            return Object.keys(row).some(key => {
                if (key === 'total' || key === '_internal_id') return false; // Excluir ID interno
                return row[key] !== original[key];
            });
        });

        setHasChanges(anticipoChanged || rowsChanged);
    };

    useEffect(() => {
        checkForChanges();
    }, [anticipoUnico, editedRows]);

    const handleCellChange = (index, field, value) => {
        const newRows = [...editedRows];
        newRows[index][field] = value;

        // Recalcular total si es necesario
        if (['importe', 'iva', 'retencion'].includes(field)) {
            const row = newRows[index];
            newRows[index].total = (parseFloat(row.importe) || 0) +
                (parseFloat(row.iva) || 0) -
                Math.abs(parseFloat(row.retencion) || 0);
        }

        setEditedRows(newRows);
    };

    const handleAnticipoChange = (value) => {
        setAnticipoUnico(value);
    };

    // Cambiar a usar _internal_id en lugar de num_factura
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
            // Obtener las facturas originales para eliminar
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
            if ('protocolo_entrada' in item) map[item.num_factura].protocolo_entrada = item.protocolo_entrada;
            if ('cs_iva' in item) map[item.num_factura].cs_iva = item.cs_iva;
        });

        return Object.values(map);
    };

    const handleSaveChanges = async (saveApiCall = updateAdeudos) => {
        try {
            for (const row of editedRows) {
                const camposObligatorios = ["num_factura", "concepto", "proveedor", "importe", "iva", "retencion"];
                for (const campo of camposObligatorios) {
                    if (!row[campo] || row[campo].toString().trim() === "") {
                        alert(`El campo "${campo}" no puede estar vacío en la factura ${row.num_factura || "(sin número)"}`);
                        return;
                    }
                }
            }

            const cambiosProtocolo = [];
            const cambiosAnticipo = anticipoUnico !== originalAnticipo ? {
                anticipo_unico: anticipoUnico === "" || anticipoUnico === "0" ? null : parseFloat(anticipoUnico)
            } : {};

            const cambiosFilas = editedRows
                .map((row, index) => {
                    const original = originalRows.find(orig => orig._internal_id === row._internal_id);
                    if (!original) return null;

                    const cambios = {};
                    let hayCambios = false;

                    Object.keys(row).forEach(key => {
                        if (key === 'total' || key === '_internal_id') return;

                        if (key === 'protocolo_entrada' || key === 'cs_iva') {
                            if (row[key] !== original[key]) {
                                cambiosProtocolo.push({
                                    num_factura: row.num_factura,
                                    [key]: row[key]
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
                        return {
                            num_factura_original: original.num_factura,
                            ...cambios
                        };
                    }

                    return hayCambios ? {
                        num_factura_original: original.num_factura,
                        ...cambios
                    } : null;
                })
                .filter(Boolean);

            const payload = {
                empresa_cif: selectedClient?.cif,
                ...cambiosAnticipo,
                cambios_filas: cambiosFilas,
                cambios_protocolo: cambiosProtocolo.length ? agruparProtocoloPorFactura(cambiosProtocolo) : undefined
            };

            if (saveApiCall) {
                const response = await saveApiCall(payload);
                
                if (!response.success) {
                    alert(response.error || "Error al guardar cambios");
                    return;
                }
            }

            setOriginalRows([...editedRows]);
            setOriginalAnticipo(anticipoUnico);
            setHasChanges(false);
            setEditingRows(new Set());
            setSelectedRows(new Set());

            alert("Cambios guardados exitosamente");
        } catch (error) {
            console.error("Error al guardar cambios:", error);
            alert("Error al guardar cambios");
        }
    };

    const handleCancelChanges = () => {
        setEditedRows(originalRows.map(row => ({ ...row })));
        setAnticipoUnico(originalAnticipo);
        setHasChanges(false);
        setEditingRows(new Set());
        setSelectedRows(new Set());
    };

    const resetState = () => {
        setOriginalRows([]);
        setEditedRows([]);
        setSelectedRows(new Set());
        setEditingRows(new Set());
        setAnticipoUnico("");
        setOriginalAnticipo("");
        setHasChanges(false);
    };

    const initializeData = (adeudos, anticipo) => {
        // Agregar ID único interno a cada fila
        const adeudosWithId = adeudos.map((row, index) => ({
            ...row,
            _internal_id: `row_${index}_${Date.now()}` // ID único interno
        }));

        setOriginalRows(adeudosWithId);
        setEditedRows(adeudosWithId.map(row => ({ ...row })));
        const anticipoValue = anticipo?.anticipo ?? 0;
        setAnticipoUnico(anticipoValue.toString());
        setOriginalAnticipo(anticipoValue.toString());
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
        anticipoUnico,
        hasChanges,
        isAllSelected,
        isIndeterminate,

        // Funciones
        handleCellChange,
        handleAnticipoChange,
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