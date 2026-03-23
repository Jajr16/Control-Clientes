import Joi from "joi";
import { direccionSchema, datoRegistralSchema } from "../shared/schemas/common.schema.js";
import { mensajesES } from '../shared/utils/joi.messages.js';

/**
 * SCHEMA PARA INMUEBLES
 */
export const proveedorSchema = Joi.object({
    cup: Joi.string().optional().messages(mensajesES).label('Clave del proveedor'),
    nombre: Joi.string().required().messages(mensajesES).label('Nombre del proveedor'),
    tipo_servicio: Joi.string().required().messages(mensajesES).label('Servicio'),
    telefono: Joi.string().optional().messages(mensajesES).label('Teléfono del proveedor'),
    email: Joi.string().email().optional().messages(mensajesES).label('Email del proveedor')
});

export const hipotecaSchema = Joi.object({
    prestamo: Joi.number().positive().optional().messages(mensajesES).label('Préstamo'),
    banco_prestamo: Joi.string().min(2).optional().messages(mensajesES).label('Banco'),
    fecha_hipoteca: Joi.date().iso().optional().messages(mensajesES).label('Fecha de la hipoteca'),
    cuota_hipoteca: Joi.number().positive().optional().messages(mensajesES).label('Cuota'),
    clave_catastral: Joi.string().min(1).optional().messages(mensajesES).label('Clave Catastral').example('CLAVEPRUEBA'),
});

export const seguroSchema = Joi.object({
    empresa_seguro: Joi.string().optional().messages(mensajesES).label('Aseguradora'),
    tipo_seguro: Joi.string().optional().messages(mensajesES).label('Tipo de seguro'),
    telefono: Joi.string().optional().messages(mensajesES).label('Teléfono de la aseguradora'),
    email: Joi.string().email().optional().messages(mensajesES).label('Email de la aseguradora'),
    poliza: Joi.string().required().messages(mensajesES).label('Póliza'),
});

export const inmuebleSchema = Joi.object({
    clave_catastral: Joi.string().min(1).required().messages(mensajesES).label('Clave Catastral').example('CLAVEPRUEBA'),
    empresa_cif: Joi.string().length(9).optional().messages(mensajesES).label('CIF de la empresa').example('B88559315'),
    valor_adquisicion: Joi.number().positive().optional().messages(mensajesES).label('Valor de adquisición').example(450000),
    fecha_adquisicion: Joi.date().iso().optional().messages(mensajesES).label('Fecha de adquisición').example('2026-03-17'),
    dato_registral: datoRegistralSchema.optional().messages(mensajesES).label('Datos registrales del inmueble'),
    direccion: direccionSchema.optional().messages(mensajesES).label('Dirección del inmueble').example({
        calle: 'Juan Bravo',
        numero: 20,
        piso: "1o Izq",
        codigo_postal: 28006,
        localidad: 'Madrid'
    }),
    proveedores: Joi.array().items(proveedorSchema).optional().messages(mensajesES).label('Proveedores'),
    hipotecas: Joi.array().items(hipotecaSchema).optional().messages(mensajesES).label('Hipotecas'),
    seguros: Joi.array().items(seguroSchema).optional().messages(mensajesES).label('Seguros')
});

export const inmuebleResponseSchema = Joi.object({
    cif: Joi.string().example('A1739593M'),
    clave_catastral: Joi.string().example('CLAVE123'),
    valor_adquisicion: Joi.number().example(150000),
    fecha_adquisicion: Joi.date().example('2024-01-01'),
    direccion: Joi.string().example('Calle Falsa, 123, 28001 Madrid'),
    dato_registral: datoRegistralSchema.optional().messages(mensajesES).label('Datos registrales')
});