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
        <div className="w-full h-full">
            <div className={`flex ${selectedClient ? "w-[30%]" : "w-full"}`}>
                <ClientSearch
                    onSelectClient={(c) => setSelectedClient(c)}
                    routeName={'searchClients'}
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
                            <InmuebleDetails inmueble={selectedInmueble} setProveedoresSegurosList={setProveedoresSegurosList} proveedoresList={proveedoresList}
                                setHipotecas={setHipotecas} HipotecasList={HipotecasList} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Cliente;
