import { z } from "zod"

export const direccionSchema = z.object({
    calle: z.string().min(5, "Calle muy corta").optional(),
    numero: z.number().positive().optional(),
    piso: z.union([z.string(), z.number()]).optional(),
    codigo_postal: z.number().optional(),
    localidad: z.string().min(3).optional()
})

export const datoRegistralSchema = z.object({
    num_protocolo: z.union([z.string(), z.number()]),
    folio: z.number().positive(),
    hoja: z.union([z.string(), z.number()]),
    inscripcion: z.number().positive(),
    notario: z.string().min(2),
    fecha_inscripcion: z.string()
})

export const empresaSchema = z.object({
    cif: z.string().length(9, "El CIF debe tener 9 caracteres"),
    nombre: z.string().optional(),
    telefono: z.string().optional(),
    clave: z.string().length(3).optional(),
    direccion: direccionSchema.optional(),
    dato_registral: datoRegistralSchema.optional()
})

export const propietarioSchema = z.object({
    nie: z.string().length(9).optional(),
    nombre: z.string().optional(),
    email: z.string().email().optional(),
    telefono: z.string().optional()
})

export const inmuebleSchema = z.object({
    clave_catastral: z.string().min(1),
    valor_adquisicion: z.number().optional(),
    fecha_adquisicion: z.string().optional(),
    direccion: direccionSchema.optional(),
    dato_registral: datoRegistralSchema.optional()
})

export const clienteSchema = z.object({
    propietario: propietarioSchema,
    empresa: empresaSchema,
    inmuebles: z.array(inmuebleSchema).optional()
})