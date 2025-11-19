import Swal from 'sweetalert2';
import { useState, useEffect } from "react";
import { X, Plus, Building } from 'lucide-react';
import InmuebleForm from "../forms/InmuebleForms.jsx";
import { InmuebleComponentes } from "./InmuebleComponentes.jsx";
import {
    generarInmuebleRandom,
    generarSeguroRandom,
    generarProveedorRandom,
    generarHipotecaRandom
} from "../../utils/mockGenerators";

import { addInmueble } from "../../api/moduloInmuebles/inmueble.js";

const ModalAgregarInmueble = ({ cifCliente, onInmuebleAgregado }) => {
    const [modalAbierto, setModalAbierto] = useState(false);

    // Estado del inmueble (estructura completa como espera InmuebleForm)
    const [inmueble, setInmueble] = useState({
        clave_catastral: '',
        valor_adquisicion: '',
        fecha_adquisicion: '',
        dirInmueble: {
            calle: '',
            numero: '',
            piso: '',
            cp: '',
            localidad: ''
        },
        datoRegistralInmueble: {
            num_protocolo: '',
            folio: '',
            hoja: '',
            inscripcion: '',
            notario: '',
            fecha_inscripcion: ''
        }
    });

    // Estados de colecciones
    const [seguros, setSeguros] = useState([]);
    const [proveedores, setProveedores] = useState([]);
    const [hipotecas, setHipotecas] = useState([]);

    const [errores, setErrores] = useState({});

    // Resetear formulario
    const resetearFormulario = () => {
        setInmueble({
            clave_catastral: '',
            valor_adquisicion: '',
            fecha_adquisicion: '',
            dirInmueble: {
                calle: '',
                numero: '',
                piso: '',
                cp: '',
                localidad: ''
            },
            datoRegistralInmueble: {
                num_protocolo: '',
                folio: '',
                hoja: '',
                inscripcion: '',
                notario: '',
                fecha_inscripcion: ''
            }
        });
        setSeguros([]);
        setProveedores([]);
        setHipotecas([]);
        setErrores({});
    };

    // Validar formulario
    const validarFormulario = () => {
        const nuevosErrores = {};

        if (!inmueble.clave_catastral) nuevosErrores.claveCatastral = 'Campo requerido';
        if (!inmueble.valor_adquisicion) nuevosErrores.valorAdquisicion = 'Campo requerido';
        if (!inmueble.fecha_adquisicion) nuevosErrores.fechaAdquisicion = 'Campo requerido';

        const dir = inmueble.dirInmueble || {};
        if (!dir.calle || !dir.numero || !dir.piso || !dir.cp || !dir.localidad) {
            nuevosErrores.direccion = 'Completa todos los campos de dirección';
        }

        const dato = inmueble.datoRegistralInmueble || {};
        if (!dato.num_protocolo || !dato.folio || !dato.hoja ||
            !dato.inscripcion || !dato.notario || !dato.fecha_inscripcion) {
            nuevosErrores.datoRegistral = 'Completa todos los datos registrales';
        }

        setErrores(nuevosErrores);
        return Object.keys(nuevosErrores).length === 0;
    };

    // Guardar inmueble
    const guardarInmueble = async () => {
        if (!validarFormulario()) {
            alert('Por favor completa todos los campos obligatorios');
            return;
        }

        const nuevoInmueble = {
            cif: cifCliente,
            datosInmueble: {
                clave_catastral: inmueble.clave_catastral,
                valor_adquisicion: parseFloat(inmueble.valor_adquisicion),
                fecha_adquisicion: inmueble.fecha_adquisicion,
                datoRegistralInmueble: {
                    num_protocolo: inmueble.datoRegistralInmueble.num_protocolo,
                    folio: inmueble.datoRegistralInmueble.folio,
                    hoja: inmueble.datoRegistralInmueble.hoja,
                    inscripcion: inmueble.datoRegistralInmueble.inscripcion,
                    notario: inmueble.datoRegistralInmueble.notario,
                    fecha_inscripcion: inmueble.datoRegistralInmueble.fecha_inscripcion,
                },
                dirInmueble: {
                    calle: inmueble.dirInmueble.calle,
                    numero: inmueble.dirInmueble.numero,
                    piso: inmueble.dirInmueble.piso,
                    cp: inmueble.dirInmueble.cp,
                    localidad: inmueble.dirInmueble.localidad,
                }
            },
            seguros: seguros.map(({ id, ...rest }) => rest),
            proveedores: proveedores.map(({ id, ...rest }) => rest),
            hipotecas: hipotecas.map(({ id, ...rest }) => rest)
        };

        console.log('Inmueble a guardar:', nuevoInmueble);

        try {
            const response = await addInmueble(nuevoInmueble)
            console.log(response)

            Swal.fire({
                icon: 'success',
                title: 'Inmueble creado!',
                text: response.data.message || 'El cliente se creó correctamente',
                confirmButtonText: 'OK'
            }).then((result) => {
                if (result.isConfirmed) {
                    resetearFormulario();
                    setModalAbierto(false);
                }
            });

            // Refrescar la lista de inmuebles
            if (onInmuebleAgregado) {
                onInmuebleAgregado();
            }
        } catch (error) {
            console.log(error);
            const datosError = error.response?.data;

            if (datosError?.details) {
                // Procesar errores de validación de Joi
                const erroresProcesados = procesarErroresValidacion(datosError.details);
                setErroresValidacion(erroresProcesados);

                // Mostrar mensaje general
                Swal.fire({
                    icon: 'error',
                    title: 'Errores de validación',
                    text: 'Por favor, revisa los campos marcados en rojo y corrige los errores.'
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error inesperado',
                    text: datosError?.error || datosError?.message || error.message || 'Ocurrió un error'
                });
            }

        }
    };

    useEffect(() => {
        if (modalAbierto) {
            const inmueble = generarInmuebleRandom();
            setInmueble(inmueble);

            setSeguros([generarSeguroRandom()]);
            setProveedores([generarProveedorRandom()]);
            setHipotecas([generarHipotecaRandom()]);
        }
    }, [modalAbierto]);

    return (
        <div className="p-2">
            {/* Botón para abrir modal */}
            <button
                onClick={() => setModalAbierto(true)}
                className="
                    w-full flex items-center justify-center gap-2
                    px-3 py-2 
                    border border-gray-300 
                    rounded-md 
                    bg-white 
                    text-gray-700 
                    hover:bg-gray-50 
                    transition
                ">
                <Plus className="w-4 h-4 text-gray-600" />
                Agregar Inmueble
            </button>

            {/* Modal */}
            {modalAbierto && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Header */}
                        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between z-10">
                            <h2 className="text-2xl font-bold flex items-center gap-2">
                                <Building className="w-6 h-6" />
                                Nuevo Inmueble
                            </h2>
                            <button
                                onClick={() => {
                                    setModalAbierto(false);
                                    resetearFormulario();
                                }}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Contenido */}
                        <div className="p-6 space-y-6">
                            {/* Datos básicos del inmueble usando InmuebleForm */}
                            <div className="border rounded-lg p-4 bg-blue-50">
                                <h3 className="font-semibold text-lg mb-3">Datos del Inmueble *</h3>
                                <InmuebleForm
                                    inmueble={inmueble}
                                    setInmueble={setInmueble}
                                    errores={errores}
                                    indice={0}
                                />
                            </div>

                            <InmuebleComponentes
                                seguros={seguros}
                                setSeguros={setSeguros}
                                proveedores={proveedores}
                                setProveedores={setProveedores}
                                hipotecas={hipotecas}
                                setHipotecas={setHipotecas}
                            />
                        </div>

                        {/* Footer con botones */}
                        <div className="sticky bottom-0 bg-white border-t p-4 flex justify-end gap-3 z-10">
                            <button
                                onClick={() => {
                                    setModalAbierto(false);
                                    resetearFormulario();
                                }}
                                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded-lg transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={guardarInmueble}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors font-semibold"
                            >
                                Guardar Inmueble
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ModalAgregarInmueble;