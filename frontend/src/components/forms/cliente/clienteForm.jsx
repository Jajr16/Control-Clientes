import { Home } from "lucide-react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import EmpresaForm from "./EmpresaForms";
import { clienteSchema } from "../../../schemas/cliente.schema";

import { SeccionColapsable } from "../../../components/ui/SeccionCollapse.jsx";
import useSeccionesColapsables from "../../../hooks/useSeccionesColapsables.js";

import { Building } from "lucide-react";
import PropietarioForm from "./PropietarioForms.jsx";

import InmuebleSection from "../inmueble/inmuebleSection.jsx";

import { DevTool } from "@hookform/devtools";

export default function ClienteForm({ onSubmit }) {
    const methods = useForm({
        resolver: zodResolver(clienteSchema),
        defaultValues: {
            propietario: {},
            empresa: {},
            inmuebles: []
        }
    });

    // Control de UI
    const { seccionesAbiertas, toggleSeccion } = useSeccionesColapsables({
        cliente: true,
        inmueble: false
    })

    const inmuebles = methods.watch("inmuebles")

    return (
        <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)}>
                {/* SECCIÓN CLIENTE (OBLIGATORIA) */}
                <SeccionColapsable
                    titulo={{ texto: "Datos del Cliente" }}
                    icono={Building}
                    abierto={seccionesAbiertas.cliente}
                    onToggle={() => toggleSeccion("cliente")}
                    obligatorio={true}
                >
                    <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
                        <EmpresaForm />
                        <PropietarioForm />
                    </div>
                </SeccionColapsable>

                {/* SECCIÓN INMUEBLES */}
                <SeccionColapsable
                    titulo={{ texto:`Inmuebles (${inmuebles?.length ?? 0})` }}
                    icono={Home}
                    abierto={seccionesAbiertas.inmuebles}
                    onToggle={() => toggleSeccion("inmuebles")}
                    obligatorio={false}
                >
                    <InmuebleSection />
                </SeccionColapsable>
            </form>
            <DevTool control={methods.control} />
        </FormProvider>
    );
}