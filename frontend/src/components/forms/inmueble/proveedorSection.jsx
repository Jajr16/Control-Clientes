import { useFieldArray, useFormContext } from "react-hook-form";
import ProveedorForm from "./ProveedorForms";

import { SeccionColapsable } from "../../ui/SeccionCollapse";
import useSeccionesColapsables from "../../../hooks/useSeccionesColapsables";
import { X } from "lucide-react";

const ProveedorSection = ({ prefijoInmueble }) => {
    const prefijoBase = `${prefijoInmueble}.proveedores`;
    const { control } = useFormContext();
    const { fields, append, remove } = useFieldArray({
        control,
        name: prefijoBase
    });

    const { seccionesAbiertas, toggleSeccion } = useSeccionesColapsables({});

    return (
        <div className="space-y-4">
            <SeccionColapsable
                titulo={{ texto: `Proveedores (${fields.length})`, className: "font-semibold" }}
                abierto={!seccionesAbiertas["proveedor-container"]}
                onToggle={() => toggleSeccion("proveedor-container")}
                obligatorio={false}
                boton={{
                    texto: "+ Agregar",
                    onClick: () => {
                        append({ clave: "", nombre: "", tipo_servicio: "", telefono: "", email: "" });
                        toggleSeccion(`proveedor-${fields.length}`); // abre la nueva sección
                    },
                    className: "text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                }}
            >
                <div className="space-y-2">
                    {fields.map((field, index) => (
                        <ProveedorForm key={field.id} prefijoInmueble={prefijoBase} index={index} onRemove={ () => {
                            const id = fields.length
                            remove(index);
                            toggleSeccion(`proveedor-${id}`);
                        }} />
                    ))}
                </div>
            </SeccionColapsable>
        </div>
    );
};

export default ProveedorSection;