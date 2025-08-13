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

export const validarDatoRegistral = (datosRegistrales, seccion = "la empresa") => {
    const errors = [];

    if (!datosRegistrales.num_protocolo) errors.push(VALIDACIONES_FORMULARIO.REQUERIDO(`Número de Protocolo de ${seccion}`));
    else if (!esNumero(datosRegistrales.num_protocolo)) errors.push(VALIDACIONES_FORMULARIO.NUMBER(`Número de Protocolo de ${seccion}`));

    if (!datosRegistrales.folio) errors.push(VALIDACIONES_FORMULARIO.REQUERIDO(`Folio de ${seccion}`));
    else if (!esNumero(datosRegistrales.folio)) errors.push(VALIDACIONES_FORMULARIO.NUMBER(`Folio de ${seccion}`));

    if (!datosRegistrales.hoja) errors.push(VALIDACIONES_FORMULARIO.REQUERIDO(`Hoja de ${seccion}`));
    else if (!esNumero(datosRegistrales.hoja)) errors.push(VALIDACIONES_FORMULARIO.NUMBER(`Hoja de ${seccion}`));

    if (!datosRegistrales.inscripcion) errors.push(VALIDACIONES_FORMULARIO.REQUERIDO(`Inscripción de ${seccion}`));
    else if (!esNumero(datosRegistrales.inscripcion)) errors.push(VALIDACIONES_FORMULARIO.NUMBER(`Inscripción de ${seccion}`));

    if (!datosRegistrales.fecha_inscripcion) errors.push(VALIDACIONES_FORMULARIO.REQUERIDO(`Fecha de inscripción de ${seccion}`));

    if (!datosRegistrales.notario) errors.push(VALIDACIONES_FORMULARIO.REQUERIDO(`Nombre de notario de ${seccion}`));

    return errors;
}

export const validarPropietario = (datosPropietario) => {
    const errors = [];

    if (!datosPropietario.nie) errors.push(VALIDACIONES_FORMULARIO.REQUERIDO(`NIE`));
    else if (datosPropietario.nie.length !== 9) errors.push(VALIDACIONES_FORMULARIO.TAM("NIE", 9));

    if (!datosPropietario.nombre) errors.push(VALIDACIONES_FORMULARIO.REQUERIDO(`Nombre del propietario`));

    if (!datosPropietario.email) errors.push(VALIDACIONES_FORMULARIO.REQUERIDO(`Correo del propietario`));
    else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(datosPropietario.email)) {
            errors.push(APP_MESSAGES.ERROR.PROPIETARIO_EMAIL_INVALIDO);
        }
    };

    if (!datosPropietario.telefono) errors.push(VALIDACIONES_FORMULARIO.REQUERIDO(`Teléfono del propietario`));
    else if (!esNumero(datosPropietario.telefono)) errors.push(VALIDACIONES_FORMULARIO.NUMBER(`Teléfono del propietario`));

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

export const validarInmueble = (datosInmueble) => {
    const errors = [];

    if (!datosInmueble.clave_catastral) errors.push(VALIDACIONES_FORMULARIO.REQUERIDO("Clave Catastral del Inmueble"));
    else if (datosInmueble.clave_catastral.length > 25) errors.push(VALIDACIONES_FORMULARIO.TAM("Clave Catastral del Inmueble", 25));

    if (!datosInmueble.direccion) errors.push(VALIDACIONES_FORMULARIO.REQUERIDO("Dirección del Inmueble"));
    else if (!esNumero(datosInmueble.direccion)) errors.push(VALIDACIONES_FORMULARIO.NUMBER("Dirección del Inmueble"));

    if (!datosInmueble.dato_registral) errors.push(VALIDACIONES_FORMULARIO.REQUERIDO("Dato Registral del Inmueble"));
    else if (!esNumero(datosInmueble.dato_registral)) errors.push(VALIDACIONES_FORMULARIO.NUMBER("Dato Registral del Inmueble"));

    return errors;
}

export const validarProveedor = (datosProveedor) => {
    const errors = [];

    if (!datosProveedor.nombre) errors.push(VALIDACIONES_FORMULARIO.REQUERIDO("Nombre del Proveedor"));

    if (!datosProveedor.tel) errors.push(VALIDACIONES_FORMULARIO.REQUERIDO("Teléfono del Proveedor"));
    else if (!esNumero(datosProveedor.tel)) errors.push(VALIDACIONES_FORMULARIO.NUMBER("Teléfono del Proveedor"));

    if (!datosProveedor.email) errors.push(VALIDACIONES_FORMULARIO.REQUERIDO("Correo del Proveedor"));

    return errors;
}

export const validarHipoteca = (datosHipoteca) => {
    const errors = [];

    if (!datosHipoteca.entidad) errors.push(VALIDACIONES_FORMULARIO.REQUERIDO("Entidad de la Hipoteca"));

    if (!datosHipoteca.cuota) errors.push(VALIDACIONES_FORMULARIO.REQUERIDO("Cuota de la Hipoteca"));
    else if (!esNumero(datosHipoteca.cuota)) errors.push(VALIDACIONES_FORMULARIO.NUMBER("Cuota de la Hipoteca"));

    if (!datosHipoteca.fecha_inicio) errors.push(VALIDACIONES_FORMULARIO.REQUERIDO("Fecha de Inicio de la Hipoteca"));

    return errors;
}

export const validarSeguro = (datosSeguro) => {
    const errors = [];

    if (!datosSeguro.compania) errors.push(VALIDACIONES_FORMULARIO.REQUERIDO("Compañía de Seguro"));

    if (!datosSeguro.poliza) errors.push(VALIDACIONES_FORMULARIO.REQUERIDO("Póliza de Seguro"));

    if (!datosSeguro.fecha_inicio) errors.push(VALIDACIONES_FORMULARIO.REQUERIDO("Fecha de Inicio del Seguro"));

    if (!datosSeguro.fecha_fin) errors.push(VALIDACIONES_FORMULARIO.REQUERIDO("Fecha de Fin del Seguro"));

    return errors;
}

export const validarInmuebleCompleto = (datosInmueble, datosProveedor, datosHipoteca, datosSeguro) => {
    let allErrors = [];
    allErrors = allErrors.concat(validarInmueble(datosInmueble));
    allErrors = allErrors.concat(validarProveedor(datosProveedor));
    allErrors = allErrors.concat(validarHipoteca(datosHipoteca));
    allErrors = allErrors.concat(validarSeguro(datosSeguro));
    return allErrors;
}