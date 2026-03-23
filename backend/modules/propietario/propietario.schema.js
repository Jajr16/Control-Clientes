import Joi from "joi";
import { mensajesES } from '../shared/utils/joi.messages.js';

export const propietarioSchema = Joi.object({
    nie: Joi.string().length(9).optional().messages(mensajesES).label('NIE del propietario').example('51223263D'),
    nombre: Joi.string().min(3).optional().messages(mensajesES).label('Nombre del propietario').example('pablo'),
    email: Joi.string().email().optional().messages(mensajesES).label('Email del propietario').example(''),
    telefono: Joi.string().optional().messages(mensajesES).label('Teléfono del propietario').example('')
});
