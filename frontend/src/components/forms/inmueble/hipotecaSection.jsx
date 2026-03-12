import { useFieldArray, useFormContext } from "react-hook-form";
import HipotecaForm from "./HipotecaForms";

import { SeccionColapsable } from "../../ui/SeccionCollapse";
import useSeccionesColapsables from "../../../hooks/useSeccionesColapsables";
import { DollarSign } from "lucide-react";

const HipotecaSection = ({ prefijoInmueble }) => {
    const prefijoBase = `${prefijoInmueble}.hipotecas`
    const { control } = useFormContext();
    const { fields, append, remove } = useFieldArray({
        control,
        name: prefijoBase
    });

    const { seccionesAbiertas, toggleSeccion } = useSeccionesColapsables({});

    return (
        <div >
            <SeccionColapsable
                titulo={{ texto: `Hipotecas (${fields.length})`, className: "font-semibold" }}
                abierto={!seccionesAbiertas["hipotecas-container"]}
                onToggle={() => toggleSeccion("hipotecas-container")}
                icono={DollarSign}
                obligatorio={false}
                boton={{
                    texto: "+ Agregar",
                    onClick: () => {
                        append({ prestamo: "", banco_prestamo: "", fecha_hipoteca: "", cuota_hipoteca: "" })
                        toggleSeccion(`hipoteca-${fields.length}`);
                    },
                    className: "text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                }}
            >
                <div className="space-y-2">
                    {fields.map((field, index) => (
                        <HipotecaForm key={field.id} prefijo={prefijoBase} index={index} onRemove={() => {
                            const id = field.length
                            remove(index);
                            toggleSeccion(`hipoteca-${id}`)
                        }}
                        />
                    ))}
                </div>
            </SeccionColapsable>
        </div>
    )

}

export default HipotecaSection