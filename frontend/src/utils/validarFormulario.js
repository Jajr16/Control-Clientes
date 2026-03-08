export const validarCampos = (data, camposObligatorios) => {

    const errores = {}

    camposObligatorios.forEach(campo => {

        if (!data?.[campo]) {
            errores[campo] = `El campo ${campo} es obligatorio`
        }

    })

    return errores
}