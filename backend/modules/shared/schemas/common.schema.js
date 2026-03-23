import Joi from 'joi';
import { mensajesES } from '../utils/joi.messages.js';

// DIRECCION
export const direccionSchema = Joi.object({
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
export const datoRegistralSchema = Joi.object({
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
