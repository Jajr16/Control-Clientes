import { useFieldArray, useFormContext } from "react-hook-form";
import SeguroForm from "./SeguroForms";

import { SeccionColapsable } from "../../ui/SeccionCollapse";
import useSeccionesColapsables from "../../../hooks/useSeccionesColapsables";

const SeguroSection = ({ prefijoInmueble }) => {
    const prefijoBase = `${prefijoInmueble}.seguros`
    const { control } = useFormContext();
    const { fields, append, remove } = useFieldArray({
        control,
        name: prefijoBase
    })

    const { seccionesAbiertas, toggleSeccion } = useSeccionesColapsables({})

    return (
        <div className="space-y-4">
            <SeccionColapsable
                titulo={{ texto: `Seguros (${fields.length})`, className: "font-semibold" }}
                abierto={!seccionesAbiertas["seguro-container"]}
                onToggle={() => toggleSeccion("seguro-container")}
                obligatorio={false}
                boton={{
                    texto: "+ Agregar",
                    onClick: () => {
                        append({ empresa_seguro: "", tipo_seguro: "", telefono: "", email: "", poliza: "" })
                        toggleSeccion(`seguro-${fields.length}`)
                    },
                    className: "text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                }}
            >
                <div className="space-y-2">
                    {fields.map((field, index) => (
                        <SeguroForm key={field.id} prefijo={prefijoBase} index={index} onRemove={() => {
                            const id = fields.length
                            remove(index)
                            toggleSeccion(`seguro-${id}`)
                        }} />
                    ))}
                </div>
            </SeccionColapsable>
        </div>
    )
}

export default SeguroSection