import React, { useState, useEffect } from "react";
import { TrashIcon, PencilIcon, CheckIcon, XMarkIcon } from "@heroicons/react/24/solid";

const InmueblesList = ({ 
    client, 
    onSelectInmueble, 
    onDeleteInmueble, 
    onEditInmueble, 
    selectedInmueble,
    isEditingActive, 
}) => {
    const [isSelected, setSelected] = useState(null);
    const [editingInmueble, setEditingInmueble] = useState(null);
    const [editFormData, setEditFormData] = useState({});

    useEffect(() => {
        if (selectedInmueble) {
            setSelected(selectedInmueble.clave_catastral);
        } else {
            setSelected(null);
        }
    }, [selectedInmueble]);

    useEffect(() => {
        setSelected(null);
        setEditingInmueble(null);
    }, [client]);

    const handleSelect = (inmueble) => {
        if (editingInmueble === inmueble.clave_catastral) return;
        
        setSelected(inmueble.clave_catastral);
        onSelectInmueble(inmueble); 
    };

    const handleDelete = async (e, inmueble) => {
        e.stopPropagation(); 
        
        if (isSelected === inmueble.clave_catastral) {
            setSelected(null);
        }
        
        if (onDeleteInmueble) {
            await onDeleteInmueble(inmueble.clave_catastral);
        }
    };

    const handleEdit = (e, inmueble) => {
        e.stopPropagation();
        setEditingInmueble(inmueble.clave_catastral);
        setEditFormData({ ...inmueble });
    };

    const handleSaveEdit = async (e) => {
        e.stopPropagation();
        if (onEditInmueble && editingInmueble) {
            await onEditInmueble(editingInmueble, editFormData);
        }
        setEditingInmueble(null);
        setEditFormData({});
    };

    const handleCancelEdit = (e) => {
        e.stopPropagation();
        setEditingInmueble(null);
        setEditFormData({});
    };

    const handleInputChange = (e, field) => {
        const value = e.target.value;
        setEditFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const formatAddress = (inmueble) => {
        const parts = [
            inmueble.calle,
            inmueble.numero,
            inmueble.piso,
            `${inmueble.codigo_postal} ${inmueble.localidad}`
        ].filter(part => part && part !== "" && part !== " ");
        
        return parts.join(", ");
    };

    if (client && Array.isArray(client)) {
        return (
            <div className="h-full flex flex-col p-2">
                <div className="relative h-full flex flex-col border border-black p-2 overflow-y-auto">
                    
                    {isEditingActive && (
                        <div className="mb-3 p-3 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 rounded">
                            <p className="font-semibold text-sm">Modo de edición activo</p>
                            <p className="text-xs mt-1">Guarda o cancela los cambios antes de seleccionar otro inmueble</p>
                        </div>
                    )}

                    {client.length === 0 ? (
                        <div className="flex-1 flex items-center justify-center">
                            <p className="text-gray-500">El cliente no tiene inmuebles registrados.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {client.map((inmueble, index) => (
                                <div 
                                    key={inmueble.clave_catastral || index} 
                                    className={`border border-black p-3 rounded-xl transition-all duration-200 ${
                                        isSelected === inmueble.clave_catastral 
                                            ? "bg-secondary-theme border-2 border-blue-500 shadow-md" 
                                            : "bg-options hover:bg-gray-100 hover:shadow-sm"
                                    } ${
                                        editingInmueble === inmueble.clave_catastral 
                                            ? "bg-yellow-50 border-yellow-400" 
                                            : ""
                                    } ${
                                        isEditingActive && isSelected !== inmueble.clave_catastral
                                            ? "opacity-50 cursor-not-allowed"
                                            : "cursor-pointer"
                                    }`}
                                    onClick={() => !isEditingActive && handleSelect(inmueble)} 
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            {editingInmueble === inmueble.clave_catastral ? (
                                                // Formulario de edición
                                                <div className="space-y-2">
                                                    <div>
                                                        <label className="text-xs text-gray-600">Calle:</label>
                                                        <input
                                                            type="text"
                                                            value={editFormData.calle || ''}
                                                            onChange={(e) => handleInputChange(e, 'calle')}
                                                            className="w-full p-1 border border-gray-300 rounded text-sm"
                                                            onClick={(e) => e.stopPropagation()}
                                                        />
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <div>
                                                            <label className="text-xs text-gray-600">Número:</label>
                                                            <input
                                                                type="text"
                                                                value={editFormData.numero || ''}
                                                                onChange={(e) => handleInputChange(e, 'numero')}
                                                                className="w-full p-1 border border-gray-300 rounded text-sm"
                                                                onClick={(e) => e.stopPropagation()}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="text-xs text-gray-600">Piso:</label>
                                                            <input
                                                                type="text"
                                                                value={editFormData.piso || ''}
                                                                onChange={(e) => handleInputChange(e, 'piso')}
                                                                className="w-full p-1 border border-gray-300 rounded text-sm"
                                                                onClick={(e) => e.stopPropagation()}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <div>
                                                            <label className="text-xs text-gray-600">CP:</label>
                                                            <input
                                                                type="text"
                                                                value={editFormData.codigo_postal || ''}
                                                                onChange={(e) => handleInputChange(e, 'codigo_postal')}
                                                                className="w-full p-1 border border-gray-300 rounded text-sm"
                                                                onClick={(e) => e.stopPropagation()}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="text-xs text-gray-600">Localidad:</label>
                                                            <input
                                                                type="text"
                                                                value={editFormData.localidad || ''}
                                                                onChange={(e) => handleInputChange(e, 'localidad')}
                                                                className="w-full p-1 border border-gray-300 rounded text-sm"
                                                                onClick={(e) => e.stopPropagation()}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="text-xs text-gray-600">Valor:</label>
                                                        <input
                                                            type="number"
                                                            value={editFormData.valor_adquisicion || ''}
                                                            onChange={(e) => handleInputChange(e, 'valor_adquisicion')}
                                                            className="w-full p-1 border border-gray-300 rounded text-sm"
                                                            onClick={(e) => e.stopPropagation()}
                                                        />
                                                    </div>
                                                </div>
                                            ) : (
                                                // Vista normal
                                                <>
                                                    <div className="font-semibold text-gray-800 mb-1">
                                                        {formatAddress(inmueble)}
                                                    </div>
                                                    {inmueble.clave_catastral && (
                                                        <div className="text-xs text-gray-600 mb-1">
                                                            <strong>Clave:</strong> {inmueble.clave_catastral}
                                                        </div>
                                                    )}
                                                    {inmueble.valor_adquisicion && (
                                                        <div className="text-sm text-gray-700">
                                                            <strong>Valor:</strong> {inmueble.valor_adquisicion?.toLocaleString('de-DE')} €
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                        
                                        {/* ✅ MODIFICADO: Deshabilitar botones cuando hay edición global activa */}
                                        <div className="flex space-x-1 ml-2">
                                            {editingInmueble === inmueble.clave_catastral ? (
                                                <>
                                                    <button
                                                        onClick={handleSaveEdit}
                                                        className="p-2 text-green-500 hover:text-green-700 hover:bg-green-100 rounded transition-colors duration-200 flex-shrink-0"
                                                        title="Guardar cambios"
                                                    >
                                                        <CheckIcon className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={handleCancelEdit}
                                                        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors duration-200 flex-shrink-0"
                                                        title="Cancelar edición"
                                                    >
                                                        <XMarkIcon className="h-4 w-4" />
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={(e) => handleEdit(e, inmueble)}
                                                        disabled={isEditingActive} // ✅ NUEVO
                                                        className={`p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-100 rounded transition-colors duration-200 flex-shrink-0 ${
                                                            isEditingActive ? 'opacity-30 cursor-not-allowed' : ''
                                                        }`}
                                                        title="Editar inmueble"
                                                    >
                                                        <PencilIcon className="h-4 w-4" />
                                                    </button>
                                                    {onDeleteInmueble && (
                                                        <button
                                                            onClick={(e) => handleDelete(e, inmueble)}
                                                            disabled={isEditingActive} 
                                                            className={`p-2 text-red-500 hover:text-red-700 hover:bg-red-100 rounded transition-colors duration-200 flex-shrink-0 ${
                                                                isEditingActive ? 'opacity-30 cursor-not-allowed' : ''
                                                            }`}
                                                            title="Eliminar inmueble"
                                                        >
                                                            <TrashIcon className="h-4 w-4" />
                                                        </button>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex items-center justify-center">
            <div className="text-gray-500">Cargando inmuebles...</div>
        </div>
    );
};

export default InmueblesList;