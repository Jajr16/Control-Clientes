import { useState } from "react";
import { useFormContext } from "react-hook-form";
import HipotecaForm from "./HipotecaForms";

import { SeccionColapsable } from "../../../../components/ui/SeccionCollapse";
import useSeccionesColapsables from "../../../../hooks/useSeccionesColapsables";
import { DollarSign } from "lucide-react";

const HipotecaSection = ({ prefijoInmueble }) => {
    const prefijoBase = `${prefijoInmueble}.hipoteca`;
    const { setValue, unregister } = useFormContext();

    const { seccionesAbiertas, toggleSeccion } = useSeccionesColapsables({});

    const [showHipoteca, setShowHipoteca] = useState(false);

    const agregarHipoteca = () => {
        setShowHipoteca(true);

        if (!seccionesAbiertas["hipoteca-container"]) {
            toggleSeccion("hipoteca-container");
        }
    }

    const eliminarHipoteca = () => {
        unregister(prefijoBase); 
        setShowHipoteca(false);
    }

    return (
        <div >
            <SeccionColapsable
                titulo={{ texto: `Hipoteca`, className: "font-semibold" }}
                abierto={!!seccionesAbiertas["hipoteca-container"]}
                onToggle={() => toggleSeccion("hipoteca-container")}
                icono={DollarSign}
                obligatorio={false}
                boton={{
                    texto: "+ Agregar",
                    onClick: agregarHipoteca,
                    className: "text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600",
                    disabled: showHipoteca
                }}
            >
                <div className="space-y-2">
                    {showHipoteca && (
                        <HipotecaForm prefijo={prefijoBase} onRemove={eliminarHipoteca}
                        />
                    )}
                </div>
            </SeccionColapsable>
        </div>
    )

}

export default HipotecaSection