import Joi from "joi";

export const adeudoInsertSchema = Joi.object({
    concepto: Joi.string().min(1).required().optional(),
    proveedor: Joi.string().min(1).required().optional(),
    ff: Joi.string().min(1).required().optional(),
    num_factura: Joi.string().min(1).required().optional(),
    importe: Joi.number().required().optional(),
    iva: Joi.number().optional(),
    retencion: Joi.number().optional(),
    num_liquidacion: Joi.number().allow(null, "").optional(),
    anticipo_pagado: Joi.number().optional(),
    fecha_anticipo: Joi.date().optional(),
    diferencia: Joi.number().optional(),
    fecha_devolucion_diferencia: Joi.date().optional(),
    num_entrada_original: Joi.string().min(1).optional()
});

export const adeudoUpdateSchema = adeudoInsertSchema.keys({
    num_factura_original: Joi.string().min(1).required(),
});