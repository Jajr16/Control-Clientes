import { useState, useCallback } from "react";
import Swal from 'sweetalert2';

import { addAdeudo } from "../api/moduloAdeudos/adeudos.js"; // Simula tu endpoint de backend
import { validarAdeudo } from "../utils/validarFormAdeudo.js";
import { APP_MESSAGES } from "../utils/mensajesSistema.js";

export const manejarLogicaAdeudo = () => {
    const [datosAdeudo, setDatosAdeudo] = useState({
        concepto: "",
        proveedor: "",
        ff: "",
        num_factura: "",
        protocolo_entrada: "",
        importe: "",
        iva: 0,
        retencion: 0,
        csiniva: "",
        total: 0,
        anticipo_cliente: "",
        // honorarios: "",
        empresa_cif: "",
        total_adeudos: 0,
        adeudo_pendiente: 0
    });

    const [ValidarErrores, setValidarErrores] = useState({});

    const manejarFormularioAdeudo = useCallback(async (e) => {
        e.preventDefault();
        setValidarErrores({});

        const errores = validarAdeudo(datosAdeudo); // Devuelve array de { field, message }
        const erroresCompletos = {};
        errores.forEach(err => erroresCompletos[err.field] = err.message);

        if (Object.keys(erroresCompletos).length > 0) {
            setValidarErrores(erroresCompletos);
            const errorMessages = Object.values(erroresCompletos);
            Swal.fire({
                icon: 'error',
                title: 'Errores de Validación',
                html: `<ul style="text-align: left;">${errorMessages.map(msg => `<li>${msg}</li>`).join('')}</ul>`,
                confirmButtonText: 'Entendido'
            });
            return;
        }

        try {
            await addAdeudo(datosAdeudo);

            Swal.fire({
                icon: 'success',
                title: 'Registro Completo',
                text: APP_MESSAGES.SUCCESS.OPERACION_EXITOSA,
            });

        } catch (error) {
            console.error("Error al guardar el adeudo:", error);
            const errorMessage = (error.response && error.response.data && error.response.data.error)
                ? APP_MESSAGES.ERROR.API_ERROR(error.response.data.error)
                : APP_MESSAGES.ERROR.GENERICO;

            Swal.fire({
                icon: 'error',
                title: 'Error en el Registro',
                text: errorMessage,
            });
        }

    }, [datosAdeudo]);

    return {
        datosAdeudo, setDatosAdeudo,
        ValidarErrores,
        manejarFormularioAdeudo
    };
};
