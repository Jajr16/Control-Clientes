import React, { useState, useEffect } from "react";

const InmueblesList = ({ client, onSelectInmueble }) => {
    const [isSelected, setSelected] = useState(null);

    useEffect(() => {
        if (!isSelected) return;
        setSelected(null);
    }, [client]);

    const handleSelect = (inmueble) => {
        setSelected(inmueble.clave_catastral);
        onSelectInmueble(inmueble); 
    };

    if (client && Array.isArray(client)) {
        return (
            
            <div className="h-full flex flex-col p-2">
                <div className="relative h-full flex flex-col border border-black p-2 overflow-y-auto">
                    {client.length === 0 ? (
                        <div className="flex-1 flex items-center justify-center">
                            <p>El cliente aún no tiene inmuebles.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {client.map((inmueble, index) => (
                                <div 
                                    key={index} 
                                    className={`border border-black p-2 rounded-xl cursor-pointer ${
                                        isSelected === inmueble.clave_catastral ? "bg-secondary-theme" : "bg-options"
                                    }`}
                                    onClick={() => handleSelect(inmueble)}
                                >
                                    {inmueble.localidad} {inmueble.codigo_postal} {inmueble.calle} {inmueble.piso} {inmueble.numero}
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
            <div>Cargando...</div>
        </div>
    );
};

export default InmueblesList;
