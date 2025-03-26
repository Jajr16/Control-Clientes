import React, { useState } from "react";
import { AtSymbolIcon, PhoneIcon, MapPinIcon, IdentificationIcon, BuildingOfficeIcon, InformationCircleIcon } from "@heroicons/react/24/solid";

const ClientDetails = ({ client }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative flex p-2 w-[100%]">
            <div className="relative flex w-full flex-col border border-black p-2 bg-primary-theme">
                <div className="text-left w-full">
                    <strong className="block break-words">
                        <p className="flex items-center gap-2">
                            <BuildingOfficeIcon className="h-6 w-6" />
                            {client.cif} - {client.nombre} - {client.clave}
                        </p>
                    </strong>
                    <p className="flex break-words whitespace-normal">
                        <MapPinIcon className="h-6 w-6" />
                        {client.calle} {client.numero} {client.piso} {client.codigo_postal} {client.localidad}
                    </p>
                </div>
                <div className="w-full mt-2 break-words whitespace-normal">
                    <p className="flex items-center gap-2">
                        <IdentificationIcon className="h-6 w-6" />
                        {client.nie} - {client.propietario}
                    </p>
                    <p className="flex items-center gap-2">
                        <AtSymbolIcon className="h-6 w-6" />
                        <span className="break-words">{client.email}</span>
                    </p>
                    <p className="flex items-center gap-2">
                        <PhoneIcon className="h-6 w-6" />
                        <span className="break-words">{client.telefono}</span>
                    </p>
                </div>

                {/* Ícono de Información en la esquina inferior derecha */}
                <div className="absolute bottom-2 right-2">
                    <button onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-full hover:bg-gray-300 transition">
                        <InformationCircleIcon className="h-6 w-6 text-gray-700" />
                    </button>

                    {/* Ventana flotante (globo de información) */}
                    {isOpen && (
                        <div className="absolute bottom-10 right-0 w-[700%] bg-white text-black text-sm p-3 rounded-lg shadow-lg border border-gray-300 z-50">
                            <strong>Datos registrales:</strong>
                            <p>No.Protocolo: {client.num_protocolo}</p>
                            <p>Folio: {client.folio}</p>
                            <p>Hoja: {client.hoja}</p>
                            <p>Inscripción: {client.inscripcion}</p>
                            <p>F.Inscripción: {new Date(client.fecha_inscripcion).toISOString().split('T')[0]}</p>
                            <p>Notario: {client.notario}</p>
                            <div className="absolute bottom-0 right-2 translate-y-full w-3 h-3 bg-white border-r border-b border-gray-300 rotate-45"></div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ClientDetails;