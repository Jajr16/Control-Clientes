import React, { useState } from "react";
import { AtSymbolIcon, PhoneIcon, MapPinIcon, IdentificationIcon, BuildingOfficeIcon, InformationCircleIcon } from "@heroicons/react/24/solid";

const InmueblesList = ({ client, onSelectInmueble }) => {
    const [isSelected, setSelected] = useState(null);

    const handleSelect = (clave_catastral) => {
        setSelected(clave_catastral);
        onSelectInmueble(clave_catastral);
    };

    if (client && Array.isArray(client)) {
        console.log(client); // Para ver los datos que recibes

        return (
            <div className="relative flex w-[100%] h-full p-2">
                <div className="relative w-full h-full flex flex-col border border-black p-2">
                    {client.length === 0 ? (
                        <center><p>El cliente aún no tiene inmuebles.</p></center>
                    ) : (
                        // Iteramos sobre el arreglo de inmuebles
                        client.map((inmueble, index) => (
                            <div key={index} 
                            className={`mb-4 border border-black p-2 rounded-xl bg-options ${isSelected === inmueble.clave_catastral ? "bg-secondary-theme" : ""}`}
                            onClick={() => handleSelect(inmueble.clave_catastral)}>
                                {inmueble.localidad} {inmueble.codigo_postal} {inmueble.calle} {inmueble.piso} {inmueble.numero}
                            </div>
                        ))
                    )}
                </div>
            </div>
        );
    }

    return <div>Loading...</div>; // Si client es null o no existe, mostramos "Cargando..."
};

export default InmueblesList;
