import { useState, useEffect } from "react";
import { X, Plus, Building } from 'lucide-react';
import { InmuebleComponentes } from "./InmuebleComponentes.jsx";
import { addComponentes } from "../../api/moduloInmuebles/inmueble.js";

import Swal from 'sweetalert2';
import {
    generarSeguroRandom,
    generarProveedorRandom,
    generarHipotecaRandom
} from "../../utils/mockGenerators";

const ModalComponentes = ({ CC, onComponenteAgregado }) => {
    const [modalAbierto, setModalAbierto] = useState(false);

    // Estados de colecciones
    const [seguros, setSeguros] = useState([]);
    const [proveedores, setProveedores] = useState([]);
    const [hipotecas, setHipotecas] = useState([]);

    // Resetear formulario
    const resetearFormulario = () => {
        setSeguros([]);
        setProveedores([]);
        setHipotecas([]);
    };

    // Guardar inmueble
    const guardarInmueble = async () => {

        const nuevoInmueble = {
            clave_catastral: CC,
            seguros: seguros.map(({ id, ...rest }) => rest),
            proveedores: proveedores.map(({ id, ...rest }) => rest),
            hipotecas: hipotecas.map(({ id, ...rest }) => rest)
        };

        console.log('Inmueble a guardar:', nuevoInmueble);

        try {
            // TODO: Reemplazar con tu llamada API real
            // await crearInmueble(nuevoInmueble);
            const response = await addComponentes(nuevoInmueble)
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
            if (onComponenteAgregado) {
                onComponenteAgregado();
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
            setSeguros([generarSeguroRandom()]);
            setProveedores([generarProveedorRandom()]);
            setHipotecas([generarHipotecaRandom()]);
        }
    }, [modalAbierto]);

    return (
        <div className="flex">
            {/* Botón para abrir modal */}
            <button
                onClick={() => setModalAbierto(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg transition-colors duration-200 flex items-center">
                <Plus className="w-4 h-4 text-gray-600" />
                Agregar Componentes
            </button>

            {/* Modal */}
            {modalAbierto && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Header */}
                        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between z-10">
                            <h2 className="text-2xl font-bold flex items-center gap-2">
                                <Building className="w-6 h-6" />
                                Nuevos Componentes
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
                                Guardar Componentes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ModalComponentes;