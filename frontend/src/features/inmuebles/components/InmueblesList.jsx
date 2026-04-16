import { useContext } from "react";
import { inmuebleContext } from "../../clientes/pages/Cliente";
import InmuebleCard from "./InmuebleCard";

const InmueblesList = () => {

    const { inmuebles, inmuebleDetails } = useContext(inmuebleContext)

    const lista = inmuebles.inmueblesList || [];
    const seleccionado = inmuebles.selectedInmueble;
    const isEditing = inmuebleDetails.isEditing;

    if (!lista || !Array.isArray(lista)) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="text-gray-500">Cargando inmuebles...</div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col p-2">
            <div className="relative h-full flex flex-col border border-black p-2 overflow-y-auto bg-white">

                {isEditing && (
                    <div className="mb-3 p-2 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 text-xs rounded">
                        <strong>Modo de edición activo</strong>: Guarda o cancela los cambios antes de seleccionar otro inmueble.
                    </div>
                )}

                {lista.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center text-gray-500">
                        No hay inmuebles registrados.
                    </div>
                ) : (
                    <div className="space-y-3">
                        {lista.map((inmueble) => (
                            <InmuebleCard
                                key={inmueble.clave_catastral}
                                inmueble={inmueble}
                                isSelected={seleccionado?.clave_catastral === inmueble.clave_catastral}
                                isEditingGlobal={isEditing}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default InmueblesList;