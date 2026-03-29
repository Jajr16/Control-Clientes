import Joi from "joi";
import { direccionSchema, datoRegistralSchema } from "../shared/schemas/common.schema.js";
import { mensajesES } from '../shared/utils/joi.messages.js';

/**
 * SCHEMA PARA INMUEBLES
 */
const nombre = Joi.string().required().messages(mensajesES).label('Nombre del proveedor')
const tipo_servicio = Joi.string().required().messages(mensajesES).label('Servicio')

const poliza = Joi.string().optional().messages(mensajesES).label('Póliza')

export const proveedorSchema = Joi.object({
    data: Joi.object({
        cup: Joi.string().optional().messages(mensajesES).label('Clave del proveedor'),
        nombre: nombre,
        tipo_servicio: tipo_servicio,
        telefono: Joi.string().optional().messages(mensajesES).label('Teléfono del proveedor'),
        email: Joi.string().email().optional().messages(mensajesES).label('Email del proveedor')
    }).required(),
    original: Joi.object({
        nombre: nombre,
        tipo_servicio: tipo_servicio,
    }).optional()
});

export const hipotecaSchema = Joi.object({
    prestamo: Joi.number().positive().optional().messages(mensajesES).label('Préstamo'),
    banco_prestamo: Joi.string().min(2).optional().messages(mensajesES).label('Banco'),
    fecha_hipoteca: Joi.date().iso().optional().messages(mensajesES).label('Fecha de la hipoteca'),
    cuota_hipoteca: Joi.number().positive().optional().messages(mensajesES).label('Cuota'),
    clave_catastral: Joi.string().min(1).optional().messages(mensajesES).label('Clave Catastral').example('CLAVEPRUEBA'),
});

export const seguroSchema = Joi.object({
    data: Joi.object({
        empresa_seguro: Joi.string().optional().messages(mensajesES).label('Aseguradora'),
        tipo_seguro: Joi.string().optional().messages(mensajesES).label('Tipo de seguro'),
        telefono: Joi.string().optional().messages(mensajesES).label('Teléfono de la aseguradora'),
        email: Joi.string().email().optional().messages(mensajesES).label('Email de la aseguradora'),
        poliza: poliza
    }).required(),
    original: Joi.object({
        poliza: poliza
    }).optional()
});

export const inmuebleSchema = Joi.object({
    clave_catastral: Joi.string().min(1).required().messages(mensajesES).label('Clave Catastral').example('CLAVEPRUEBIÑA'),
    empresa_cif: Joi.string().length(9).optional().messages(mensajesES).label('CIF de la empresa').example('B88559314'),
    valor_adquisicion: Joi.number().positive().optional().messages(mensajesES).label('Valor de adquisición').example(450000),
    fecha_adquisicion: Joi.date().iso().optional().messages(mensajesES).label('Fecha de adquisición').example('2026-03-17'),
    dato_registral: datoRegistralSchema.optional().messages(mensajesES).label('Datos registrales del inmueble').example({
        "num_protocolo": "7",
        "folio": "47856",
        "hoja": "874",
        "inscripcion": 1,
        "notario": "Pedro Hernández",
        "fecha_inscripcion": "2026-03-26"
    }),
    direccion: direccionSchema.optional().messages(mensajesES).label('Dirección del inmueble').example({
        calle: 'Juan Bravo',
        numero: 50,
        piso: "1o Izq",
        codigo_postal: 28006,
        localidad: 'Madrid'
    }),
    proveedores: Joi.array().items(proveedorSchema).optional().messages(mensajesES).label('Proveedores').example([{
        data: {
            "cup": "784",
            "nombre": "CFE",
            "tipo_servicio": "Luz",
            "telefono": "874215682",
            "email": "CFE@CFE.com"
        }
    }]),
    hipoteca: hipotecaSchema.optional().messages(mensajesES).label('Hipotecaa').example({
        "prestamo": 1784,
        "banco_prestamo": "BBVA",
        "fecha_hipoteca": "2026-03-26T09:50:17.575Z",
        "cuota_hipoteca": 18
    }),
    seguros: Joi.array().items(seguroSchema).optional().messages(mensajesES).label('Seguros').example([{
        data: {
            "empresa_seguro": "SECULUZ",
            "tipo_seguro": "LUZ",
            "telefono": "745812457",
            "email": "SECULUZ@SECULUZ.com",
            "poliza": "87SASV"
        }
    }])
});

export const inmuebleResponseSchema = Joi.object({
    cif: Joi.string().example('A1739593M'),
    clave_catastral: Joi.string().example('CLAVE123'),
    valor_adquisicion: Joi.number().example(150000),
    fecha_adquisicion: Joi.date().example('2024-01-01'),
    direccion: Joi.string().example('Calle Falsa, 123, 28001 Madrid'),
    dato_registral: datoRegistralSchema.optional().messages(mensajesES).label('Datos registrales')
});