export const setBackendErrors = (fields, setError, abrirSecciones) => {
    Object.entries(fields).forEach(([field, message]) => {
        setError(field, { type: "server", message });
    });

    if (abrirSecciones) abrirSecciones(fields);
};