import { X, Plus, Home } from "lucide-react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import InmuebleForm from "./InmuebleForms";
import { SeccionColapsable } from "../../ui/SeccionCollapse";

import useSeccionesColapsables from "../../../hooks/useSeccionesColapsables";

const InmuebleSection = () => {
    const { control } = useFormContext();

    const inmuebles = useWatch({
        control,
        name: "inmuebles"
    }) || [];

    const { fields, append, remove } = useFieldArray({
        control,
        name: "inmuebles"
    });

    const { seccionesAbiertas, toggleSeccion } = useSeccionesColapsables({});

    return (
        <SeccionColapsable
            titulo={{ texto: `Inmuebles (${inmuebles.length})` }}
            icono={Home}
            abierto={seccionesAbiertas["inmuebles-container"]}
            onToggle={() => toggleSeccion("inmuebles-container")}
            obligatorio={false}
            boton={{
                icon: Plus,
                texto: "Agregar Inmueble",
                className: "flex items-center cursor-pointer gap-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors",
                onClick: () => {
                    append({
                        clave_catastral: "",
                        valor_adquisicion: "",
                        fecha_adquisicion: "",
                        dato_registral: {},
                        direccion: {},
                        proveedores: [],
                        hipotecas: [],
                        seguros: []
                    });
                    toggleSeccion(`inmueble-${fields.length}`);
                }
            }}
            headerExtra={
                <p className="text-gray-600 text-sm">
                    Los inmuebles son opcionales, pero si agregas uno, sus datos registrales son obligatorios
                </p>
            }
        >
            <div className="space-y-4">

                {fields.length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                        No hay inmuebles agregados
                    </div>
                )}

                {fields.map((field, index) => {

                    const claveCatastral =
                        inmuebles[index]?.clave_catastral
                            ? `- ${inmuebles[index].clave_catastral}`
                            : "";

                    return (
                        <SeccionColapsable
                            key={field.id}
                            titulo={{
                                texto: `Inmueble ${index + 1} ${claveCatastral}`,
                                className: "font-semibold"
                            }}
                            icono={Home}
                            abierto={seccionesAbiertas[`inmueble-${index}`]}
                            onToggle={() => toggleSeccion(`inmueble-${index}`)}
                            boton={{
                                icon: X,
                                className: "text-red-500 hover:text-red-700 p-1",
                                onClick: () => {
                                    remove(index);
                                }
                            }}
                            headerExtra={
                                <span className="text-xs text-gray-500">
                                    {inmuebles[index]?.proveedores?.length || 0} proveedores,
                                    {" "}
                                    {inmuebles[index]?.hipotecas?.length || 0} hipotecas,
                                    {" "}
                                    {inmuebles[index]?.seguros?.length || 0} seguros
                                </span>
                            }
                            borderStyle="bg-gray-50"
                        >
                            <InmuebleForm index={index} />
                        </SeccionColapsable>
                    );
                })}
            </div>
        </SeccionColapsable>
    );
};

export default InmuebleSection;