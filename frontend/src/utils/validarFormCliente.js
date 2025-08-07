import { VALIDACIONES_FORMULARIO } from './mensajesSistema'

export const esNumero = (valor) => /^\d+$/.test(valor);

export const validarDatosEmpresa = (datosEmpresa) => {
    const errors = [];

    if (!datosEmpresa.clave) errors.push(VALIDACIONES_FORMULARIO.REQUERIDO("Clave de la empresa"))
    else if (datosEmpresa.clave.length !== 3) errors.push(VALIDACIONES_FORMULARIO.TAM("Clave de empresa", 3));

    if (!datosEmpresa.cif) errors.push(VALIDACIONES_FORMULARIO.REQUERIDO('CIF de la empresa'))
    else if (datosEmpresa.cif.length !== 9) errors.push(VALIDACIONES_FORMULARIO.TAM("CIF de la empresa", 9));

    if (!datosEmpresa.nombre) errors.push(VALIDACIONES_FORMULARIO.REQUERIDO('Nombre de la empresa'));

    if (!datosEmpresa.tel) errors.push(VALIDACIONES_FORMULARIO.REQUERIDO('Teléfono de la empresa'))
    else if (datosEmpresa.tel.length != 10) errors.push(VALIDACIONES_FORMULARIO.TAM("Teléfono de la empresa", 10))
    else if (!esNumero(datosEmpresa.tel)) errors.push(VALIDACIONES_FORMULARIO.NUMBER("Teléfono de la empresa"));

    return errors;
}

export const validarDireccion = (datosDireccion, seccion) => {
    const errors = [];

    if (!datosDireccion.calle) errors.push(VALIDACIONES_FORMULARIO.REQUERIDO(`Calle de ${seccion}`))
    
    if (!datosDireccion.numero) errors.push(VALIDACIONES_FORMULARIO.REQUERIDO(`Número de dirección de ${seccion}`))
    else if (!esNumero(datosDireccion.numero)) errors.push(VALIDACIONES_FORMULARIO.NUMBER(`Número de dirección de ${seccion}`))

    if (!datosDireccion.piso) errors.push(VALIDACIONES_FORMULARIO.REQUERIDO(`Piso de dirección de ${seccion}`))
    else if (!esNumero(datosDireccion.piso)) errors.push(VALIDACIONES_FORMULARIO.NUMBER(`Piso de dirección de ${seccion}`))

    if (!datosDireccion.cp) errors.push(VALIDACIONES_FORMULARIO.REQUERIDO(`Código postal de ${seccion}`))
    else if (!esNumero(datosDireccion.cp)) errors.push(VALIDACIONES_FORMULARIO.NUMBER(`Código postal de ${seccion}`))

    if (!datosDireccion.localidad) errors.push(VALIDACIONES_FORMULARIO.REQUERIDO(`Localidad de ${seccion}`))

    return errors;
}

export const validarDatoRegistral = (datosRegistrales, seccion) => {
    const errors = [];

    if (!datosRegistrales.n_protocolo) errors.push(VALIDACIONES_FORMULARIO.REQUERIDO(`Nn. Protocolo de ${seccion}`))
    else if(!esNumero(datosRegistrales.n_protocolo)) errors.push(VALIDACIONES_FORMULARIO.NUMBER(`Código postal de ${seccion}`))

    if (!datosRegistrales.folio) errors.push(VALIDACIONES_FORMULARIO.REQUERIDO(`Folio de ${seccion}`))
    else if (!esNumero(datosRegistrales.folio)) errors.push(VALIDACIONES_FORMULARIO.NUMBER(`Folio de ${seccion}`))

    if (!datosRegistrales.hoja) errors.push(VALIDACIONES_FORMULARIO.REQUERIDO(`Hoja de ${seccion}`))
    else if (!esNumero(datosRegistrales.hoja)) errors.push(VALIDACIONES_FORMULARIO.NUMBER(`Hoja de ${seccion}`))

    if (!datosRegistrales.inscripcion) errors.push(VALIDACIONES_FORMULARIO.REQUERIDO(`Inscripción de ${seccion}`))
    else if (!esNumero(datosRegistrales.inscripcion)) errors.push(VALIDACIONES_FORMULARIO.NUMBER(`Inscripción de ${seccion}`))

    if (!datosRegistrales.fecha_inscripcion) errors.push(VALIDACIONES_FORMULARIO.REQUERIDO(`Fecha de inscripcion de ${seccion}`))

    if (!datosRegistrales.notario) errors.push(VALIDACIONES_FORMULARIO.REQUERIDO(`Nombre de notario de ${seccion}`))

    return errors;
}

export const validarPropietario = (datosPropietario) => {
    const errors = [];
    
    if (!datosPropietario.nie) errors.push(VALIDACIONES_FORMULARIO.REQUERIDO(`NIE`))
    else if (datosPropietario.nie.length !== 9) errors.push(VALIDACIONES_FORMULARIO.TAM("NIE", 9))

    if (!datosPropietario.propietario) errors.push(VALIDACIONES_FORMULARIO.REQUERIDO(`Propietario`))
        
    if (!datosPropietario.telPropietario) errors.push(VALIDACIONES_FORMULARIO.REQUERIDO(`Telefono`))
    else if (!esNumero(datosPropietario.telPropietario)) errors.push(VALIDACIONES_FORMULARIO.NUMBER(`Telefono propietario`))

    if (!datosPropietario.email) errors.push(VALIDACIONES_FORMULARIO.REQUERIDO(`Correo`))
    else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(propietarioData.email)) {
        errors.push(APP_MESSAGES.ERROR.PROPIETARIO_EMAIL_INVALIDO);
    }
}
    
    return errors;
}

export const validarClienteCompleto = (datosEmpresa, datosDireccion, datosRegistrales, datosPropietario, seccion) => {
    let allErrors = [];
    allErrors = allErrors.concat(validarDatosEmpresa(datosEmpresa));
    allErrors = allErrors.concat(validarDireccion(datosDireccion, seccion));
    allErrors = allErrors.concat(validarDatoRegistral(datosRegistrales, seccion));
    allErrors = allErrors.concat(validarPropietario(datosPropietario));
    return allErrors;
};