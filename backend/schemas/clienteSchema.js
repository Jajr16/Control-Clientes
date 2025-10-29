import Joi from 'joi';

// Mensajes personalizados en español
const mensajesES = {
    'string.empty': '{#label} no puede estar vacío',
    'string.min': '{#label} debe tener al menos {#limit} caracteres',
    'string.max': '{#label} no puede tener más de {#limit} caracteres',
    'string.length': '{#label} debe tener exactamente {#limit} caracteres',
    'string.email': '{#label} debe ser un correo electrónico válido',
    'string.pattern.base': '{#label} no tiene un formato válido',
    'number.base': '{#label} debe ser un número',
    'number.positive': '{#label} debe ser un número positivo',
    'number.integer': '{#label} debe ser un número entero',
    'date.base': '{#label} debe ser una fecha válida',
    'date.format': '{#label} debe tener el formato ISO (YYYY-MM-DD)',
    'any.required': '{#label} es obligatorio'
};

/**
 * SCHEMAS GENERALES
 */

// DIRECCION
const direccionSchema = Joi.object({
    calle: Joi.string().min(5).required().messages(mensajesES).label('Calle'),
    numero: Joi.number().integer().positive().required().messages(mensajesES).label('Número'),
    piso: Joi.number().integer().positive().required().messages(mensajesES).label('Piso'),
    cp: Joi.number().integer().positive().required().messages(mensajesES).label('Código postal'),
    localidad: Joi.string().min(3).required().messages(mensajesES).label('Localidad')
});

// DATO REGISTRAL
const datoRegistralSchema = Joi.object({
    num_protocolo: Joi.number().integer().positive().required().messages(mensajesES).label('Número de protocolo'),
    folio: Joi.number().integer().positive().required().messages(mensajesES).label('Folio'),
    hoja: Joi.number().integer().positive().required().messages(mensajesES).label('Hoja'),
    inscripcion: Joi.number().integer().positive().required().messages(mensajesES).label('Inscripción'),
    notario: Joi.string().min(2).required().messages(mensajesES).label('Notario'),
    fecha_inscripcion: Joi.date().iso().required().messages(mensajesES).label('Fecha de inscripción')
});

/**
 * SCHEMA PARA INMUEBLES
 */

// REFERENCIA
const datosInmuebleSchema = Joi.object({
    referencia: Joi.string().min(1).required().messages(mensajesES).label('Referencia'),
    datoRegistralInmueble: datoRegistralSchema.required().messages(mensajesES).label('Datos registrales del inmueble'),
    dirInmueble: direccionSchema.required().messages(mensajesES).label('Dirección del inmueble')
});

const proveedorSchema = Joi.object({
    clave_proveedor: Joi.string().required().messages(mensajesES).label('Clave del proveedor'),
    nombre: Joi.string().required().messages(mensajesES).label('Nombre del proveedor'),
    servicio: Joi.string().required().messages(mensajesES).label('Servicio'),
    tel_proveedor: Joi.string().pattern(/^[0-9]{9}$/).required().messages({
        ...mensajesES,
        'string.pattern.base': 'Teléfono del proveedor debe tener 9 dígitos'
    }).label('Teléfono del proveedor'),
    email_proveedor: Joi.string().email().required().messages(mensajesES).label('Email del proveedor')
});

const hipotecaSchema = Joi.object({
    prestamo: Joi.number().positive().required().messages(mensajesES).label('Préstamo'),
    banco: Joi.string().min(2).required().messages(mensajesES).label('Banco'),
    cuota: Joi.number().positive().required().messages(mensajesES).label('Cuota'),
    fecha_hipoteca: Joi.date().iso().required().messages(mensajesES).label('Fecha de la hipoteca')
});

const seguroSchema = Joi.object({
    aseguradora: Joi.string().required().messages(mensajesES).label('Aseguradora'),
    tipo_seguro: Joi.string().required().messages(mensajesES).label('Tipo de seguro'),
    poliza: Joi.string().required().messages(mensajesES).label('Póliza'),
    telefono_seguro: Joi.string().pattern(/^[0-9]{9}$/).required().messages({
        ...mensajesES,
        'string.pattern.base': 'Teléfono de la aseguradora debe tener 9 dígitos'
    }).label('Teléfono de la aseguradora'),
    email_seguro: Joi.string().email().required().messages(mensajesES).label('Email de la aseguradora')
});

const inmuebleSchema = Joi.object({
    datosInmueble: datosInmuebleSchema.required().messages(mensajesES).label('Datos del inmueble'),
    proveedores: Joi.array().items(proveedorSchema).optional().messages(mensajesES).label('Proveedores'),
    hipotecas: Joi.array().items(hipotecaSchema).optional().messages(mensajesES).label('Hipotecas'),
    seguros: Joi.array().items(seguroSchema).optional().messages(mensajesES).label('Seguros')
});

/**
 * SCHEMA PARA CLIENTE COMPLETO
 */

// EMPRESA
const empresaSchema = Joi.object({
    cif: Joi.string().length(9).required().messages(mensajesES).label('CIF de la empresa'),
    nombre: Joi.string().min(3).required().messages(mensajesES).label('Nombre de la empresa'),
    tel: Joi.string().pattern(/^[0-9]{9}$/).required().messages({
        ...mensajesES,
        'string.pattern.base': 'Teléfono de la empresa debe tener 9 dígitos'
    }).label('Teléfono de la empresa'),
    clave: Joi.string().length(3).required().messages(mensajesES).label('Clave de la empresa')
});

// PROPIETARIO
const propietarioSchema = Joi.object({
    nie: Joi.string().pattern(/^[XYZ][0-9]{7}[A-Z]$/).required().messages({
        ...mensajesES,
        'string.pattern.base': 'NIE del propietario debe tener el formato X1234567A'
    }).label('NIE del propietario'),
    nombre: Joi.string().min(3).required().messages(mensajesES).label('Nombre del propietario'),
    email: Joi.string().email().required().messages(mensajesES).label('Email del propietario'),
    telefono: Joi.string().pattern(/^[0-9]{9}$/).required().messages({
        ...mensajesES,
        'string.pattern.base': 'Teléfono del propietario debe tener 9 dígitos'
    }).label('Teléfono del propietario')
});

/**
 * ESQUEMA GENERAL CLIENTE
 */
export const createSchemaCliente = Joi.object({
    cliente: Joi.object({
        empresa: empresaSchema.required().messages(mensajesES).label('Empresa'),
        direccion: direccionSchema.required().messages(mensajesES).label('Dirección'),
        datoRegistral: datoRegistralSchema.required().messages(mensajesES).label('Datos registrales'),
        propietario: propietarioSchema.required().messages(mensajesES).label('Propietario')
    }).required().messages(mensajesES),
    inmuebles: Joi.array().items(inmuebleSchema).optional().messages(mensajesES).label('Inmuebles')
});