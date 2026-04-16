import { X, Plus, Home } from "lucide-react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import InmuebleForm from "./InmuebleForms";
import { SeccionColapsable } from "../../../../components/ui/SeccionCollapse";

import useSeccionesColapsables from "../../../../hooks/useSeccionesColapsables";

const InmuebleData = ({ index, control, children }) => {
    const data = useWatch({ control, name: `inmuebles.${index}` });

    const clave = data?.clave_catastral ? `- ${data.clave_catastral}` : "";
    const nProv = data?.proveedores?.length || 0;
    const nSeg = data?.seguros?.length || 0;
    const nHip = (data?.hipoteca && Object.keys(data.hipoteca).length > 0) ? 1 : 0;

    return children({ clave, nProv, nSeg, nHip });
};

const InmuebleSection = () => {
    const { control } = useFormContext();

    const { fields, append, remove } = useFieldArray({
        control,
        name: "inmuebles"
    });

    const { seccionesAbiertas, toggleSeccion } = useSeccionesColapsables({});

    return (
        <SeccionColapsable
            titulo={{ texto: `Inmuebles (${fields.length})` }}
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
                        hipoteca: {},
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
                    return (
                        <InmuebleData key={field.id} index={index} control={control}>
                            {({ clave, nProv, nSeg, nHip }) => (
                                <SeccionColapsable
                                    key={field.id}
                                    titulo={{
                                        texto: `Inmueble ${index + 1} ${clave}`,
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
                                            {nProv} proveedores, {nHip} hipoteca, {nSeg} seguros
                                        </span>
                                    }
                                    borderStyle="bg-gray-50"
                                >
                                    <InmuebleForm index={index} />
                                </SeccionColapsable>
                            )}
                        </InmuebleData>
                    );
                })}
            </div>
        </SeccionColapsable>
    );
};

export default InmuebleSection;