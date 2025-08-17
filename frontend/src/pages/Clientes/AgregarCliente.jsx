import React, { useEffect, useState } from "react";
import { RiArrowDownSLine, RiArrowUpSLine } from "react-icons/ri";

import DatoRegistralForm from "../../components/forms/DatoRegistralForms.jsx";
import DireccionForm from "../../components/forms/DireccionForms.jsx";
import EmpresaForm from "../../components/forms/EmpresaForms.jsx";
import PropietarioForm from "../../components/forms/PropietarioForms.jsx";
import InmuebleForm from "../../components/forms/InmuebleForms.jsx";
import InmuebleHipotecaForm from "../../components/forms/InmuebleHipotecaForms.jsx";
import InmuebleProveedorForm from "../../components/forms/InmuebleProveedorForms.jsx";
import InmuebleSeguroForm from "../../components/forms/InmuebleSeguroForms.jsx";

import { manejarLogicaCliente } from "../../hooks/operacionesClienteForm.js";
import { manejarLogicaInmueble } from "../../hooks/operacionesClienteForm.js";

const AddClientesPage = () => {
    const {
        datosEmpresa, setDatosEmpresa,
        dirEmpresa, setDirEmpresa,
        datoRegistralEmpresa, setDatoRegistralEmpresa,
        datosPropietario, setDatosPropietario,
        ValidarErrores,
        manejarFormularioCliente
    } = manejarLogicaCliente();

    const {
        datosInmueble, setDatosInmueble,
        datosProveedor, setDatosProveedor,
        datosHipoteca, setDatosHipoteca,
        datosSeguro, setDatosSeguro,
        ValidarErroresInmueble,
        manejarFormularioInmueble
    } = manejarLogicaInmueble();

    // Estado para controlar la visibilidad del formulario principal
    const [mostrarFormulariosCliente, setMostrarFormulariosCliente] = useState(false);
    const [mostrarFormulariosInmueble, setMostrarFormulariosInmueble] = useState(false);

    // Funciones para alternar la visibilidad de los formularios
    const toggleFormularioCliente = () => {
        setMostrarFormulariosCliente(!mostrarFormulariosCliente);
    };
    const toggleFormularioInmueble = () => {
        setMostrarFormulariosInmueble(!mostrarFormulariosInmueble);
    };

    const [mensajeExito, setMensajeExito] = useState("");

    // Estado para múltiples inmuebles
    const [inmuebles, setInmuebles] = useState([
        {
            datosInmueble: {},
            datosProveedor: {},
            datosHipoteca: {},
            datosSeguro: {},
        }
    ]);
    // Estado para el inmueble activo
    const [inmuebleActivo, setInmuebleActivo] = useState(0);

    // Función para añadir un nuevo inmueble
    const agregarInmueble = () => {
        setInmuebles([
            ...inmuebles,
            {
                datosInmueble: {},
                datosProveedor: {},
                datosHipoteca: {},
                datosSeguro: {},
            }
        ]);
        setInmuebleActivo(inmuebles.length); // Selecciona el nuevo inmueble
    };

    // Funciones para actualizar los datos del inmueble activo
    const setDatosInmuebleActivo = (nuevo) => {
        setInmuebles(prev => {
            const copia = [...prev];
            copia[inmuebleActivo] = {
                ...copia[inmuebleActivo],
                datosInmueble: { ...nuevo }
            };
            return copia;
        });
    };
    const setDatosProveedorActivo = (nuevo) => {
        setInmuebles(prev => {
            const copia = [...prev];
            copia[inmuebleActivo] = {
                ...copia[inmuebleActivo],
                datosProveedor: { ...nuevo }
            };
            return copia;
        });
    };
    const setDatosHipotecaActivo = (nuevo) => {
        setInmuebles(prev => {
            const copia = [...prev];
            copia[inmuebleActivo] = {
                ...copia[inmuebleActivo],
                datosHipoteca: { ...nuevo }
            };
            return copia;
        });
    };
    const setDatosSeguroActivo = (nuevo) => {
        setInmuebles(prev => {
            const copia = [...prev];
            copia[inmuebleActivo] = {
                ...copia[inmuebleActivo],
                datosSeguro: { ...nuevo }
            };
            return copia;
        });
    };

    const [seccionInmuebleActiva, setSeccionInmuebleActiva] = useState(0); // 0: Datos, 1: Proveedor, 2: Hipoteca, 3: Seguro

    const [errorCliente, setErrorCliente] = useState("");

    // Función de validación
    const validarCamposObligatorios = () => {
        // Empresa
        if (
            !datosEmpresa.cif ||
            !datosEmpresa.clave ||
            !datosEmpresa.tel ||
            !datosEmpresa.nombre
        ) {
            setErrorCliente("Completa todos los campos obligatorios de la empresa.");
            return false;
        }
        // Propietario
        if (
            !datosPropietario.nie ||
            !datosPropietario.nombre ||
            !datosPropietario.email ||
            !datosPropietario.telefono
        ) {
            setErrorCliente("Completa todos los campos obligatorios del propietario.");
            return false;
        }
        // Dirección
        if (
            !dirEmpresa.calle ||
            !dirEmpresa.localidad ||
            !dirEmpresa.numero ||
            !dirEmpresa.piso ||
            !dirEmpresa.cp
        ) {
            setErrorCliente("Completa todos los campos obligatorios de la dirección.");
            return false;
        }
        // Dato Registral
        const camposDatoRegistral = [
            "num_protocolo",
            "folio",
            "hoja",
            "inscripcion",
            "notario",
            "fecha_inscripcion"
        ];
        for (const campo of camposDatoRegistral) {
            if (!datoRegistralEmpresa[campo]) {
                setErrorCliente("Completa todos los campos obligatorios de dato registral.");
                return false;
            }
        }
        setErrorCliente("");
        return true;
    };


    return (
        <div>
            {/* Formulario para agregar Empresa con Referencias */}
            <strong className="text-2xl"><center>Nuevo Cliente</center></strong>
            <div className="border border-black rounded-b-lg">
                <div className="border-b border-black flex w-full justify-between">
                    <strong className="text-xl ml-5">Datos Empresa</strong>
                    <RiArrowDownSLine className="h-6 w-6" onClick={toggleFormularioCliente} />
                </div>
                {mostrarFormulariosCliente &&
                    <div className="">
                        <div className="grid grid-cols-[48%_48%] mb-4 mt-4 w-full justify-evenly">
                            <div className="border border-black rounded-md p-2">
                                <strong className="text-lg">Empresa</strong>
                                <EmpresaForm
                                    empresa={datosEmpresa}
                                    setEmpresa={setDatosEmpresa}
                                    validationErrors={ValidarErrores}
                                />
                                <DireccionForm
                                    direccion={dirEmpresa}
                                    setDireccion={setDirEmpresa}
                                    validationErrors={ValidarErrores}
                                />
                            </div>
                            <div className="border border-black rounded-md p-2">
                                <strong className="text-lg">Propietario</strong>
                                <PropietarioForm
                                    propietario={datosPropietario}
                                    setPropietario={setDatosPropietario}
                                    validationErrors={ValidarErrores}
                                />
                            </div>
                            <div className="border border-black rounded-md p-2 col-span-2">
                                {/* Formulario para Datos Registrales */}
                                <DatoRegistralForm
                                    datoRegistral={datoRegistralEmpresa}
                                    setDatoRegistral={setDatoRegistralEmpresa}
                                    validationErrors={ValidarErrores}
                                />
                            </div>
                        </div>

                    </div>
                }
            </div>
            {/* Formulario para agregar Inmuebles */}
            <div className="border border-black rounded-b-lg">
                <div className="border-b border-black flex w-full justify-between">
                    <strong className="text-xl ml-5">Inmuebles</strong>
                    <RiArrowDownSLine className="h-6 w-6" onClick={toggleFormularioInmueble} />
                </div>
                {mostrarFormulariosInmueble &&
                    <div>
                        {/* Pestañas de inmuebles */}
                        <div className="flex mb-2">
                            {inmuebles.map((_, idx) => (
                                <div key={idx} className="flex items-center">
                                    <button
                                        className={`px-3 py-1 border rounded-t flex items-center gap-2 ${inmuebleActivo === idx ? "bg-gray-300" : "bg-white"}`}
                                        onClick={() => setInmuebleActivo(idx)}
                                    >
                                        Inmueble {idx + 1}
                                        {inmuebles.length > 1 && idx > 0 && (
                                            <span
                                                className="ml-1 text-red-500 font-bold cursor-pointer"
                                                onClick={e => {
                                                    e.stopPropagation();
                                                    const nuevos = inmuebles.filter((_, i) => i !== idx - 1);
                                                    setInmuebles(nuevos);
                                                    setInmuebleActivo(prev => {
                                                        if (prev === idx - 1) return 0;
                                                        if (prev > idx - 1) return prev - 1;
                                                        return prev;
                                                    });
                                                }}
                                                title="Eliminar inmueble a la izquierda"
                                            >
                                                ×
                                            </span>
                                        )}
                                    </button>
                                </div>
                            ))}
                            <button
                                className="px-3 py-1 border rounded-t bg-green-200 ml-2"
                                onClick={agregarInmueble}
                            >
                                + Añadir inmueble
                            </button>
                        </div>
                        {/* Selector de sección */}
                        <div className="flex mb-4">
                            <button
                                className={`px-3 py-1 border rounded-l ${seccionInmuebleActiva === 0 ? "bg-gray-300" : "bg-white"}`}
                                onClick={() => setSeccionInmuebleActiva(0)}
                            >
                                Datos Registrales
                            </button>
                            <button
                                className={`px-3 py-1 border ${seccionInmuebleActiva === 1 ? "bg-gray-300" : "bg-white"}`}
                                onClick={() => setSeccionInmuebleActiva(1)}
                            >
                                Proveedor
                            </button>
                            <button
                                className={`px-3 py-1 border ${seccionInmuebleActiva === 2 ? "bg-gray-300" : "bg-white"}`}
                                onClick={() => setSeccionInmuebleActiva(2)}
                            >
                                Hipoteca
                            </button>
                            <button
                                className={`px-3 py-1 border rounded-r ${seccionInmuebleActiva === 3 ? "bg-gray-300" : "bg-white"}`}
                                onClick={() => setSeccionInmuebleActiva(3)}
                            >
                                Seguro
                            </button>
                        </div>
                        {/* Formulario de la sección seleccionada */}
                        <div className="mb-4 mt-4 w-full">
                            {seccionInmuebleActiva === 0 && (
                                <div className="border border-black rounded-md p-2">
                                    <strong className="text-lg">Datos Registrales</strong>
                                    <InmuebleForm
                                        inmueble={inmuebles[inmuebleActivo].datosInmueble}
                                        setInmueble={setDatosInmuebleActivo}
                                        validationErrors={ValidarErrores}
                                    />
                                </div>
                            )}
                            {seccionInmuebleActiva === 1 && (
                                <div className="border border-black rounded-md p-2">
                                    <strong className="text-lg">Proveedor</strong>
                                    <InmuebleProveedorForm
                                        inmuebleProveedor={inmuebles[inmuebleActivo].datosProveedor}
                                        setInmuebleProveedor={setDatosProveedorActivo}
                                        validationErrors={ValidarErrores}
                                    />
                                </div>
                            )}
                            {seccionInmuebleActiva === 2 && (
                                <div className="border border-black rounded-md p-2">
                                    <strong className="text-lg">Hipoteca</strong>
                                    <InmuebleHipotecaForm
                                        inmuebleHipoteca={inmuebles[inmuebleActivo].datosHipoteca}
                                        setInmuebleHipoteca={setDatosHipotecaActivo}
                                        validationErrors={ValidarErrores}
                                    />
                                </div>
                            )}
                            {seccionInmuebleActiva === 3 && (
                                <div className="border border-black rounded-md p-2">
                                    <strong className="text-lg">Seguro</strong>
                                    <InmuebleSeguroForm
                                        inmuebleSeguro={inmuebles[inmuebleActivo].datosSeguro}
                                        setInmuebleSeguro={setDatosSeguroActivo}
                                        validationErrors={ValidarErrores}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                }
            </div>
            {/* Botón para añadir cliente e inmuebles */}
            <div className="flex justify-end mt-6">
                {errorCliente && (
                    <span className="text-red-600 mr-4">{errorCliente}</span>
                )}
                <button
                    className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                    onClick={async () => {
                        if (!validarCamposObligatorios()) return;

                        const cliente = {
                            empresa: datosEmpresa,
                            direccion: dirEmpresa,
                            datoRegistral: datoRegistralEmpresa,
                            propietario: datosPropietario,
                        };


                        // Llama a la función para guardar cliente e inmuebles
                        const exito = await manejarFormularioCliente(cliente, inmuebles);

                        if (exito) {
                            setMensajeExito("¡Cliente y sus inmuebles añadidos correctamente!");
                            setErrorCliente("");

                            // Limpiar formulario de cliente
                            setDatosEmpresa({ clave: "", cif: "", nombre: "", tel: "" });
                            setDirEmpresa({ calle: "", numero: "", piso: "", cp: "", localidad: "" });
                            setDatoRegistralEmpresa({ num_protocolo: "", folio: "", hoja: "", inscripcion: "", notario: "", fecha_inscripcion: "" });
                            setDatosPropietario({ nie: "", nombre: "", email: "", telefono: "" });

                        } else {
                            setMensajeExito("");
                            setErrorCliente("Ocurrió un error al guardar el cliente.");
                        }
                    }}
                >
                    Añadir Cliente
                </button>
            </div>
        </div>
    );
};

export default AddClientesPage;