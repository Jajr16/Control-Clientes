import React, { useEffect, useState } from "react";
import { RiArrowDownSLine, RiArrowUpSLine } from "react-icons/ri";

import DatoRegistralForm from "../../components/forms/DatoRegistralForms.jsx";
import DireccionForm from "../../components/forms/DireccionForms.jsx";
import EmpresaForm from "../../components/forms/EmpresaForms.jsx";
import PropietarioForm from "../../components/forms/PropietarioForms.jsx";

import { manejarLogicaCliente } from "../../hooks/operacionesClienteForm.js";

const AddClientesPage = () => {
    const {
        datosEmpresa, setDatosEmpresa,
        dirEmpresa, setDirEmpresa,
        datoRegistralEmpresa, setDatoRegistralEmpresa,
        datosPropietario, setDatosPropietario,
        ValidarErrores,
        manejarFormularioCliente
    } = manejarLogicaCliente();

    // Estado para controlar la visibilidad del formulario principal
    const [mostrarFormulariosCliente, setMostrarFormulariosCliente] = useState(false);
    
    const toggleFormularioCliente = () => {
        setMostrarFormulariosCliente(!mostrarFormulariosCliente);
    };

    return (
        <div className="w-full h-full p-2 sm:p-4 lg:p-6">
            <div className="max-w-7xl mx-auto">
                {/* Título principal */}
                <div className="text-center mb-4 sm:mb-6">
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">
                        Nuevo Cliente
                    </h1>
                </div>

                {/* Contenedor principal del formulario */}
                <div className="bg-white border border-gray-300 rounded-lg shadow-sm overflow-hidden">
                    {/* Header del formulario */}
                    <div 
                        className="border-b border-gray-300 flex items-center justify-between p-3 sm:p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={toggleFormularioCliente}
                    >
                        <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                            Datos Empresa
                        </h2>
                        <button className="p-1 rounded-full hover:bg-gray-200 transition-colors">
                            {mostrarFormulariosCliente ? (
                                <RiArrowUpSLine className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" />
                            ) : (
                                <RiArrowDownSLine className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" />
                            )}
                        </button>
                    </div>

                    {/* Contenido del formulario */}
                    {mostrarFormulariosCliente && (
                        <div className="p-3 sm:p-4 lg:p-6">
                            {/* Layout Desktop */}
                            <div className="hidden lg:grid lg:grid-cols-2 lg:gap-6">
                                {/* Formulario de Empresa */}
                                <div className="border border-gray-300 rounded-lg p-4">
                                    <h3 className="text-lg font-semibold mb-4 text-gray-800">
                                        Empresa
                                    </h3>
                                    <div className="space-y-4">
                                        <EmpresaForm
                                            empresa={datosEmpresa}
                                            setEmpresa={setDatosEmpresa}
                                            validationErrors={ValidarErrores}
                                        />
                                        <div className="border-t border-gray-200 pt-4">
                                            <DireccionForm
                                                direccion={dirEmpresa}
                                                setDireccion={setDirEmpresa}
                                                validationErrors={ValidarErrores}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Formulario de Propietario */}
                                <div className="border border-gray-300 rounded-lg p-4">
                                    <h3 className="text-lg font-semibold mb-4 text-gray-800">
                                        Propietario
                                    </h3>
                                    <PropietarioForm
                                        direccion={datosPropietario}
                                        setPropietario={setDatosPropietario}
                                        validationErrors={ValidarErrores}
                                    />
                                </div>
                            </div>

                            {/* Layout Mobile/Tablet */}
                            <div className="lg:hidden space-y-4 sm:space-y-6">
                                {/* Formulario de Empresa */}
                                <div className="border border-gray-300 rounded-lg p-3 sm:p-4">
                                    <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-gray-800">
                                        Empresa
                                    </h3>
                                    <div className="space-y-3 sm:space-y-4">
                                        <EmpresaForm
                                            empresa={datosEmpresa}
                                            setEmpresa={setDatosEmpresa}
                                            validationErrors={ValidarErrores}
                                        />
                                        <div className="border-t border-gray-200 pt-3 sm:pt-4">
                                            <DireccionForm
                                                direccion={dirEmpresa}
                                                setDireccion={setDirEmpresa}
                                                validationErrors={ValidarErrores}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Formulario de Propietario */}
                                <div className="border border-gray-300 rounded-lg p-3 sm:p-4">
                                    <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-gray-800">
                                        Propietario
                                    </h3>
                                    <PropietarioForm
                                        direccion={datosPropietario}
                                        setPropietario={setDatosPropietario}
                                        validationErrors={ValidarErrores}
                                    />
                                </div>
                            </div>

                            {/* Botones de acción (opcional) */}
                            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6 pt-4 border-t border-gray-200">
                                <button 
                                    className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
                                    onClick={manejarFormularioCliente}
                                >
                                    Guardar Cliente
                                </button>
                                <button 
                                    className="flex-1 sm:flex-none px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors font-medium"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AddClientesPage;