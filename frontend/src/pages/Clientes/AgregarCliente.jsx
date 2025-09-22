import React, { useState } from "react";
import EmpresaForm from "../../components/forms/EmpresaForms.jsx";
import DireccionForm from "../../components/forms/DireccionForms.jsx";
import PropietarioForm from "../../components/forms/PropietarioForms.jsx";
import DatoRegistralForm from "../../components/forms/DatoRegistralForms.jsx";
import { manejarLogicaCliente } from "../../hooks/operacionesClienteForm.js";

const AgregarClientes = () => {
    const {
        datosEmpresa, setDatosEmpresa,
        dirEmpresa, setDirEmpresa,
        datoRegistralEmpresa, setDatoRegistralEmpresa,
        datosPropietario, setDatosPropietario,
        ValidarErrores,
        manejarFormularioCliente
    } = manejarLogicaCliente();

    const [validationErrors, setValidationErrors] = useState({});
    const [mensaje, setMensaje] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setValidationErrors({});
        setMensaje("");

        // Validación simple
        const errores = {};
        if (!datosEmpresa.cif) errores.cif = "CIF obligatorio";
        if (!datosEmpresa.clave) errores.clave = "Clave obligatoria";
        if (!datosEmpresa.tel) errores.tel = "Teléfono obligatorio";
        if (!datosEmpresa.nombre) errores.nombre = "Nombre obligatorio";
        if (!dirEmpresa.calle) errores.calle = "Calle obligatoria";
        if (!dirEmpresa.localidad) errores.localidad = "Localidad obligatoria";
        if (!dirEmpresa.numero) errores.numero = "Número obligatorio";
        if (!dirEmpresa.piso) errores.piso = "Piso obligatorio";
        if (!dirEmpresa.codigo_postal) errores.codigo_postal = "CP obligatorio";
        if (!datosPropietario.nie) errores.nie = "NIE obligatorio";
        if (!datosPropietario.nombre) errores.propietarioNombre = "Nombre propietario obligatorio";
        if (!datosPropietario.email) errores.email = "Email obligatorio";
        if (!datosPropietario.telefono) errores.telefono = "Teléfono propietario obligatorio";
        const camposDatoRegistral = [
            "num_protocolo", "folio", "hoja", "inscripcion", "notario", "fecha_inscripcion"
        ];
        for (const campo of camposDatoRegistral) {
            if (!datoRegistralEmpresa[campo]) errores[campo] = "Campo obligatorio";
        }

        if (Object.keys(errores).length > 0) {
            setValidationErrors(errores);
            setMensaje("Completa todos los campos obligatorios.");
            return;
        }

        const cliente = {
            empresa: datosEmpresa,
            direccion: dirEmpresa,
            datoRegistral: datoRegistralEmpresa,
            propietario: datosPropietario,
        };

        const exito = await manejarFormularioCliente(cliente);

        if (exito) {
            setMensaje("¡Cliente añadido correctamente!");
            setDatosEmpresa({ clave: "", cif: "", nombre: "", tel: "" });
            setDirEmpresa({ calle: "", numero: "", piso: "", codigo_postal: "", localidad: "" });
            setDatoRegistralEmpresa({ num_protocolo: "", folio: "", hoja: "", inscripcion: "", notario: "", fecha_inscripcion: "" });
            setDatosPropietario({ nie: "", nombre: "", email: "", telefono: "" });
        } else {
            setMensaje("Ocurrió un error al guardar el cliente.");
        }
    };
    return (
        <div className="w-full h-full flex flex-col">
            {/* Header fijo */}
            <div className="flex-shrink-0 bg-white border-b border-gray-200 px-3 sm:px-6 py-4 sm:py-6">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 text-center">
                    Agregar Cliente
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
                    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto grid gap-6">
                        <div className="border rounded p-4">
                            <h2 className="font-bold mb-2">Empresa</h2>
                            <EmpresaForm
                                empresa={datosEmpresa}
                                setEmpresa={setDatosEmpresa}
                                validationErrors={validationErrors}
                            />
                        </div>
                        <div className="border rounded p-4">
                            <h2 className="font-bold mb-2">Dirección</h2>
                            <DireccionForm
                                direccion={dirEmpresa}
                                setDireccion={setDirEmpresa}
                                validationErrors={validationErrors}
                            />
                        </div>
                        <div className="border rounded p-4">
                            <h2 className="font-bold mb-2">Propietario</h2>
                            <PropietarioForm
                                propietario={datosPropietario}
                                setPropietario={setDatosPropietario}
                                validationErrors={validationErrors}
                            />
                        </div>
                        <div className="border rounded p-4">
                            <h2 className="font-bold mb-2">Dato Registral</h2>
                            <DatoRegistralForm
                                datoRegistral={datoRegistralEmpresa}
                                setDatoRegistral={setDatoRegistralEmpresa}
                                validationErrors={validationErrors}
                            />
                        </div>
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                            >
                                Añadir Cliente
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AgregarClientes;