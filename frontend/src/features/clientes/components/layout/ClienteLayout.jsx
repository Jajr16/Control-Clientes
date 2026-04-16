import { useContext, useEffect, useMemo, useState } from "react";
import { inmuebleContext } from "../../pages/Cliente";

import GlobalSearch from "../../../../components/elements/searchBar";
import ClientDetails from "../ClienteDetails";
import InmueblesList from "../../../inmuebles/components/InmueblesList";
import InmuebleDetails from "../../../inmuebles/components/InmuebleDetails";
import ModalAgregarInmueble from "../../../inmuebles/components/ModalInmueble";
import ClienteOverlay from "../ClienteOverlay";
import ClienteEmpty from "../ClienteEmpty";

import { UserPlusIcon, PencilIcon } from "@heroicons/react/24/solid";
import { Link } from "react-router-dom";
import logoRecortado from '../../../../assets/img/logoRecortado.png';
import ModalEditarCliente from "../ModalEditarClient";

const ClienteLayout = () => {
    const controller = useContext(inmuebleContext)

    if (!controller) return null;

    const { cliente, inmuebles, inmuebleDetails } = controller;
    const [isModalOpen, setIsModalOpen] = useState(false);

    let fieldsToInclude = [
        "cif", "nombre", "clave", "nie", "propietario", "telefono", "email",
        "calle", "numero", "piso", "codigo_postal", "localidad",
        "num_protocolo", "folio", "hoja", "inscripcion", "notario", "fecha_inscripcion"
    ]

    const clientOptions = useMemo(() => {
        return cliente.clients.map((client) => {

            const base = {
                value: client.cif,
                label: `${client.clave || "(SIN CLAVE)"} - ${client.nombre || "(SIN NOMBRE)"}`,
                ...client
            };

            fieldsToInclude.forEach((field) => {
                base[field] = client[field] ?? "";
            });

            return base;
        });

    }, [cliente.clients]);

    return (
        <div className="h-full flex flex-col">

            <ClienteOverlay loading={inmuebles.loading} />

            {/* SEARCH */}
            <div className={`flex-shrink-0 ${cliente.selectedClient ? "w-[30%]" : "w-full"} p-2 flex`}>
                <GlobalSearch
                    options={clientOptions}
                    value={cliente.selectedClient}
                    onChange={(opt) => controller.handleSelectClient(opt)}
                    onClear={() => controller.handleSelectClient(null)}
                    placeholder="Buscar cliente..."
                    fieldsToInclude={fieldsToInclude}
                >
                    <button onClick={() => setIsModalOpen(true)}><PencilIcon className="text-blue-500 h-5 w-5" /></button>
                    {!cliente.selectedClient && (
                        <Link to="/nuevosClientes" className="ml-2 pl-3 rounded text-black-600">
                            <UserPlusIcon className="h-6 w-6" />
                        </Link>
                    )}
                </GlobalSearch>

                <ModalEditarCliente
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    data={cliente.selectedClient}
                    onSave={cliente.handleUpdateClient}
                />


            </div>

            {/* CONTENT */}
            <div className="flex-1 relative">

                <div className="absolute inset-0 opacity-30 flex justify-center items-center pointer-events-none">
                    <img src={logoRecortado} className="h-full w-full object-contain" alt="logo" />
                </div>

                <div className="h-full grid grid-cols-[30%_70%]">

                    {/* LEFT */}
                    <div className="flex flex-col">

                        {cliente.selectedClient && (
                            <>
                                <ClientDetails />

                                <div className="flex-1 overflow-y-auto">
                                    <InmueblesList />
                                </div>

                                <ModalAgregarInmueble
                                    cifCliente={cliente.selectedClient.cif}
                                    onInmuebleAgregado={controller.handleInmuebleAgregado}
                                />
                            </>
                        )}

                    </div>

                    {/* RIGHT */}
                    <div className="overflow-y-auto">

                        {cliente.selectedClient &&
                            inmuebles.inmueblesList?.length > 0 ? (

                            <InmuebleDetails
                                inmueble={inmuebles.selectedInmueble}
                                setProveedoresSegurosList={inmuebleDetails.setProveedoresSegurosList}
                                proveedoresList={inmuebleDetails.proveedoresSegurosList}
                                setHipotecas={inmuebleDetails.setHipoteca}
                                HipotecasList={inmuebleDetails.hipoteca}
                                onEditModeChange={inmuebleDetails.setIsEditing}
                            />
                        ) : (
                            <ClienteEmpty />
                        )}

                    </div>
                </div>


            </div>
        </div >
    );
};

export default ClienteLayout;