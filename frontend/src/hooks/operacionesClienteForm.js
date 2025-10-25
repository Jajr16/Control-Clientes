import { useState, useCallback } from "react";
import Swal from 'sweetalert2';

import { APP_MESSAGES } from "../utils/mensajesSistema.js";

import { clienteNuevo } from "../api/moduloClientes/clientes.js";

export const manejarLogicaCliente = () => {
    const [datosEmpresa, setDatosEmpresa] = useState({});
    const [dirEmpresa, setDirEmpresa] = useState({});
    const [datoRegistralEmpresa, setDatoRegistralEmpresa] = useState({});
    const [datosPropietario, setDatosPropietario] = useState({});

    const manejarFormularioCliente = useCallback(async (datosCliente) => {
        const response = await clienteNuevo({datosCliente: datosCliente});
        console.log(response)
    });

    return {
        datosEmpresa, setDatosEmpresa,
        dirEmpresa, setDirEmpresa,
        datoRegistralEmpresa, setDatoRegistralEmpresa,
        datosPropietario, setDatosPropietario,
        manejarFormularioCliente
    }
}