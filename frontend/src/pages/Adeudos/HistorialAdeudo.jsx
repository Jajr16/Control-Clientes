import React, { useEffect } from "react";
import ClientSearch from "../../components/elements/searchBar";
import { getAdeudoEmpresa } from "../../api/moduloAdeudos/adeudos";
import { CheckIcon, XMarkIcon, EditIcon, TrashIcon } from '../../components/common/Icons';
import { useAdeudosManager } from '../../hooks/useAdeudosManager';

const Historico = () => {
    const {
        // Estados
        selectedClient,
        setSelectedClient,
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
    } = useAdeudosManager();

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 2
        }).format(amount || 0);
    };

    useEffect(() => {
        if (!selectedClient) {
            resetState();
            return;
        }

        const fetchGetHistorico = async () => {
            try {
                const response = await getAdeudoEmpresa(selectedClient.cif);

                if (!response.success) {
                    alert(response.error);
                    return;
                }

                initializeData(response.data.adeudos, response.data.anticipo);

            } catch (error) {
                console.error("Error fetching historico adeudos:", error);
                resetState();
            }
        };

        fetchGetHistorico();
    }, [selectedClient]);

    return (
        <div className="w-full h-[calc(100vh-7rem)] p-2 sm:p-4 lg:p-6 bg-gray-50 flex flex-col">
            <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 lg:p-6 flex flex-col h-full">
                {/* Header con búsqueda y anticipo - Responsive */}
                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-4 sm:mb-6 space-y-4 lg:space-y-0 flex-shrink-0">
                    <div className="w-full lg:w-[40%]">
                        <ClientSearch
                            onSelectClient={setSelectedClient}
                            routeName={'adeudos/empresa_adeudo'}
                            labelFormat={(c) => `${c.clave} - ${c.nombre}`}
                        />
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                        <div className="flex items-center w-full sm:w-auto">
                            <label htmlFor="anticipo" className="font-bold mr-2 text-sm sm:text-base">
                                Anticipo único:
                            </label>
                            <input
                                id="anticipo"
                                type="number"
                                step="0.01"
                                value={anticipoUnico}
                                onChange={(e) => handleAnticipoChange(e.target.value)}
                                className="border border-gray-300 rounded-md px-2 sm:px-3 py-1 w-24 sm:w-32 text-right text-sm"
                                placeholder="0.00"
                            />
                            <span className="ml-1 text-gray-600 text-sm">€</span>
                        </div>
                    </div>
                </div>

                {/* Controles de selección - Responsive */}
                {selectedClient && editedRows.length > 0 && (
                    <div className="mb-4 bg-gray-50 p-3 sm:p-4 rounded-lg flex-shrink-0">
                        <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                                <span className="text-xs sm:text-sm text-gray-600">
                                    {selectedRows.size} de {editedRows.length} filas seleccionadas
                                </span>

                                {selectedRows.size > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            onClick={handleEditSelected}
                                            className="flex items-center px-2 sm:px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-xs sm:text-sm"
                                        >
                                            <EditIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                                            Editar ({selectedRows.size})
                                        </button>
                                        <button
                                            onClick={() => handleDeleteSelected()}
                                            className="flex items-center px-2 sm:px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-xs sm:text-sm"
                                        >
                                            <TrashIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                                            Eliminar ({selectedRows.size})
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Botones de acción para cambios */}
                            {hasChanges && (
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        onClick={() => handleSaveChanges()}
                                        className="flex items-center px-3 sm:px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-xs sm:text-sm"
                                    >
                                        <CheckIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                                        Guardar
                                    </button>
                                    <button
                                        onClick={handleCancelChanges}
                                        className="flex items-center px-3 sm:px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-xs sm:text-sm"
                                    >
                                        <XMarkIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                                        Cancelar
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Contenido principal que se expande */}
                <div className="flex-1 flex flex-col min-h-0">
                    {/* Tabla de adeudos - Con altura controlada */}
                    {selectedClient && editedRows.length > 0 && (
                        <div className="flex flex-col space-y-4 h-full">
                            <div className="flex justify-between items-center flex-shrink-0">
                                <h2 className="text-lg sm:text-xl font-semibold break-words">
                                    Adeudos a Finatech - {selectedClient.nombre}
                                </h2>
                            </div>

                            {/* Contenedor de tabla con scroll vertical y horizontal */}
                            <div className="flex-1 overflow-auto -mx-3 sm:mx-0 border border-gray-200 sm:rounded-lg">
                                <div className="min-w-full inline-block align-middle h-full">
                                    <table className="min-w-full bg-white h-full">
                                        <thead className="bg-gray-50 sticky top-0 z-20">
                                            <tr>
                                                <th className="sticky left-0 z-30 bg-gray-50 px-2 sm:px-4 py-2 sm:py-3 text-left border-b border-r border-gray-200">
                                                    <input
                                                        type="checkbox"
                                                        checked={isAllSelected}
                                                        ref={input => {
                                                            if (input) input.indeterminate = isIndeterminate;
                                                        }}
                                                        onChange={(e) => handleSelectAll(e.target.checked)}
                                                        className="rounded"
                                                    />
                                                </th>
                                                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase border-b whitespace-nowrap">
                                                    Liquidación #
                                                </th>
                                                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase border-b whitespace-nowrap">
                                                    Concepto
                                                </th>
                                                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase border-b whitespace-nowrap">
                                                    Proveedor
                                                </th>
                                                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase border-b whitespace-nowrap">
                                                    Fecha Factura
                                                </th>
                                                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase border-b whitespace-nowrap">
                                                    Número Factura
                                                </th>
                                                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase border-b whitespace-nowrap">
                                                    Protocolo/Entrada
                                                </th>
                                                <th className="px-2 sm:px-4 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase border-b whitespace-nowrap">
                                                    Importe
                                                </th>
                                                <th className="px-2 sm:px-4 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase border-b whitespace-nowrap">
                                                    IVA
                                                </th>
                                                <th className="px-2 sm:px-4 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase border-b whitespace-nowrap">
                                                    Retención
                                                </th>
                                                <th className="px-2 sm:px-4 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase border-b whitespace-nowrap">
                                                    Concepto sin IVA
                                                </th>
                                                <th className="px-2 sm:px-4 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase border-b whitespace-nowrap">
                                                    Total
                                                </th>
                                                <th className="px-2 sm:px-4 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase border-b whitespace-nowrap">
                                                    Diferencia Depósito
                                                </th>
                                                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase border-b whitespace-nowrap">
                                                    Estado
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {editedRows.map((row, index) => {
                                                const isSelected = selectedRows.has(row._internal_id);
                                                const isEditing = editingRows.has(row._internal_id);

                                                return (
                                                    <tr
                                                        key={row._internal_id}
                                                        className={`
                                                            ${isSelected ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}
                                                            ${isEditing ? 'bg-blue-50' : ''}
                                                        `}
                                                    >
                                                        <td className="sticky left-0 z-10 bg-white px-2 sm:px-4 py-2 sm:py-3 border-b border-r border-gray-200">
                                                            <input
                                                                type="checkbox"
                                                                checked={isSelected}
                                                                onChange={(e) => handleRowSelection(row._internal_id, e.target.checked)}
                                                                className="rounded"
                                                            />
                                                        </td>
                                                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900 border-b">
                                                            {isEditing ? (
                                                                <input
                                                                    type="text"
                                                                    value={row.num_liquidacion || ""}
                                                                    onChange={(e) => handleCellChange(index, 'num_liquidacion', e.target.value)}
                                                                    className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                                                                />
                                                            ) : (
                                                                <span className="block truncate max-w-[100px] sm:max-w-none" title={row.num_liquidacion || '-'}>
                                                                    {row.num_liquidacion || '-'}
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900 border-b">
                                                            {isEditing ? (
                                                                <input
                                                                    type="text"
                                                                    value={row.concepto || ""}
                                                                    onChange={(e) => handleCellChange(index, 'concepto', e.target.value)}
                                                                    className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                                                                />
                                                            ) : (
                                                                <span className="block truncate max-w-[120px] sm:max-w-none" title={row.concepto}>
                                                                    {row.concepto}
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900 border-b">
                                                            {isEditing ? (
                                                                <input
                                                                    type="text"
                                                                    value={row.proveedor || ""}
                                                                    onChange={(e) => handleCellChange(index, 'proveedor', e.target.value)}
                                                                    className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                                                                />
                                                            ) : (
                                                                <span className="block truncate max-w-[100px] sm:max-w-none" title={row.proveedor}>
                                                                    {row.proveedor}
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900 border-b">
                                                            {isEditing ? (
                                                                <input
                                                                    type="text"
                                                                    value={row.ff || ""}
                                                                    onChange={(e) => handleCellChange(index, 'ff', e.target.value)}
                                                                    className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                                                                />
                                                            ) : (
                                                                row.ff
                                                            )}
                                                        </td>
                                                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900 border-b">
                                                            {isEditing ? (
                                                                <input
                                                                    type="text"
                                                                    value={row.num_factura || ""}
                                                                    onChange={(e) => handleCellChange(index, 'num_factura', e.target.value)}
                                                                    className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                                                                />
                                                            ) : (
                                                                row.num_factura
                                                            )}
                                                        </td>
                                                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900 border-b">
                                                            {isEditing ? (
                                                                <input
                                                                    type="text"
                                                                    value={row.protocolo_entrada || ""}
                                                                    onChange={(e) => handleCellChange(index, 'protocolo_entrada', e.target.value)}
                                                                    className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                                                                />
                                                            ) : (
                                                                row.protocolo_entrada
                                                            )}
                                                        </td>
                                                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900 text-right border-b">
                                                            {isEditing ? (
                                                                <input
                                                                    type="number"
                                                                    step="0.01"
                                                                    value={row.importe || ""}
                                                                    onChange={(e) => handleCellChange(index, 'importe', parseFloat(e.target.value) || 0)}
                                                                    className="w-16 sm:w-20 px-2 py-1 border border-gray-300 rounded text-xs text-right"
                                                                />
                                                            ) : (
                                                                formatCurrency(row.importe)
                                                            )}
                                                        </td>
                                                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900 text-right border-b">
                                                            {isEditing ? (
                                                                <input
                                                                    type="number"
                                                                    step="0.01"
                                                                    value={row.iva || ""}
                                                                    onChange={(e) => handleCellChange(index, 'iva', parseFloat(e.target.value) || 0)}
                                                                    className="w-16 sm:w-20 px-2 py-1 border border-gray-300 rounded text-xs text-right"
                                                                />
                                                            ) : (
                                                                formatCurrency(row.iva)
                                                            )}
                                                        </td>
                                                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900 text-right border-b">
                                                            {isEditing ? (
                                                                <input
                                                                    type="number"
                                                                    step="0.01"
                                                                    value={row.retencion || ""}
                                                                    onChange={(e) => handleCellChange(index, 'retencion', parseFloat(e.target.value) || 0)}
                                                                    className="w-16 sm:w-20 px-2 py-1 border border-gray-300 rounded text-xs text-right"
                                                                />
                                                            ) : (
                                                                formatCurrency(row.retencion)
                                                            )}
                                                        </td>
                                                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900 text-right border-b">
                                                            {isEditing ? (
                                                                <input
                                                                    type="number"
                                                                    step="0.01"
                                                                    value={row.cs_iva || ""}
                                                                    onChange={(e) => handleCellChange(index, 'cs_iva', parseFloat(e.target.value) || 0)}
                                                                    className="w-16 sm:w-20 px-2 py-1 border border-gray-300 rounded text-xs text-right"
                                                                />
                                                            ) : (
                                                                formatCurrency(row.cs_iva)
                                                            )}
                                                        </td>
                                                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium text-gray-900 text-right border-b">
                                                            {formatCurrency(row.total)}
                                                        </td>
                                                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900 text-right border-b">
                                                            {isEditing && row.diferencia ? (
                                                                <input
                                                                    type="number"
                                                                    step="0.01"
                                                                    value={row.diferencia || ""}
                                                                    onChange={(e) => handleCellChange(index, 'diferencia', parseFloat(e.target.value) || 0)}
                                                                    className="w-16 sm:w-20 px-2 py-1 border border-gray-300 rounded text-xs text-right"
                                                                />
                                                            ) : (
                                                                row.diferencia || "-"
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3 text-center border-b">
                                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${row.estado === 'PENDIENTE'
                                                                ? 'bg-yellow-100 text-yellow-800'
                                                                : 'bg-green-100 text-green-800'
                                                                }`}>
                                                                {row.estado}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Resumen de totales - Siempre visible */}
                            <div className="mt-4 sm:mt-6 bg-gray-50 p-3 sm:p-4 rounded-lg flex-shrink-0">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                                    <div className="text-center">
                                        <div className="text-lg sm:text-2xl font-bold text-blue-600">
                                            {formatCurrency(editedRows.reduce((sum, row) => sum + (parseFloat(row.total) || 0), 0))}
                                        </div>
                                        <div className="text-xs sm:text-sm text-gray-600">Total General</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-lg sm:text-2xl font-bold text-yellow-600">
                                            {formatCurrency(editedRows.filter(r => r.estado === 'PENDIENTE').reduce((sum, row) => sum + (parseFloat(row.total) || 0), 0))}
                                        </div>
                                        <div className="text-xs sm:text-sm text-gray-600">Pendientes</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-lg sm:text-2xl font-bold text-green-600">
                                            {formatCurrency(editedRows.filter(r => r.estado === 'LIQUIDADO').reduce((sum, row) => sum + (parseFloat(row.total) || 0), 0))}
                                        </div>
                                        <div className="text-xs sm:text-sm text-gray-600">Liquidados</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {selectedClient && editedRows.length === 0 && (
                        <div className="text-center py-8 sm:py-12 text-gray-500 flex-1 flex items-center justify-center">
                            <p className="text-sm sm:text-base">Esta empresa no tiene adeudos.</p>
                        </div>
                    )}

                    {!selectedClient && (
                        <div className="text-center py-8 sm:py-12 text-gray-500 flex-1 flex items-center justify-center">
                            <p className="text-sm sm:text-base">Selecciona un cliente para ver el histórico de adeudos.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Historico;