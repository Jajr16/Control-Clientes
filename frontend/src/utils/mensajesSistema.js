export const VALIDACIONES_FORMULARIO = {
    REQUERIDO: (campo) => ({ field: campo, message: `El campo ${campo} es obligatorio.` }),
    INVALID_FORMAT: (campo) => ({ field: campo, message: `El formato de '${campo}' no es válido.` }),
    TAM: (campo, length) => ({ field: campo, message: `El campo ${campo} debe tener ${length} caracteres.` }),
    NUMBER: (campo) => ({ field: campo, message: `El campo ${campo} debe de ser un número.` })
};

export const APP_MESSAGES = {
    SUCCESS: {
        OPERACION_EXITOSA: " Operación realizada con éxito.",
    },
    ERROR: {
        API_ERROR: (details) => `Error en la API: ${details || 'Ha ocurrido un error inesperado.'}`,
        GENERICO: "Ha ocurrido un error inesperado al procesar su solicitud.",
    },
};