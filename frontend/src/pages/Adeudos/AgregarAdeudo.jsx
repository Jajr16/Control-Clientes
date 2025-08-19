import React, { useState, useEffect } from "react";
import AdeudosForm from "../../components/forms/AdeudosForms.jsx";
import { getEmpresas } from "../../api/moduloClientes/empresas.js";
import { addAdeudo } from "../../api/moduloAdeudos/adeudos.js";

const AgregarAdeudo = () => {
    const [empresa, setEmpresa] = useState({
        empresa_cif: "",
        concepto: "",
        proveedor: "",
        ff: "",
        numfactura: "",
        protocoloentrada: "",
        importe: 0,
        iva: 0,
        retencion: 0,
        csiniva: 0,
        total: 0,
        anticipocliente: 0,
        total_adeudos: 0,
        adeudo_pendiente: 0
    });

    const [mostrarVistaPrevia, setMostrarVistaPrevia] = useState(false);
    const [adeudosGuardados, setAdeudosGuardados] = useState([]);
    const [empresasDisponibles, setEmpresasDisponibles] = useState([]);
    const [validationErrors, setValidationErrors] = useState({});
    const [mensaje, setMensaje] = useState("");

    useEffect(() => {
        const cargarEmpresas = async () => {
            try {
                const data = await getEmpresas();
                setEmpresasDisponibles(data);
            } catch (error) {
                console.error("Error al obtener empresas:", error);
            }
        };

        cargarEmpresas();
    }, []);

    useEffect(() => {
        const fetchAdeudos = async () => {
            if (empresa.empresa_cif) {
                try {
                    const response = await fetch(`http://localhost:3000/api/adeudos/empresa/${empresa.empresa_cif}`);
                    if (!response.ok) throw new Error("Error al obtener adeudos");
                    const data = await response.json();
                    console.log(data)
                    setAdeudosGuardados(data.data);
                    setMostrarVistaPrevia(true);
                } catch (error) {
                    console.error("Error al obtener adeudos:", error);
                }
            }
        };

        fetchAdeudos();
    }, [empresa.empresa_cif]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setValidationErrors({});
        setMensaje("");

        const errores = {};
        const camposObligatorios = ['empresa_cif', 'concepto', 'proveedor', 'ff', 'numfactura', 'importe'];

        for (let campo of camposObligatorios) {
            if (!empresa[campo] || empresa[campo].toString().trim() === "") {
                errores[campo] = "Este campo es obligatorio";
            }
        }

        if (Object.keys(errores).length > 0) {
            setValidationErrors(errores);
            return;
        }

        try {
            await addAdeudo(empresa);
            setMensaje("Adeudo registrado correctamente.");
            setEmpresa({
                empresa_cif: "",
                concepto: "",
                proveedor: "",
                ff: "",
                numfactura: "",
                protocoloentrada: "",
                importe: 0,
                iva: 0,
                retencion: 0,
                csiniva: 0,
                total: 0,
                anticipocliente: 0,
                total_adeudos: 0,
                adeudo_pendiente: 0
            });
        } catch (error) {
            console.error("Error al guardar el adeudo:", error);
            setMensaje("Ocurrió un error al guardar el adeudo.");
        }
    };

    return (
        <div className="w-full h-full flex flex-col">
            {/* Header fijo */}
            <div className="flex-shrink-0 bg-white border-b border-gray-200 px-3 sm:px-6 py-4 sm:py-6">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 text-center">
                    Agregar Adeudo
                </h1>

                {mensaje && (
                    <div className={`mt-3 sm:mt-4 p-3 sm:p-4 rounded-md text-center text-sm sm:text-base font-semibold ${mensaje.includes('correctamente')
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}>
                        {mensaje}
                    </div>
                )}
            </div>

            {/* Contenido scrolleable */}
            <div className="flex-1 overflow-y-auto bg-white">
                <div className="p-3 sm:p-6">
                    <form onSubmit={handleSubmit} className="max-w-7xl mx-auto">
                        <AdeudosForm
                            empresa={empresa}
                            setEmpresa={setEmpresa}
                            adeudosGuardados={adeudosGuardados}
                            setAdeudosGuardados={setAdeudosGuardados}
                            empresasDisponibles={empresasDisponibles}
                            validationErrors={validationErrors}
                            mostrarVistaPrevia={mostrarVistaPrevia}
                            setVistaPrevia={setMostrarVistaPrevia}
                        />
                    </form>
                </div>
            </div>
        </div>
    )
}

export default AgregarAdeudo;