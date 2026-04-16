import { useState, useContext } from "react";
import { AtSymbolIcon, PhoneIcon, MapPinIcon, IdentificationIcon, BuildingOfficeIcon, InformationCircleIcon } from "@heroicons/react/24/solid";
import { limpiarDatosVacios } from "../../../utils/limpiarDatos";
import { inmuebleContext } from "../pages/Cliente";

const ClientDetails = () => {
    const controller = useContext(inmuebleContext)

    if(!controller) return null;

    const { cliente } = controller; 

    const [isOpen, setIsOpen] = useState(false);
    const data = limpiarDatosVacios(cliente.selectedClient) || {}
    
    return (
        <div className="relative flex p-2 w-[100%]">
            <div className="relative flex w-full flex-col border border-black p-2 bg-primary-theme">
                <div className="text-left w-full">
                    <strong className="block break-words">
                        <p className="flex items-center gap-2">
                            <BuildingOfficeIcon className="h-6 w-6" />
                            CIF: {data?.cif || "(SIN CIF)"} - CLIENTE: {data?.nombre || "(SIN NOMBRE)"} - CLAVE: {data?.clave || "(SIN CLAVE)"}
                        </p>
                    </strong>
                    <p className="flex break-words whitespace-normal">
                        <MapPinIcon className="h-6 w-6" />
                        {data.calle ? `${data.calle}, ` : "(SIN CALLE), "}
                        {data.numero ? `${data.numero}, ` : "(SIN NÚMERO), "}
                        {data.piso ? `${data.piso}, ` : ""}
                        {data.codigo_postal ? `${data.codigo_postal}, ` : "(SIN C.P.), "}
                        {data.localidad ?  `${data.localidad}, ` : "(SIN LOCALIDAD)"}
                    </p>
                </div>
                <div className="w-full mt-2 break-words whitespace-normal">
                    <p className="flex items-center gap-2">
                        <IdentificationIcon className="h-6 w-6" />
                        {data?.nie || "(SIN NIE)"} - {data?.propietario || "(SIN PROPIETARIO)"}
                    </p>
                    <p className="flex items-center gap-2">
                        <AtSymbolIcon className="h-6 w-6" />
                        <span className="break-words">{data?.email || "(SIN EMAIL)"}</span>
                    </p>
                    <p className="flex items-center gap-2">
                        <PhoneIcon className="h-6 w-6" />
                        <span className="break-words">{data?.telefono || "(SIN TELÉFONO)"}</span>
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
                            <p>No.Protocolo: {data?.num_protocolo || "-"}</p>
                            <p>Folio: {data?.folio || "-"}</p>
                            <p>Hoja: {data?.hoja || "-"}</p>
                            <p>Inscripción: {data?.inscripcion || "-"}</p>
                            <p>F.Inscripción: {new Date(data?.fecha_inscripcion).toISOString().split('T')[0] || "-"}</p>
                            <p>Notario: {data?.notario || "-"}</p>
                            <div className="absolute bottom-0 right-2 translate-y-full w-3 h-3 bg-white border-r border-b border-gray-300 rotate-45"></div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ClientDetails;