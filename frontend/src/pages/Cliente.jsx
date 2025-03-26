import React, { useEffect, useState } from "react";
import ClientSearch from "../components/elements/searchBar";
import ClientDetails from "../components/elements/ClienteDetails"; 
import InmueblesList from "../components/elements/InmueblesList"; 
import InmuebleDetails from "../components/elements/InmuebleDetails"; 
import { getInmuebles } from "../api/moduloClientes/inmueble";
import { UserPlusIcon } from "@heroicons/react/24/solid";
import { Link } from "react-router-dom";

const Cliente = () => {
    const [selectedClient, setSelectedClient] = useState(null);
    const [inmueblesList, setInmueblesList] = useState(null);
    const [selectedInmueble, setSelectedInmueble] = useState(null);

    useEffect(() => {
        if (!selectedClient) return;
        
        const fetchInmuebles = async () => {
            const response = await getInmuebles(selectedClient.cif);
            setInmueblesList(response)
        }

        fetchInmuebles()
    }, [selectedClient])

    return (
        <div className="w-full h-full border border-black relative">
            <div className={`flex ${selectedClient ? "w-[30%]" : "w-full"}`}>
                <ClientSearch onSelectClient={setSelectedClient} />
                {!selectedClient && (
                    <div className="flex">
                        <div className="self-center ml-1 mr-4">
                            <Link to="/">
                                <UserPlusIcon className="h-6 w-6" />
                            </Link>
                        </div>
                    </div>
                )}
            </div>

            {/* Contenedor principal con Grid */}
            <div className="relative w-full h-[92%] grid grid-cols-[30%_70%] p-4">
                {/* Imagen de fondo con opacidad */}
                <div className="absolute inset-0 bg-[url('/src/img/logoRecortado.png')] bg-contain bg-no-repeat bg-center opacity-30"></div>

                {/* Columna izquierda con ClientDetails e InmueblesList */}
                <div className="flex flex-col gap-4 h-full">
                    {selectedClient && (
                        <div className="h-full flex flex-col">
                            <ClientDetails client={selectedClient} />
                            <div className="flex-grow">
                                <InmueblesList client={inmueblesList} onSelectInmueble={setSelectedInmueble} />
                            </div>
                        </div>
                    )}
                </div>

                {/* Segunda columna con el segundo InmueblesList (ocupa todo el alto) */}
                <div className="h-full flex">
                    {selectedClient && (
                        <div className="flex-grow h-full">
                            <InmuebleDetails client={selectedInmueble} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Cliente;
