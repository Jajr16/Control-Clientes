import { useState, useCallback } from "react";
import Swal from 'sweetalert2';

import { addEmpresas } from "../api/moduloClientes/empresas.js";
import { addDirecciones } from "../api/moduloClientes/direcciones.js";
import { addPropietario } from "../api/moduloClientes/propietario.js";
import { addDatoRegistral } from "../api/moduloClientes/datoRegistral.js";

import { validarClienteCompleto } from '../utils/validarFormCliente.js'
import { APP_MESSAGES } from "../utils/mensajesSistema.js";

export const manejarLogicaCliente = () => {
    const [datosEmpresa, setDatosEmpresa] = useState({ clave: "", cif: "", nombre: "", tel: "" }) 
    const [dirEmpresa, setDirEmpresa] = useState({ calle: "", numero: "", piso: "", cp: "", localidad: "" })
    const [datoRegistralEmpresa, setDatoRegistralEmpresa] = useState({ n_protocolo: "", folio: "", hoja: "",
        inscripcion: "", fecha_inscripcion: "", notario: "" })
    const [datosPropietario, setDatosPropietario] = useState({ nie: "", nombre: "", tel: "", email: "" })

    const [ValidarErrores, setValidarErrores] = useState({})

    const manejarFormularioCliente = useCallback(async (e) => {
        e.preventDefault()
        setValidarErrores({})

        let erroresCompletos = {}

        const validarDatosCliente = validarClienteCompleto( 
            datosEmpresa,
            dirEmpresa,
            datoRegistralEmpresa,
            datosPropietario
        )    
        erroresCompletos.forEach(err => erroresCompletos[err.field] = err.message)

        if (Object.keys(erroresCompletos).length > 0) {
            setValidarErrores(erroresCompletos)
        const errorMessages = Object.values(allErrors);
            Swal.fire({
                icon: 'error',
                title: 'Errores de Validación',
                html: `<ul style="text-align: left;">${errorMessages.map(msg => `<li>${msg}</li>`).join('')}</ul>`,
                confirmButtonText: 'Entendido'
            });
            return;
        }

        try {
            console.log(`Datos obtenidos del formulario: \n Empresa: ${datosEmpresa}\n DireccionEmpresa: ${dirEmpresa}`)
            console.log(`Datos Registrales empresa: ${datoRegistralEmpresa}\n Propietario: ${datosPropietario}`)

            const nuevoPropietario = await addPropietario(datosPropietario)
            const nuevaDireccion = await addDirecciones(dirEmpresa)
            const nuevoDatoRegistral = await addDatoRegistral(datoRegistralEmpresa)
            const nuevaEmpresa = await addEmpresas(datosEmpresa)

            Swal.fire({
                icon: 'success',
                title: 'Registro Completo',
                text: APP_MESSAGES.SUCCESS.OPERACION_EXITOSA,
            })
            
        } catch (error) {
            console.error("Error completo en el registro:", error);
            const errorMessage = (error.response && error.response.data && error.response.data.error)
                ? APP_MESSAGES.ERROR.API_ERROR(error.response.data.error)
                : APP_MESSAGES.ERROR.GENERICO;

            Swal.fire({
                icon: 'error',
                title: 'Error en el Registro',
                text: errorMessage,
            });
        }

    })

    return {
        datosEmpresa, setDatosEmpresa,
        dirEmpresa, setDirEmpresa,
        datoRegistralEmpresa, setDatoRegistralEmpresa,
        datosPropietario, setDatosPropietario,
        ValidarErrores,
        manejarFormularioCliente
    }
}