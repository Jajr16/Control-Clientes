import Joi from "joi";

export const adeudoInsertSchema = Joi.object({
    concepto: Joi.string().min(1).optional(),
    proveedor: Joi.string().min(1).optional(),
    estado: Joi.string().min(1).optional(),
    ff: Joi.string().min(1).optional(),
    num_factura: Joi.string().min(1).optional(),
    importe: Joi.number().optional(),
    iva: Joi.number().optional(),
    retencion: Joi.number().optional(),
    cs_iva: Joi.number().default(0),
    num_liquidacion: Joi.alternatives().try(
        Joi.number(),
        Joi.string().allow(''),
        Joi.allow(null)
    ).optional(),
    // Campos específicos para RMM
    anticipo_pagado: Joi.number().optional(),
    fecha_anticipo: Joi.date().iso().optional(),
    diferencia: Joi.number().optional(),
    fecha_devolucion_diferencia: Joi.date().iso().allow(null).optional(),
    num_entrada_original: Joi.string().min(1).optional(),
    num_factura_original: Joi.string().allow(null).min(1).optional(),
    empresa_cif: Joi.string().length(9).optional()
});

export const adeudoUpdateSchema = adeudoInsertSchema.keys({
    num_factura_original: Joi.string().min(1).required(),
});

// Esquema específico para entrada RMM pendiente
export const entradaRmmSchema = Joi.object({
    num_entrada: Joi.string().min(1).required(),
    empresa_cif: Joi.string().length(9).required(),
    anticipo_pagado: Joi.number().positive().default(200),
    fecha_anticipo: Joi.date().iso().required(),
    diferencia: Joi.number().allow(null).optional(),
    fecha_devolucion_diferencia: Joi.date().iso().allow(null).optional()
});

// Esquema para finalizar RMM
export const finalizarRmmSchema = Joi.object({
    empresa_cif: Joi.string().length(9).required(),
    num_entrada: Joi.string().min(1).required(),
    num_factura_final: Joi.string().min(1).required(),
    ff: Joi.date().iso().required(),
    concepto: Joi.string().default('Inscripción Registro Mercantil'),
    proveedor: Joi.string().default('Registro Mercantil de Madrid'),
    importe: Joi.number().positive().optional(),
    protocolo: Joi.object({
        num_protocolo: Joi.string().min(1).required()
    }).optional()
});