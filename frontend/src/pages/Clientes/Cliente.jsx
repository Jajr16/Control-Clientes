import React, { useEffect, useState } from "react";
import ClientSearch from "../../components/elements/searchBar";
import ClientDetails from "../../components/elements/ClienteDetails";
import InmueblesList from "../../components/elements/InmueblesList";
import InmuebleDetails from "../../components/elements/InmuebleDetails";
import { getInmuebles } from "../../api/moduloInmuebles/inmueble";
import { UserPlusIcon } from "@heroicons/react/24/solid";
import { Link } from "react-router-dom";

const Cliente = () => {
    const [selectedClient, setSelectedClient] = useState(null);
    const [inmueblesList, setInmueblesList] = useState(null);
    const [selectedInmueble, setSelectedInmueble] = useState(null);
    const [proveedoresList, setProveedoresSegurosList] = useState(null);
    const [HipotecasList, setHipotecas] = useState(null);

    useEffect(() => {
        // Limpieza completa al cambiar de cliente
        const cleanup = () => {
            setInmueblesList(null);
            setSelectedInmueble(null);
            setProveedoresSegurosList(null);
            setHipotecas(null);
        };

        if (!selectedClient) {
            cleanup();
            return;
        }

        const fetchInmuebles = async () => {
            try {
                const response = await getInmuebles(selectedClient.cif);
                setInmueblesList(response.data);
            } catch (error) {
                console.error("Error fetching inmuebles:", error);
                cleanup();
            }
        };

        fetchInmuebles()
        cleanup();
    }, [selectedClient])

    useEffect(() => {
        setProveedoresSegurosList(null);
    }, [selectedInmueble]);

    return (
        <div className="h-full flex flex-col">
            {/* Barra de búsqueda - altura fija */}
            <div className={`flex-shrink-0 ${selectedClient ? "w-[30%]" : "w-full"} p-2 flex`}>
                <ClientSearch
                    onSelectClient={(c) => setSelectedClient(c)}
                    routeName={'cliente'}
                    fieldsToInclude={[
                        "cif", "nombre", "clave", "nie", "propietario", "telefono", "email",
                        "calle", "numero", "piso", "codigo_postal", "localidad",
                        "num_protocolo", "folio", "hoja", "inscripcion", "notario", "fecha_inscripcion"
                    ]}
                    labelFormat={(c) => `${c.clave} - ${c.nombre}`}
                />
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

            {/* Contenido principal - altura flexible con scroll */}
            <div className="flex-1 relative">
                {/* Imagen de fondo */}
                <div className="absolute inset-0 opacity-30 flex justify-center items-center pointer-events-none">
                    <img src="/src/img/logoRecortado.png" className="h-full w-full object-contain" alt="logo" />
                </div>

                {/* Grid de contenido */}
                <div className="h-full grid grid-cols-[30%_70%]">
                    {/* Columna izquierda */}
                    <div className="flex flex-col">
                        {selectedClient && (
                            <>
                                {/* ClientDetails - altura fija */}
                                <div className="flex-shrink-0">
                                    <ClientDetails client={selectedClient} />
                                </div>
                                {/* InmueblesList - con scroll */}
                                <div className="flex-1 min-h-0 overflow-y-auto">
                                    <InmueblesList 
                                        client={inmueblesList} 
                                        onSelectInmueble={setSelectedInmueble} 
                                    />
                                </div>
                            </>
                        )}
                    </div>

                    {/* Columna derecha - con scroll */}
                    <div className="overflow-y-auto">
                        {selectedClient && (
                            <InmuebleDetails 
                                inmueble={selectedInmueble} 
                                setProveedoresSegurosList={setProveedoresSegurosList} 
                                proveedoresList={proveedoresList}
                                setHipotecas={setHipotecas} 
                                HipotecasList={HipotecasList} 
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cliente;