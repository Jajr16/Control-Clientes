import React, { useEffect, useState } from "react";
import { RiArrowDownSLine, RiArrowUpSLine } from "react-icons/ri";

import DatoRegistralForm from "../components/forms/DatoRegistralForms.jsx";
import DireccionForm from "../components/forms/DireccionForms.jsx";
import EmpresaForm from "../components/forms/EmpresaForms.jsx";
import PropietarioForm from "../components/forms/PropietarioForms.jsx";

import { manejarLogicaCliente } from "../hooks/operacionesClienteForm.js";

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
        <div>
            {/* Formulario para agregar Empresa con Referencias */}
            <strong className="text-2xl"><center>Nuevo Cliente</center></strong>
            <div className="border border-black rounded-b-lg">
                <div className="border-b border-black flex w-full justify-between">
                    <strong className="text-xl ml-5">Datos Empresa</strong>
                    <RiArrowDownSLine className="h-6 w-6" onClick={toggleFormularioCliente}/>
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
                                direccion={datosPropietario}
                                setPropietario={setDatosPropietario}
                                validationErrors={ValidarErrores}
                            />
                        </div>
                    </div>
                    <div></div>
                </div>
                }
            </div>
        </div>
    );
};

export default AddClientesPage;
