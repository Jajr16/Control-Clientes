import Joi from 'joi';

// Mensajes personalizados en español
const mensajesES = {
    'string.base': '{#label} debe ser un texto válido',
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
    calle: Joi.string().min(5).optional().messages(mensajesES).label('Calle'),
    numero: Joi.number().integer().positive().optional().messages(mensajesES).label('Número'),
    piso: Joi.alternatives().try(
        Joi.string(),
        Joi.number()
    ).optional().messages(mensajesES).label('Piso'),
    codigo_postal: Joi.number().integer().positive().optional().messages(mensajesES).label('Código postal'),
    localidad: Joi.string().min(3).optional().messages(mensajesES).label('Localidad')
});

// DATO REGISTRAL
const datoRegistralSchema = Joi.object({
    num_protocolo: Joi.alternatives().try(
        Joi.string(),
        Joi.number()
    ).optional().messages(mensajesES).label('Número de protocolo'),
    folio: Joi.alternatives().try(
        Joi.string(),
        Joi.number()
    ).optional().messages(mensajesES).label('Folio'),
    hoja: Joi.alternatives().try(
        Joi.string(),
        Joi.number()
    ).optional().messages(mensajesES).label('Hoja'),
    inscripcion: Joi.number().integer().positive().optional().messages(mensajesES).label('Inscripción'),
    notario: Joi.string().min(2).optional().messages(mensajesES).label('Notario'),
    fecha_inscripcion: Joi.date().iso().optional().messages(mensajesES).label('Fecha de inscripción')
});

/**
 * SCHEMA PARA INMUEBLES
 */
const proveedorSchema = Joi.object({
    clave: Joi.string().required().messages(mensajesES).label('Clave del proveedor'),
    nombre: Joi.string().required().messages(mensajesES).label('Nombre del proveedor'),
    tipo_servicio: Joi.string().required().messages(mensajesES).label('Servicio'),
    telefono: Joi.string().required().messages(mensajesES).label('Teléfono del proveedor'),
    email: Joi.string().email().required().messages(mensajesES).label('Email del proveedor')
});

const hipotecaSchema = Joi.object({
    prestamo: Joi.number().positive().required().messages(mensajesES).label('Préstamo'),
    banco_prestamo: Joi.string().min(2).required().messages(mensajesES).label('Banco'),
    fecha_hipoteca: Joi.date().iso().required().messages(mensajesES).label('Fecha de la hipoteca'),
    cuota_hipoteca: Joi.number().positive().required().messages(mensajesES).label('Cuota')
});

const seguroSchema = Joi.object({
    empresa_seguro: Joi.string().required().messages(mensajesES).label('Aseguradora'),
    tipo_seguro: Joi.string().required().messages(mensajesES).label('Tipo de seguro'),
    telefono: Joi.string().required().messages(mensajesES).label('Teléfono de la aseguradora'),
    email: Joi.string().email().required().messages(mensajesES).label('Email de la aseguradora'),
    poliza: Joi.string().required().messages(mensajesES).label('Póliza'),
});

const inmuebleSchema = Joi.object({
    clave_catastral: Joi.string().min(1).required().messages(mensajesES).label('Clave Catastral'),
    valor_adquisicion: Joi.number().positive().optional().messages(mensajesES).label('Valor de adquisición'),
    fecha_adquisicion: Joi.date().iso().optional().messages(mensajesES).label('Fecha de adquisición'),
    dato_registral: datoRegistralSchema.optional().messages(mensajesES).label('Datos registrales del inmueble'),
    direccion: direccionSchema.optional().messages(mensajesES).label('Dirección del inmueble'),
    proveedores: Joi.array().items(proveedorSchema).optional().messages(mensajesES).label('Proveedores'),
    hipotecas: Joi.array().items(hipotecaSchema).optional().messages(mensajesES).label('Hipotecas'),
    seguros: Joi.array().items(seguroSchema).optional().messages(mensajesES).label('Seguros')
});

/**
 * SCHEMA PARA CLIENTE COMPLETO
 */

// EMPRESA
const empresaSchema = Joi.object({
    cif: Joi.string().length(9).required().messages(mensajesES).label('CIF de la empresa').example('B88559315'),
    nombre: Joi.string().min(3).optional().messages(mensajesES).label('Nombre de la empresa').example('FERPAPULUC'),
    telefono: Joi.string().optional().messages(mensajesES).label('Teléfono de la empresa'),
    direccion: direccionSchema.optional().messages(mensajesES).label('Dirección').example({
        calle: 'Juan Bravo',
        numero: 20,
        piso: "1o Izq",
        codigo_postal: 28006,
        localidad: 'Madrid'
    }),
    dato_registral: datoRegistralSchema.optional().messages(mensajesES).label('Datos registrales'),
    clave: Joi.string().length(3).optional().messages(mensajesES).label('Clave de la empresa').example('FER')
});

// PROPIETARIO
const propietarioSchema = Joi.object({
    nie: Joi.string().length(9).optional().messages(mensajesES).label('NIE del propietario').example('51223263D'),
    nombre: Joi.string().min(3).optional().messages(mensajesES).label('Nombre del propietario').example('pablo'),
    email: Joi.string().email().optional().messages(mensajesES).label('Email del propietario').example(''),
    telefono: Joi.string().optional().messages(mensajesES).label('Teléfono del propietario').example('')
});

/**
 * ESQUEMA GENERAL CLIENTE
 */
export const createSchemaCliente = Joi.object({
    propietario: propietarioSchema.required().messages(mensajesES).label('Propietario'),
    empresa: empresaSchema.required().messages(mensajesES).label('Empresa'),
    inmuebles: Joi.array().items(inmuebleSchema).optional().messages(mensajesES).label('Inmuebles')
});