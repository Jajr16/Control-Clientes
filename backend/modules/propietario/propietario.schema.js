import Joi from "joi";
import { mensajesES } from '../shared/utils/joi.messages.js';

export const propietarioSchema = Joi.object({
    nie: Joi.string().length(9).required().messages(mensajesES).label('NIE del propietario').example('47563263D'),
    nombre: Joi.string().min(3).optional().messages(mensajesES).label('Nombre del propietario').example('Pablo Hernández'),
    email: Joi.string().email().optional().messages(mensajesES).label('Email del propietario').example('pabler@gmail.com'),
    telefono: Joi.string().optional().messages(mensajesES).label('Teléfono del propietario').example('568745123')
});
