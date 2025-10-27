import React, { useEffect, useState } from "react";
import ClientSearch from "../../components/elements/searchBar";
import ClientDetails from "../../components/elements/ClienteDetails";
import InmueblesList from "../../components/elements/InmueblesList";
import InmuebleDetails from "../../components/elements/InmuebleDetails";
import { getInmuebles, deleteInmueble } from "../../api/moduloInmuebles/inmueble";
import { UserPlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/solid";
import { Link } from "react-router-dom";

const Cliente = () => {
    const [selectedClient, setSelectedClient] = useState(null);
    const [inmueblesList, setInmueblesList] = useState(null);
    const [selectedInmueble, setSelectedInmueble] = useState(null);
    const [proveedoresList, setProveedoresSegurosList] = useState(null);
    const [HipotecasList, setHipotecas] = useState(null);
    const [loading, setLoading] = useState(false);

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
                setLoading(true);
                const response = await getInmuebles(selectedClient.cif);
                setInmueblesList(response.data);
            } catch (error) {
                console.error("Error fetching inmuebles:", error);
                cleanup();
            } finally {
                setLoading(false);
            }
        };

        fetchInmuebles();
    }, [selectedClient])

    useEffect(() => {
        setProveedoresSegurosList(null);
    }, [selectedInmueble]);

    const handleDeleteInmueble = async (claveCatastral) => {
        if (!window.confirm('¿Estás seguro de que quieres eliminar este inmueble?\n\nEsta acción eliminará permanentemente todos los datos del inmueble, incluyendo seguros, proveedores e hipotecas asociadas.\n\nEsta acción no se puede deshacer.')) {
            return;
        }

        try {
            setLoading(true);
            await deleteInmueble(claveCatastral);
            
            // Actualizar la lista de inmuebles
            const response = await getInmuebles(selectedClient.cif);
            setInmueblesList(response.data);
            
            // Limpiar inmueble seleccionado si era el que se eliminó
            if (selectedInmueble && selectedInmueble.clave_catastral === claveCatastral) {
                setSelectedInmueble(null);
                setProveedoresSegurosList(null);
                setHipotecas(null);
            }
            
            alert('Inmueble eliminado correctamente');
        } catch (error) {
            console.error("Error al eliminar inmueble:", error);
            alert('Error al eliminar el inmueble: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    const handleSelectClient = (client) => {
        setSelectedClient(client);
        setSelectedInmueble(null);
        setProveedoresSegurosList(null);
        setHipotecas(null);
    };

    const handleSelectInmueble = (inmueble) => {
        setSelectedInmueble(inmueble);
    };

    return (
        <div className="h-full flex flex-col">
            {/* Barra de búsqueda - altura fija */}
            <div className={`flex-shrink-0 ${selectedClient ? "w-[30%]" : "w-full"} p-2 flex`}>
                <ClientSearch
<<<<<<< HEAD
                    onSelectClient={(c) => setSelectedClient(c)}
                    routeName={'cliente'}
=======
                    onSelectClient={handleSelectClient}
                    routeName={'searchClients'}
>>>>>>> main
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

            {/* Loading overlay */}
            {loading && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-4 rounded-lg">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                        <p className="mt-2 text-gray-700">Procesando...</p>
                    </div>
                </div>
            )}

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
                                        onSelectInmueble={handleSelectInmueble}
                                        onDeleteInmueble={handleDeleteInmueble}
                                        selectedInmueble={selectedInmueble}
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

                {/* Mensaje cuando no hay cliente seleccionado */}
                {!selectedClient && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center text-gray-500">
                            <UserPlusIcon className="h-16 w-16 mx-auto mb-4" />
                            <h2 className="text-xl font-semibold">Selecciona un cliente</h2>
                            <p>Busca y selecciona un cliente para ver sus inmuebles</p>
                        </div>
                    </div>
                )}

                {/* Mensaje cuando hay cliente pero no inmuebles */}
                {selectedClient && inmueblesList && inmueblesList.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center text-gray-500">
                            <BuildingOfficeIcon className="h-16 w-16 mx-auto mb-4" />
                            <h2 className="text-xl font-semibold">No hay inmuebles</h2>
                            <p>Este cliente no tiene inmuebles registrados</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Cliente;