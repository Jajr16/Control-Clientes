import React, { useState, useEffect } from "react";
import { TrashIcon } from "@heroicons/react/24/solid";

const InmueblesList = ({ client, onSelectInmueble, onDeleteInmueble, selectedInmueble }) => {
    const [isSelected, setSelected] = useState(null);

    // Sincronizar con el inmueble seleccionado desde el padre
    useEffect(() => {
        if (selectedInmueble) {
            setSelected(selectedInmueble.clave_catastral);
        } else {
            setSelected(null);
        }
    }, [selectedInmueble]);

    // Resetear selección cuando cambia la lista de clientes
    useEffect(() => {
        setSelected(null);
    }, [client]);

    const handleSelect = (inmueble) => {
        setSelected(inmueble.clave_catastral);
        onSelectInmueble(inmueble); 
    };

    const handleDelete = async (e, inmueble) => {
        e.stopPropagation(); // Evita que se active el onClick del div
        
        // Si el inmueble a eliminar es el que está seleccionado, limpiamos la selección primero
        if (isSelected === inmueble.clave_catastral) {
            setSelected(null);
        }
        
        if (onDeleteInmueble) {
            await onDeleteInmueble(inmueble.clave_catastral);
        }
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
                    <div className="mb-2 text-sm text-gray-600">
                        {client.length} inmueble{client.length !== 1 ? 's' : ''} encontrado{client.length !== 1 ? 's' : ''}
                    </div>
                    
                    {client.length === 0 ? (
                        <div className="flex-1 flex items-center justify-center">
                            <p className="text-gray-500">El cliente no tiene inmuebles registrados.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {client.map((inmueble, index) => (
                                <div 
                                    key={inmueble.clave_catastral || index} 
                                    className={`border border-black p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                                        isSelected === inmueble.clave_catastral 
                                            ? "bg-secondary-theme border-2 border-blue-500 shadow-md" 
                                            : "bg-options hover:bg-gray-100 hover:shadow-sm"
                                    }`}
                                    onClick={() => handleSelect(inmueble)}
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
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
                                        </div>
                                        
                                        {onDeleteInmueble && (
                                            <button
                                                onClick={(e) => handleDelete(e, inmueble)}
                                                className="ml-2 p-2 text-red-500 hover:text-red-700 hover:bg-red-100 rounded transition-colors duration-200 flex-shrink-0"
                                                title="Eliminar inmueble"
                                            >
                                                <TrashIcon className="h-4 w-4" />
                                            </button>
                                        )}
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