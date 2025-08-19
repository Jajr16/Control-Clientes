import Joi from "joi";

export const adeudoSchema = Joi.object({
    num_factura_original: Joi.string().required(), // Siempre necesitamos esto para identificar la fila
    concepto: Joi.string().min(1).optional(),
    proveedor: Joi.string().min(1).optional(),
    ff: Joi.string().min(1).optional(),
    num_factura: Joi.string().min(1).optional(),
    importe: Joi.number().optional(),
    iva: Joi.number().optional(),
    retencion: Joi.number().optional(),
    num_liquidacion: Joi.number().allow(null, "").optional(), // puede ir vacío
});