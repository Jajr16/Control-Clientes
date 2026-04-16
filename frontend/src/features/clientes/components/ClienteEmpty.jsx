import { useContext } from "react";
import { inmuebleContext } from "../pages/Cliente";
import { UserPlusIcon, BuildingOfficeIcon } from "@heroicons/react/24/solid";

const ClienteEmpty = () => {
    const controller = useContext(inmuebleContext);

    if (!controller) return null;

    const { cliente, inmuebles } = controller;

    const selectedClient = cliente.selectedClient;
    const inmueblesList = inmuebles.inmueblesList || [];

    if (!selectedClient) {
        return (
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-gray-500">
                    <UserPlusIcon className="h-16 w-16 mx-auto mb-4" />
                    <h2>Selecciona un cliente</h2>
                </div>
            </div>
        );
    }

    if (inmueblesList?.length === 0) {
        return (
            <div className="absolute flex w-[68%] h-full p-2">
                <div className="w-full h-full flex flex-col border border-black">
                    <div className="absolute right-0 top-0 bottom-0 w-[100%] flex items-center justify-center">
                        <div className="text-center text-gray-500">
                            <BuildingOfficeIcon className="h-16 w-16 mx-auto mb-4" />
                            <h2>No hay inmuebles</h2>
                        </div>
                    </div>
                </div>
            </div >
        );
    }

    return null;
};

export default ClienteEmpty;