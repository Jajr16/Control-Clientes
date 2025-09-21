import React, { useEffect, useState } from "react";
import ClientSearch from "../../components/elements/searchBar";
import { getAdeudoEmpresa, createExcel } from "../../api/moduloAdeudos/adeudos";
import { CheckIcon, XMarkIcon, EditIcon, TrashIcon } from '../../components/common/Icons';
import { useAdeudosManager } from '../../hooks/useAdeudosManager';
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/solid";
import { Extendible } from "../../components/elements/Historico/Expandible";
import { InfoSaldo } from "../../components/elements/Historico/InfoSaldo";
import { formatCurrency } from "../../hooks/Formateo";

const Historico = () => {
    const [liquidaciones, setLiquidaciones] = useState([]);
    const [selectedTab, setSelectedTab] = useState(0);
    const [anticipoGeneral, setAnticipoGeneral] = useState(null);

    const { saldoInfo, setSaldoInfo, SaldoInfo } = InfoSaldo();

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

    const {
        // Estados
        expandedRows,

        // Funciones
        isRMM,
        toggleExpansion
    } = Extendible();

    useEffect(() => {
        if (!selectedClient) {
            resetState();
            setLiquidaciones([]);
            setSelectedTab(0);
            setSaldoInfo(null);
            return;
        }

        const fetchGetHistorico = async () => {
            try {
                const response = await getAdeudoEmpresa(selectedClient.cif, { agrupado: true });

                if (!response.success) {
                    alert(response.error);
                    return;
                }
                console.log(response)

                setLiquidaciones(response.data.liquidaciones);
                setAnticipoGeneral(response.data.anticipo);
                setSaldoInfo(response.data.resumen?.saldo_info || response.data.anticipo);
                setSelectedTab(0);

                // Inicializar con la primera pestaña si hay datos
                if (response.data.liquidaciones.length > 0) {
                    initializeData(response.data.liquidaciones[0].adeudos, response.data.anticipo);
                }

            } catch (error) {
                console.error("Error fetching historico adeudos:", error);
                resetState();
            }
        };

        fetchGetHistorico();
    }, [selectedClient]);

    const handleTabChange = (tabIndex) => {
        if (hasChanges) {
            const confirmChange = window.confirm("Tienes cambios sin guardar. ¿Deseas continuar sin guardar?");
            if (!confirmChange) return;
        }

        setSelectedTab(tabIndex);
        if (liquidaciones[tabIndex]) {
            initializeData(liquidaciones[tabIndex].adeudos, anticipoGeneral);
        }
    };

    const currentLiquidacion = liquidaciones[selectedTab];

    // Función para obtener el nombre de la pestaña
    const getTabName = (liquidacion) => {
        if (liquidacion.num_liquidacion === 'pendientes') {
            return 'Pendientes';
        }
        return `Liq. ${liquidacion.num_liquidacion}`;
    };

    // Función para obtener el color de la pestaña
    const getTabColor = (liquidacion, isActive) => {
        if (liquidacion.num_liquidacion === 'pendientes') {
            return isActive
                ? 'border-yellow-500 text-yellow-600 bg-yellow-50'
                : 'border-transparent text-gray-500 hover:text-yellow-600 hover:border-yellow-300';
        }
        return isActive
            ? 'border-blue-500 text-blue-600 bg-blue-50'
            : 'border-transparent text-gray-500 hover:text-blue-600 hover:border-blue-300';
    };

    return (
        <div className="w-full h-[calc(100vh-7rem)] bg-gray-50 flex flex-col overflow-hidden">
            <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 lg:p-6 flex flex-col h-full max-h-full overflow-hidden">
                {/* Header con búsqueda y anticipo - Responsive */}
                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-4 sm:mb-6 space-y-4 lg:space-y-0 flex-shrink-0">
                    <div className="w-full lg:w-[40%] min-w-0">
                        <ClientSearch
                            onSelectClient={setSelectedClient}
                            routeName={'adeudos/empresa_adeudo'}
                            labelFormat={(c) => `${c.clave} - ${c.nombre}`}
                        />
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 flex-shrink-0">
                        <div className="flex items-center w-full sm:w-auto">
                            <label htmlFor="anticipo" className="font-bold mr-2 text-sm sm:text-base whitespace-nowrap">
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

                {/* Sistema de Pestañas */}
                {selectedClient && liquidaciones.length > 0 && (
                    <div className="mb-4 flex-shrink-0">
                        <div className="border-b border-gray-200">
                            <nav className="-mb-px flex space-x-2 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300">
                                {liquidaciones.map((liquidacion, index) => (
                                    <button
                                        key={liquidacion.num_liquidacion}
                                        onClick={() => handleTabChange(index)}
                                        className={`whitespace-nowrap py-2 px-3 border-b-2 font-medium text-sm transition-colors flex-shrink-0 ${getTabColor(liquidacion, selectedTab === index)}`}
                                    >
                                        {getTabName(liquidacion)}
                                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                            {liquidacion.adeudos.length}
                                        </span>
                                    </button>
                                ))}
                            </nav>
                        </div>
                    </div>
                )}

                {/* Controles de selección - Responsive */}
                {selectedClient && currentLiquidacion && editedRows.length > 0 && (
                    <div className="mb-4 bg-gray-50 p-3 sm:p-4 rounded-lg flex-shrink-0">
                        <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 min-w-0">
                                <span className="text-xs sm:text-sm text-gray-600 flex-shrink-0">
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
                                            onClick={() => { handleDeleteSelected(); }}
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
                                        onClick={async () => {
                                            const success = await handleSaveChanges();
                                            if (success) {
                                                // Refrescar datos desde servidor
                                                const response = await getAdeudoEmpresa(selectedClient.cif, { agrupado: true });
                                                if (response.success) {
                                                    setLiquidaciones(response.data.liquidaciones);
                                                    setAnticipoGeneral(response.data.anticipo);
                                                    setSaldoInfo(response.data.resumen?.saldo_info || response.data.anticipo);
                                                    // Reinicializar la pestaña actual con datos frescos
                                                    initializeData(response.data.liquidaciones[selectedTab].adeudos, response.data.anticipo);
                                                }
                                            }
                                        }}
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
                <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                    {/* Tabla de adeudos - Con altura controlada */}
                    {selectedClient && currentLiquidacion && editedRows.length > 0 && (
                        <div className="flex flex-col h-full min-h-0">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-4 flex-shrink-0">
                                <h2 className="text-lg sm:text-xl font-semibold break-words min-w-0">
                                    {getTabName(currentLiquidacion)} - {selectedClient.nombre}
                                </h2>
                                <button
                                    type="button"
                                    onClick={() => createExcel(selectedClient.cif, selectedClient.nombre)}
                                    className="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium 
                                    rounded-lg text-sm px-5 py-2.5 flex-shrink-0 whitespace-nowrap"
                                >
                                    Descargar Excel
                                </button>
                            </div>

                            {/* Contenedor de tabla con scroll controlado */}
                            <div className="flex-1 overflow-auto border border-gray-200 rounded-lg min-h-0">
                                <table className="min-w-full bg-white">
                                    <thead className="bg-gray-50 sticky top-0 z-20">
                                        <tr>
                                            <th className="sticky left-0 z-30 bg-gray-50 px-2 sm:px-4 py-2 sm:py-3 text-left border-b border-r border-gray-200 w-10">
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
                                            <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase border-b whitespace-nowrap min-w-[80px]">
                                                Liq. #
                                            </th>
                                            <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase border-b whitespace-nowrap min-w-[120px]">
                                                Concepto
                                            </th>
                                            <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase border-b whitespace-nowrap min-w-[120px]">
                                                Proveedor
                                            </th>
                                            <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase border-b whitespace-nowrap min-w-[100px]">
                                                Fecha
                                            </th>
                                            <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase border-b whitespace-nowrap min-w-[100px]">
                                                # Factura
                                            </th>
                                            <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase border-b whitespace-nowrap min-w-[100px]">
                                                Protocolo
                                            </th>
                                            <th className="px-2 sm:px-4 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase border-b whitespace-nowrap min-w-[100px]">
                                                Base
                                            </th>
                                            <th className="px-2 sm:px-4 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase border-b whitespace-nowrap min-w-[80px]">
                                                IVA
                                            </th>
                                            <th className="px-2 sm:px-4 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase border-b whitespace-nowrap min-w-[80px]">
                                                Ret.
                                            </th>
                                            <th className="px-2 sm:px-4 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase border-b whitespace-nowrap min-w-[80px]">
                                                C. sin IVA
                                            </th>
                                            <th className="px-2 sm:px-4 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase border-b whitespace-nowrap min-w-[100px]">
                                                Total
                                            </th>
                                            <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase border-b whitespace-nowrap min-w-[120px]">
                                                Estado
                                            </th>
                                            <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase border-b whitespace-nowrap w-10"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {editedRows.map((row, index) => {
                                            const isSelected = selectedRows.has(row._internal_id);
                                            const isEditing = editingRows.has(row._internal_id);
                                            const showRMM = isRMM(row.proveedor);
                                            const isExpanded = expandedRows.has(row._internal_id);

                                            return (
                                                <>
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
                                                                    className="w-full max-w-[60px] px-2 py-1 border border-gray-300 rounded text-xs"
                                                                />
                                                            ) : (
                                                                <span className="block truncate max-w-[60px]" title={row.num_liquidacion || '-'}>
                                                                    {row.num_liquidacion || '-'}
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900 border-b relative group">
                                                            {isEditing ? (
                                                                <input
                                                                    type="text"
                                                                    value={row.concepto || ""}
                                                                    onChange={(e) => handleCellChange(index, 'concepto', e.target.value)}
                                                                    className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                                                                />
                                                            ) : (
                                                                <>
                                                                    <span
                                                                        className="block truncate max-w-[120px] cursor-help"
                                                                        title={row.concepto}
                                                                    >
                                                                        {row.concepto}
                                                                    </span>
                                                                </>
                                                            )}
                                                        </td>
                                                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900 border-b relative group">
                                                            {isEditing ? (
                                                                <input
                                                                    type="text"
                                                                    value={row.proveedor || ""}
                                                                    onChange={(e) => handleCellChange(index, 'proveedor', e.target.value)}
                                                                    className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                                                                />
                                                            ) : (
                                                                <>
                                                                    <span
                                                                        className="block truncate max-w-[120px] cursor-help"
                                                                        title={row.proveedor}
                                                                    >
                                                                        {row.proveedor}
                                                                    </span>
                                                                </>
                                                            )}
                                                        </td>
                                                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900 border-b">
                                                            {isEditing ? (
                                                                <input
                                                                    type="date"
                                                                    value={row.ff || ""}
                                                                    onChange={(e) => handleCellChange(index, 'ff', e.target.value)}
                                                                    className="w-full max-w-[110px] px-2 py-1 border border-gray-300 rounded text-xs"
                                                                />
                                                            ) : (
                                                                <span className="whitespace-nowrap">{row.ff}</span>
                                                            )}
                                                        </td>
                                                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900 border-b">
                                                            {isEditing ? (
                                                                <input
                                                                    type="text"
                                                                    value={row.num_factura || ""}
                                                                    onChange={(e) => handleCellChange(index, 'num_factura', e.target.value)}
                                                                    className="w-full max-w-[80px] px-2 py-1 border border-gray-300 rounded text-xs"
                                                                />
                                                            ) : (
                                                                <span className="block truncate max-w-[80px]" title={row.num_factura}>
                                                                    {row.num_factura}
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900 border-b">
                                                            {isEditing ? (
                                                                <input
                                                                    type="text"
                                                                    value={row.num_protocolo || row.num_entrada || ""}
                                                                    onChange={(e) => handleCellChange(index, 'num_protocolo', e.target.value)}
                                                                    className="w-full max-w-[80px] px-2 py-1 border border-gray-300 rounded text-xs"
                                                                />
                                                            ) : (
                                                                <span className="block truncate max-w-[80px]" title={row.num_protocolo || row.num_entrada || "-"}>
                                                                    {row.num_protocolo || row.num_entrada || "-"}
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900 text-right border-b">
                                                            {isEditing ? (
                                                                <input
                                                                    type="number"
                                                                    step="0.01"
                                                                    value={row.importe || ""}
                                                                    onChange={(e) => handleCellChange(index, 'importe', parseFloat(e.target.value) || 0)}
                                                                    className="w-16 px-1 py-1 border border-gray-300 rounded text-xs text-right"
                                                                />
                                                            ) : (
                                                                <span className="whitespace-nowrap">{formatCurrency(row.importe)}</span>
                                                            )}
                                                        </td>
                                                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900 text-right border-b">
                                                            <span className="whitespace-nowrap">{formatCurrency(row.iva)}</span>
                                                        </td>
                                                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900 text-right border-b">
                                                            <span className="whitespace-nowrap">{formatCurrency(row.retencion)}</span>
                                                        </td>
                                                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900 text-right border-b">
                                                            {isEditing ? (
                                                                <input
                                                                    type="number"
                                                                    step="0.01"
                                                                    value={row.cs_iva || ""}
                                                                    onChange={(e) => handleCellChange(index, 'cs_iva', parseFloat(e.target.value) || 0)}
                                                                    className="w-16 px-1 py-1 border border-gray-300 rounded text-xs text-right"
                                                                />
                                                            ) : (
                                                                <span className="whitespace-nowrap">{formatCurrency(row.cs_iva)}</span>
                                                            )}
                                                        </td>
                                                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium text-gray-900 text-right border-b">
                                                            <span className="whitespace-nowrap">{formatCurrency(row.total)}</span>
                                                        </td>
                                                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-center border-b">
                                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${row.estado === 'LIQUIDACIÓN EN CURSO'
                                                                ? 'bg-amber-100 text-amber-800'
                                                                : row.estado === 'PENDIENTE DE ENVIAR'
                                                                    ? 'bg-blue-100 text-blue-800'
                                                                    : row.estado === 'ENVIADO AL CLIENTE'
                                                                        ? 'bg-violet-100 text-violet-800'
                                                                        : 'bg-emerald-100 text-emerald-800'
                                                                }`}>
                                                                {row.estado}
                                                            </span>
                                                        </td>
                                                        {showRMM && (
                                                            <td className="px-2 py-2 text-center border-b">
                                                                <button
                                                                    onClick={() => { toggleExpansion(row._internal_id) }}
                                                                    className="p-1 hover:bg-gray-100 rounded"
                                                                >
                                                                    {isExpanded ? (
                                                                        <ChevronUpIcon className="h-4 w-4" />
                                                                    ) : (
                                                                        <ChevronDownIcon className="h-4 w-4" />
                                                                    )}
                                                                </button>
                                                            </td>
                                                        )}
                                                    </tr>

                                                    {showRMM && isExpanded && (
                                                        <tr className="bg-blue-25 border-l-4 border-l-blue-500">
                                                            <td colSpan="14" className="px-4 py-4 bg-gradient-to-r from-blue-25 to-blue-50">
                                                                <div className="bg-white rounded-lg p-4 border border-blue-200 shadow-sm max-w-full overflow-hidden">
                                                                    <div className="flex justify-between items-center mb-3">
                                                                        <h4 className="text-sm font-semibold text-blue-800 flex items-center">
                                                                            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                                                                            Datos Registro Mercantil de Madrid
                                                                        </h4>
                                                                    </div>
                                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 overflow-hidden">
                                                                        <div>
                                                                            <label className="block text-xs font-medium text-gray-600 mb-1">
                                                                                Anticipo Pagado
                                                                            </label>
                                                                            {isEditing ? (
                                                                                <input
                                                                                    type="number"
                                                                                    step="0.01"
                                                                                    value={row.anticipo_pagado || ''}
                                                                                    onChange={(e) => handleCellChange(index, 'anticipo_pagado', parseFloat(e.target.value) || 0)}
                                                                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                                                />
                                                                            ) : (
                                                                                <div className="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded truncate">
                                                                                    {formatCurrency(row.anticipo_pagado) || '-'}
                                                                                </div>
                                                                            )}
                                                                        </div>

                                                                        <div>
                                                                            <label className="block text-xs font-medium text-gray-600 mb-1">
                                                                                Fecha Anticipo
                                                                            </label>
                                                                            {isEditing ? (
                                                                                <input
                                                                                    type="date"
                                                                                    value={row.fecha_anticipo || ''}
                                                                                    onChange={(e) => handleCellChange(index, 'fecha_anticipo', e.target.value)}
                                                                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                                                />
                                                                            ) : (
                                                                                <div className="text-sm text-gray-800 bg-gray-50 px-2 py-1 rounded truncate">
                                                                                    {row.fecha_anticipo || '-'}
                                                                                </div>
                                                                            )}
                                                                        </div>

                                                                        <div>
                                                                            <label className="block text-xs font-medium text-gray-600 mb-1">
                                                                                Diferencia
                                                                            </label>
                                                                            {isEditing ? (
                                                                                <input
                                                                                    type="number"
                                                                                    step="0.01"
                                                                                    value={row.diferencia || ''}
                                                                                    onChange={(e) => handleCellChange(index, 'diferencia', parseFloat(e.target.value) || 0)}
                                                                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                                                />
                                                                            ) : (
                                                                                <div className={`text-sm font-medium px-2 py-1 rounded truncate ${(row.diferencia || 0) >= 0
                                                                                    ? 'text-red-600 bg-red-50'
                                                                                    : 'text-green-600 bg-green-50'
                                                                                    }`}>
                                                                                    {formatCurrency(row.diferencia) || '-'}
                                                                                </div>
                                                                            )}
                                                                        </div>

                                                                        <div>
                                                                            <label className="block text-xs font-medium text-gray-600 mb-1">
                                                                                Fecha Devolución
                                                                            </label>
                                                                            {isEditing ? (
                                                                                <input
                                                                                    type="date"
                                                                                    value={row.fecha_devolucion_diferencia || ''}
                                                                                    onChange={(e) => handleCellChange(index, 'fecha_devolucion_diferencia', e.target.value)}
                                                                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                                                />
                                                                            ) : (
                                                                                <div className="text-sm text-gray-800 bg-gray-50 px-2 py-1 rounded truncate">
                                                                                    {row.fecha_devolucion_diferencia || '-'}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Resumen de totales compacto */}
                            {currentLiquidacion && (
                                <div className="mt-4 bg-gray-50 p-3 rounded-lg flex-shrink-0">
                                    {/* Información del Saldo */}
                                    {selectedClient && (saldoInfo || anticipoGeneral) && (
                                        // <div className="mb-4 bg-white rounded-lg border-2 border-gray-200 p-4 flex-shrink-0">
                                            <SaldoInfo saldoInfo={saldoInfo} anticipoGeneral={anticipoGeneral} />
                                        // </div>
                                    )}
                                    <div className="mt-2 text-center">
                                        <span className="text-xs text-gray-500">
                                            {currentLiquidacion.resumen.total} registros
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {selectedClient && liquidaciones.length === 0 && (
                        <div className="text-center py-8 text-gray-500 flex-1 flex items-center justify-center">
                            <p className="text-sm">Esta empresa no tiene adeudos.</p>
                        </div>
                    )}

                    {!selectedClient && (
                        <div className="text-center py-8 text-gray-500 flex-1 flex items-center justify-center">
                            <p className="text-sm">Selecciona un cliente para ver el histórico de adeudos.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Historico;