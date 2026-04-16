import React, { useEffect } from 'react';
import EmpresaForm from '../../clientes/components/forms/EmpresaForms.jsx';
import PropietarioForm from '../../clientes/components/forms/PropietarioForms.jsx';
import { FormProvider, useForm } from 'react-hook-form';

const ModalEditarCliente = ({ isOpen, onClose, data, onSave }) => {
    console.log(data)
    const methods = useForm({
        defaultValues: {
            propietario: {},
            empresa: {}
        }
    });

    const { reset, handleSubmit } = methods;

    useEffect(() => {
        if (isOpen && data) {
            reset({
                propietario: {
                    nie: "",
                    nombre: "",
                    email: "",
                    telefono: ""
                },
                empresa: {
                    cif: "",
                    nombre: "",
                    telefono: "",
                    clave: "",
                    direccion: {
                        calle: "",
                        numero: "",
                        piso: "",
                        codigo_postal: "",
                        localidad: ""
                    },
                    dato_registral: {
                        fecha_inscripcion: "",
                        folio: "",
                        hoja: "",
                        inscripcion: "",
                        notario: "",
                        num_protocolo: ""
                    }
                },
            })
        }
    }, [isOpen, data, reset])

    if (!isOpen) return null;

    const onSubmit = (cif, data) => {
        onSave(cif, data)
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">

                {/* Cabecera fija */}
                <div className="p-6 border-b bg-gray-50 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Editar Información del Cliente</h2>
                        <p className="text-sm text-gray-500">Modifica los datos de la empresa y el propietario</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
                </div>

                {/* Cuerpo con Scroll y diseño de 2 Columnas */}
                <FormProvider {...methods}>
                    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
                        <div className="p-6 overflow-y-auto bg-white">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">

                                {/* Columna Izquierda: Empresa (Incluye Dirección y Datos Registrales según tu EmpresaForm) */}
                                <div className="space-y-6">
                                    <EmpresaForm />
                                </div>

                                {/* Columna Derecha: Propietario */}
                                <div className="space-y-6">
                                    <PropietarioForm />

                                    {/* Nota: Si quieres que Dirección o Datos Registrales aparezcan a la derecha, 
                                deberías sacarlos de EmpresaForm e importarlos aquí directamente */}
                                    <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
                                        <p className="text-xs text-blue-700 font-medium">
                                            Asegúrese de rellenar todos los campos marcados con asterisco (*).
                                        </p>
                                    </div>
                                </div>

                            </div>
                        </div>

                        {/* Pie fijo con botones */}
                        <div className="p-6 border-t bg-gray-50 flex justify-end space-x-3">
                            <button
                                onClick={onClose}
                                className="px-6 py-2.5 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-medium"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={onSubmit(data.cif, data)}
                                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all font-medium"
                            >
                                Guardar Cambios
                            </button>
                        </div>
                    </form>
                </FormProvider>
            </div>
        </div >
    );
};

export default ModalEditarCliente;