import { X, Plus, Home } from "lucide-react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import InmuebleForm from "./InmuebleForms";
import { SeccionColapsable } from "../../ui/SeccionCollapse";

import useSeccionesAbiertas from "../../../hooks/useSeccionesAbiertas";

const InmuebleSection = () => {
    const { control } = useFormContext()
    const { getValues } = useFormContext();
    console.log(getValues())

    const inmuebles = useWatch({ control, name: `inmuebles` }) || []

    const { fields, append, remove } = useFieldArray({
        control,
        name: "inmuebles"
    })

    const { seccionesAbiertas, toggleSeccion } = useSeccionesAbiertas();

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
                <p className="text-gray-600 text-sm">Los inmuebles son opcionales, pero si agregas uno, sus datos registrales son obligatorios</p>
                <div
                    onClick={() => {
                        const id = fields.length
                        append({
                            clave_catastral: "",
                            valor_adquisicion: "",
                            fecha_adquisicion: "",
                            dato_registral: {},
                            direccion: {},
                            proveedores: [],
                            hipotecas: [],
                            seguros: []
                        })
                        toggleSeccion(id)
                    }}
                    className="flex items-center cursor-pointer gap-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Agregar Inmueble
                </div>
            </div>

            {fields.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                    No hay inmuebles agregados
                </div>
            )}

            {fields.map((field, index) => {
                const clave_catastral = inmuebles[index]?.clave_catastral ? `- ${inmuebles[index]?.clave_catastral}` : ""
                return (
                    <div key={field.id}>
                        <SeccionColapsable
                            key={field.id}
                            titulo={{
                                texto: `Inmueble ${index + 1} ${clave_catastral}`,
                                className: "font-semibold"
                            }}
                            icono={Home}
                            abierto={!seccionesAbiertas.has(index)}
                            onToggle={() => toggleSeccion(index)}
                            boton={{
                                icon: X,
                                className: "text-red-500 hover:text-red-700 p-1",
                                onClick: () => {
                                    const id = fields.length
                                    remove(index);
                                    toggleSeccion(id)
                                }
                            }}
                            headerExtra={
                                <span className="text-xs text-gray-500">
                                    {field.proveedores?.length || 0} proveedores, {field.hipotecas?.length || 0} hipotecas, {field.seguros?.length || 0} seguros
                                </span>
                            }
                            borderStyle="bg-gray-50"
                        >
                            <InmuebleForm index={index} />
                        </SeccionColapsable>
                    </div>
                )
            })}
        </div>
    )
}

export default InmuebleSection;