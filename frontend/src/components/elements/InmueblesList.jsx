import React, { useState, useEffect } from "react";

const InmueblesList = ({ client, onSelectInmueble }) => {
    const [isSelected, setSelected] = useState(null);

    useEffect(() => {
        if (!isSelected) {return}

        setSelected(null)

    }, [client])

    const handleSelect = (inmueble) => {
        setSelected(inmueble.clave_catastral);
        onSelectInmueble(inmueble); 
    };

    if (client && Array.isArray(client)) {
        return (
            <div className="relative flex w-[100%] h-full p-2">
                <div className="relative w-full h-full flex flex-col border border-black p-2">
                    {client.length === 0 ? (
                        <center><p>El cliente aún no tiene inmuebles.</p></center>
                    ) : (
                        // Iteramos sobre el arreglo de inmuebles
                        client.map((inmueble, index) => (
                            <div key={index} 
                                className={`mb-4 border border-black p-2 rounded-xl ${isSelected === inmueble.clave_catastral ? "bg-secondary-theme" : "bg-options"}`}
                                onClick={() => handleSelect(inmueble)}>
                                {inmueble.localidad} {inmueble.codigo_postal} {inmueble.calle} {inmueble.piso} {inmueble.numero}
                            </div>
                        ))
                    )}
                </div>
            </div>
        );
    }

    return <div>Cargando...</div>; // Si client es null o no existe, mostramos "Cargando..."
};

export default InmueblesList;
