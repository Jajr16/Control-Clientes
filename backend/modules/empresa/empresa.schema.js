import Joi from "joi";
import { direccionSchema, datoRegistralSchema } from "../shared/schemas/common.schema.js";
import { mensajesES } from '../shared/utils/joi.messages.js';

export const empresaSchema = Joi.object({
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