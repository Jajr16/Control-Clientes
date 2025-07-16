import React, { useState, useEffect } from "react";
import { getInmuebleDetails, getInmuebleHipotecas } from "../../api/moduloInmuebles/inmueble";
import { MapPinIcon, IdentificationIcon, ClipboardDocumentListIcon, ShieldCheckIcon,
    LifebuoyIcon, BuildingOfficeIcon, PhoneIcon, AtSymbolIcon, CurrencyEuroIcon,
    CalendarDaysIcon } from "@heroicons/react/24/solid";


const InmuebleDetails = ({ inmueble, setProveedoresSegurosList, proveedoresList, setHipotecas, HipotecasList }) => {

    useEffect(() => {
        if (!inmueble) {
            setProveedoresSegurosList(null);
            return;
        }

        async function fetchHipotecas(CC) {
            try {
                const response = await getInmuebleHipotecas(CC);
                setHipotecas(response)

                return response
            } catch (error) {
                console.error("Error en fetchHipotecas:", error)
                return null                
            }
        }

        async function fetchProveedoresSeguros(CC) {
            try {
                const response = await getInmuebleDetails(CC);
                setProveedoresSegurosList(response);

                return response;
            } catch (error) {
                console.error("Error en fetchProveedoresSeguros:", error);
                return null;
            }
        }
        
        fetchProveedoresSeguros(inmueble.clave_catastral);
        fetchHipotecas(inmueble.clave_catastral);
    }, [inmueble]);

    return (
        <div className="relative flex w-[100%] h-full p-2">
            <div className="relative w-full h-full flex flex-col border border-black p-2">
                <div className={`w-full h-full p-3 ${proveedoresList == null ? null : "bg-white"}`}>

                    {/* Contenedor flexible para Seguros, Proveedores y el nuevo div */}
                    <div className="flex flex-col h-full">
                        {/* Contenedor de Seguros */}
                        {proveedoresList === null ? null :
                            proveedoresList.seguros.length === 0 ? (
                                <>
                                    <h4 className="text-2xl font-bold">Seguros</h4>
                                    <div>El inmueble no cuenta con ningún seguro.</div>
                                </>
                            ) : (
                                <>
                                    <h4 className="text-2xl font-bold">Seguros</h4>
                                    <div className="flex-1 overflow-y-auto mt-5">
                                        {proveedoresList.seguros.map((seguro, index) => (
                                            <div className="border border-black rounded-xl p-2 mb-3" key={index}>
                                                <div className="grid grid-cols-3 gap-4">
                                                    <div className="flex items-center bg-gray-100 p-3">
                                                        <ShieldCheckIcon className="h-6 w-6 mr-2" />
                                                        {seguro.tipo_seguro}
                                                    </div>
                                                    <div className="flex items-center bg-gray-100 p-3">
                                                        <BuildingOfficeIcon className="h-6 w-6 mr-2" />
                                                        {seguro.empresa_seguro}
                                                    </div>
                                                    <div className="flex items-center bg-gray-100 p-3">
                                                        <PhoneIcon className="h-6 w-6 mr-2" />
                                                        {seguro.telefono}
                                                    </div>
                                                    <div className="flex items-center bg-gray-200 p-3">
                                                        <AtSymbolIcon className="h-6 w-6 mr-2" />
                                                        {seguro.email}
                                                    </div>
                                                    <div className="flex items-center bg-gray-200 p-3">
                                                        <ClipboardDocumentListIcon className="h-6 w-6" />
                                                        <b className="mr-2">POLIZA:</b> {seguro.poliza}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )
                        }

                        {/* Contenedor de Proveedores */}
                        {proveedoresList === null ? null :
                            proveedoresList.proveedores.length === 0 ? (
                                <>
                                    <h4 className="text-2xl font-bold">Proveedores</h4>
                                    <div>El inmueble no cuenta con ningún proveedor.</div>
                                </>
                            ) : (
                                <>
                                    <h4 className="text-2xl font-bold">Proveedores</h4>
                                    <div className="flex-1 overflow-y-auto mt-5">
                                        {proveedoresList.proveedores.map((proveedor, index) => (
                                            <div className="border border-black rounded-xl p-2 mb-3" key={index}>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="flex items-center bg-gray-100 p-3">
                                                        <ShieldCheckIcon className="h-6 w-6 mr-2" />
                                                        {proveedor.tipo_servicio}
                                                    </div>
                                                    <div className="flex items-center bg-gray-100 p-3">
                                                        <BuildingOfficeIcon className="h-6 w-6 mr-2" />
                                                        {proveedor.nombre}
                                                    </div>
                                                    <div className="flex items-center bg-gray-100 p-3">
                                                        <PhoneIcon className="h-6 w-6 mr-2" />
                                                        {proveedor.telefono}
                                                    </div>
                                                    <div className="flex items-center bg-gray-200 p-3">
                                                        <AtSymbolIcon className="h-6 w-6 mr-2" />
                                                        {proveedor.email}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )
                        }
                        
                        {/* Sección de los datos registrales del inmueble */}
                        {inmueble && (
                            <>
                                <h4 className="text-2xl font-bold">Datos Registrales</h4>
                                <div className="flex-1 overflow-y-auto mt-5">
                                    <div className="border border-black rounded-xl p-2">
                                        <div className="grid grid-cols-4 gap-4">
                                            <div className="flex items-center bg-gray-100 p-3">
                                                <b className="mr-2">Clave catastral:</b>{inmueble.clave_catastral}
                                            </div>
                                            <div className="flex items-center bg-gray-100 p-3">
                                                <b className="mr-2">Protocolo:</b>{inmueble.num_protocolo}
                                            </div>
                                            <div className="flex items-center bg-gray-100 p-3">
                                                <b className="mr-2">Folio:</b>{inmueble.folio}
                                            </div>
                                            <div className="flex items-center bg-gray-100 p-3">
                                                <b className="mr-2">Hoja:</b>{inmueble.hoja}
                                            </div>
                                            <div className="flex items-center bg-gray-200 p-3">
                                                <b className="mr-2">Inscripción:</b>{inmueble.inscripcion}
                                            </div>
                                            <div className="flex items-center bg-gray-200 p-3">
                                                <b className="mr-2">Fecha Ins.:</b>{new Date(inmueble.fecha_inscripcion).toLocaleDateString('es-ES')}
                                            </div>
                                            <div className="flex items-center bg-gray-200 p-3">
                                                <b className="mr-2">Notario:</b> {inmueble.notario}
                                            </div>
                                            <div className="flex items-center bg-gray-200 p-3">
                                                <b className="mr-2">Fecha adquisición:</b>{new Date(inmueble.fecha_adquisicion).toLocaleDateString('es-ES')}
                                            </div>
                                            <div className="flex items-center bg-gray-200 p-3">
                                                <b className="mr-2">Valor adquisición:</b>{inmueble.valor_adquisicion.toLocaleString('de-DE')}
                                            </div>

                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Sección para hipotecas */}
                        {(HipotecasList === null || HipotecasList.length === 0) ? (
                            <>
                                <h4 className="text-2xl font-bold">Hipotecas</h4>
                                <div className="flex-1">El inmueble no tiene hipotecas.</div>
                            </>
                            ) : (
                            <>
                                <h4 className="text-2xl font-bold">Hipotecas</h4>
                                <div className="flex-1 overflow-y-auto mt-5">
                                    <div className="border border-black rounded-xl p-2">
                                    {HipotecasList.map((hipoteca, index) => (
                                        <div className="grid grid-cols-4 gap-4">
                                            <div className="flex items-center bg-gray-100 p-3">
                                                <b className="mr-2">Banco:</b>{hipoteca.banco_prestamo}
                                            </div>
                                            <div className="flex items-center bg-gray-100 p-3">
                                                <b className="mr-2">Prestamo:</b>{hipoteca.prestamo.toLocaleString('de-DE')}
                                            </div>
                                            <div className="flex items-center bg-gray-200 p-3">
                                                <b className="mr-2">Fecha Prestamo:</b>{new Date(hipoteca.fecha_hipoteca).toLocaleDateString('es-ES')}
                                            </div>
                                            <div className="flex items-center bg-gray-100 p-3">
                                                <b className="mr-2">Cuota:</b>{hipoteca.cuota.toLocaleString('de-DE')}
                                            </div>
                                        </div>
                                    ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InmuebleDetails;
