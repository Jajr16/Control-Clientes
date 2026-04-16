import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import EmpresaForm from "./EmpresaForms";
import { clienteSchema } from "../../../../schemas/cliente.schema.js";

import { SeccionColapsable } from "../../../../components/ui/SeccionCollapse.jsx";
import useSeccionesColapsables from "../../../../hooks/useSeccionesColapsables.js";

import { Building } from "lucide-react";
import PropietarioForm from "./PropietarioForms.jsx";

import InmuebleSection from "../../../inmuebles/components/forms/inmuebleSection.jsx";

export default function ClienteForm({ onSubmit, loading }) {
    const methods = useForm({
        resolver: zodResolver(clienteSchema),
        defaultValues: {
            propietario: { nie: "", nombre: "", email: "", telefono: "" },
            empresa: {
                cif: "", nombre: "", telefono: "", clave: "",
                direccion: { calle: "", numero: "", piso: "", codigo_postal: "", localidad: "" },
                dato_registral: { fecha_inscripcion: "", folio: "", hoja: "", inscripcion: "", notario: "", num_protocolo: "" }
            },
            inmuebles: []
        }
    });

    // Control de UI
    const { seccionesAbiertas, toggleSeccion } = useSeccionesColapsables({
        cliente: true,
        inmueble: false
    })

    return (
        <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit((data) => onSubmit(data, methods.setError))}>
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

                <InmuebleSection />

                <div className="flex justify-end mt-6">
                    <button
                        type="submit"
                        disabled={loading}
                        className={`px-8 py-3 rounded-lg font-semibold shadow-lg transition-colors text-white
                            ${Object.keys(methods.formState.errors).length ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}
                        `}
                    >
                        {Object.keys(methods.formState.errors).length ? "Ha habido errores, consulta arriba" : "Guardar cliente"}
                    </button>
                </div>
            </form>
        </FormProvider>
    );
}