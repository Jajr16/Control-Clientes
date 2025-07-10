export const VALIDACIONES_FORMULARIO = {
    REQUERIDO: (campo) => `El campo ${campo} es obligatorio.`,
    INVALID_FORMAT: (campo) => `El formato de '${campo}' no es válido.`,
    TAM: (campo, length) => `El campo ${campo} debe tener ${length} caracteres.`,
    NUMBER: (campo) => `El campo ${campo} debe de ser un número.`
}

export const APP_MESSAGES = {
    SUCCESS: {
        OPERACION_EXITOSA: " Operación realizada con éxito.",
    },
    ERROR: {
        API_ERROR: (details) => `Error en la API: ${details || 'Ha ocurrido un error inesperado.'}`,
        GENERICO: "Ha ocurrido un error inesperado al procesar su solicitud.",
    },
};