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
        <div className="p-6">
            <strong className="text-2xl"><center>Agregar Adeudo</center></strong>

            {mensaje && (
                <div className="mb-4 text-center text-sm text-blue-700 font-semibold">
                    {mensaje}
                </div>
            )}

            <form onSubmit={handleSubmit}>
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
    );
};

export default AgregarAdeudo;
