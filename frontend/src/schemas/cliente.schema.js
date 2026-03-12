import { z } from "zod";

/**
 * HELPERS
 */
const emptyToUndefined = (val) => {
    if (val === "" || val === null || val === undefined) return undefined;
    if (typeof val === "number" && isNaN(val)) return undefined;
    return val;
};

const optionalNumber = () =>
    z.preprocess(
        emptyToUndefined,
        z.coerce.number().optional()
    );

const optionalEmail = () =>
    z.preprocess(
        emptyToUndefined,
        z.string().email("Email debe de ser válido").optional()
    );

const optionalPositiveNumber = (fieldName = "El campo") =>
    z.preprocess(
        (val) => {
            if (val === "" || val === null || val === undefined) return undefined;

            const num = Number(val);
            return isNaN(num) || num <= 0 ? undefined : num;
        },
        z
            .number({
                invalid_type_error: `${fieldName} debe ser un número válido`,
            })
            .positive(`${fieldName} debe ser un número positivo`)
            .optional()
    );

const optionalDate = () =>
    z.preprocess(
        emptyToUndefined,
        z.coerce.date().optional()
    );

/**
 * SCHEMAS GENERALES
 */
// DIRECCION
const direccionSchema = z.object({
    calle: z.preprocess(emptyToUndefined, z.string().min(5, "Calle debe tener al menos 5 caracteres").optional()),
    numero: optionalPositiveNumber(),
    piso: z.preprocess(emptyToUndefined, z.union([z.string(), z.coerce.number()]).optional()),
    codigo_postal: optionalPositiveNumber("Código postal"),
    localidad: z.preprocess(emptyToUndefined, z.string().min(3, "Localidad debe tener al menos 3 caracteres").optional()),
});

// DATO REGISTRAL
const datoRegistralSchema = z.object({
    num_protocolo: z.union([z.string(), z.coerce.number()]).optional(),
    folio: z.preprocess(
        emptyToUndefined,
        z.union([z.string(), z.coerce.number()]).optional(),
    ),
    hoja: z.union([z.string(), z.coerce.number()]).optional(),
    inscripcion: optionalNumber(),
    notario: z.string().optional(),
    fecha_inscripcion: optionalDate(),
});

/**
 * SCHEMA PARA INMUEBLES
 */
const proveedorSchema = z.object({
    clave: z.string({
        required_error: "Clave del proveedor es obligatorio",
    }),
    nombre: z.string({
        required_error: "Nombre del proveedor es obligatorio",
    }),
    tipo_servicio: z.string({
        required_error: "Servicio es obligatorio",
    }),
    telefono: z.string({
        required_error: "Teléfono del proveedor es obligatorio",
    }),
    email: z
        .string({
            required_error: "Email del proveedor es obligatorio",
        })
        .email("Email del proveedor debe ser válido"),
});

const hipotecaSchema = z.object({
    prestamo: z.coerce
        .number({
            required_error: "Préstamo es obligatorio",
            invalid_type_error: "Préstamo debe ser un número",
        })
        .positive("Préstamo debe ser positivo"),
    banco_prestamo: z
        .string()
        .min(2, "Banco debe tener al menos 2 caracteres"),
    fecha_hipoteca: z.coerce.date({
        invalid_type_error: "Fecha de la hipoteca debe ser válida",
    }),
    cuota_hipoteca: z.coerce
        .number({
            invalid_type_error: "Cuota debe ser un número",
        })
        .positive("Cuota debe ser positiva"),
});

const seguroSchema = z.object({
    empresa_seguro: z.string({
        required_error: "Aseguradora es obligatorio",
    }),
    tipo_seguro: z.string({
        required_error: "Tipo de seguro es obligatorio",
    }),
    telefono: z.string({
        required_error: "Teléfono de la aseguradora es obligatorio",
    }),
    email: z
        .string({
            required_error: "Email de la aseguradora es obligatorio",
        })
        .email("Email de la aseguradora debe ser válido"),
    poliza: z.string({
        required_error: "Póliza es obligatorio",
    }),
});

const inmuebleSchema = z.object({
    clave_catastral: z
        .string()
        .min(1, "Clave Catastral es obligatorio"),
    valor_adquisicion: optionalPositiveNumber(),
    fecha_adquisicion: optionalDate(),
    dato_registral: datoRegistralSchema.optional(),
    direccion: direccionSchema.optional(),
    proveedores: z.array(proveedorSchema).optional(),
    hipotecas: z.array(hipotecaSchema).optional(),
    seguros: z.array(seguroSchema).optional(),
});

/**
 * SCHEMA PARA CLIENTE COMPLETO
 */

// EMPRESA
const empresaSchema = z.object({
    cif: z
        .string()
        .length(9, "CIF de la empresa debe tener exactamente 9 caracteres"),
    nombre: z
        .string()
        .min(3, "Nombre de la empresa debe tener al menos 3 caracteres")
        .optional(),
    telefono: z.string().optional(),
    direccion: direccionSchema.optional(),
    dato_registral: datoRegistralSchema.optional(),
    clave: z
        .string()
        .length(3, "Clave de la empresa debe tener 3 caracteres")
        .optional(),
});

// PROPIETARIO
const propietarioSchema = z.object({
    nie: z
        .string()
        .length(9, "NIE del propietario debe tener 9 caracteres")
        .optional(),
    nombre: z.string().optional(),
    email: optionalEmail(),
    telefono: z.string().optional(),
});

/**
 * ESQUEMA GENERAL CLIENTE
 */

export const clienteSchema = z.object({
    propietario: propietarioSchema,
    empresa: empresaSchema,
    inmuebles: z.array(inmuebleSchema).optional(),
});