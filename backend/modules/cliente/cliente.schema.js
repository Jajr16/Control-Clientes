import Joi from 'joi';
import { propietarioSchema } from '../propietario/propietario.schema.js';
import { empresaSchema } from '../empresa/empresa.schema.js';
import { inmuebleSchema } from '../inmueble/inmueble.schema.js';
import { mensajesES } from '../shared/utils/joi.messages.js';

/**
 * ESQUEMA GENERAL CLIENTE
 */
export const createSchemaCliente = Joi.object({
    propietario: propietarioSchema.required().messages(mensajesES).label('Propietario'),
    empresa: empresaSchema.required().messages(mensajesES).label('Empresa'),
    inmuebles: Joi.array().items(inmuebleSchema).optional().messages(mensajesES).label('Inmuebles')
});