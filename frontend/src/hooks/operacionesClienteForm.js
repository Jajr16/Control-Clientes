import { useState, useCallback } from "react";
import Swal from 'sweetalert2';
import { clienteNuevo } from "../api/moduloClientes/clientes.js";

// Función para procesar errores y convertirlos en un objeto estructurado
const procesarErroresValidacion = (detalles) => {
    const erroresProcesados = {};
    
    detalles.forEach(error => {
        // error.path es un array como ['cliente', 'empresa', 'cif']
        const path = error.path.join('.');
        erroresProcesados[path] = error.message;
    });
    
    return erroresProcesados;
};

export const manejarLogicaCliente = () => {
    const [datosEmpresa, setDatosEmpresa] = useState({});
    const [dirEmpresa, setDirEmpresa] = useState({});
    const [datoRegistralEmpresa, setDatoRegistralEmpresa] = useState({});
    const [datosPropietario, setDatosPropietario] = useState({});
    const [erroresValidacion, setErroresValidacion] = useState({});

    const manejarFormularioCliente = useCallback(async (datosCliente) => {
        try {
            // Limpiar errores previos
            setErroresValidacion({});
            
            const response = await clienteNuevo(datosCliente);
            console.log(response)

            return response;

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

            return false;
        }
    }, []);

    return {
        datosEmpresa, setDatosEmpresa,
        dirEmpresa, setDirEmpresa,
        datoRegistralEmpresa, setDatoRegistralEmpresa,
        datosPropietario, setDatosPropietario,
        erroresValidacion,
        setErroresValidacion,
        manejarFormularioCliente
    };
};