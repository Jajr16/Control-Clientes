// =====================================================
//   RANDOM UTILITIES
// =====================================================
export function randomId() {
    return Math.floor(Math.random() * 999999);
}

export function randomStr(len = 5) {
    return Math.random().toString(36).substring(2, 2 + len).toUpperCase();
}

export function randomDate() {
    const d = new Date(Date.now() - Math.floor(Math.random() * 3000) * 86400000);
    return d.toISOString().slice(0, 10);
}

// ======================
// GENERADORES NUEVOS
// (para cumplir JOI)
// ======================

// 🔸 NIE válido: X|Y|Z + 7 dígitos + letra
function generarNIEValido() {
    const inicial = ["X", "Y", "Z"][Math.floor(Math.random() * 3)];
    const numeros = String(Math.floor(Math.random() * 10_000_000)).padStart(7, "0");
    const letra = String.fromCharCode(65 + Math.floor(Math.random() * 26));
    return inicial + numeros + letra;
}

// 🔸 CIF válido: letra + 7 dígitos + letra (9 chars exactos)
function generarCIFValido() {
    const letraInicio = String.fromCharCode(65 + Math.floor(Math.random() * 26)); // A-Z
    const numeros = String(Math.floor(Math.random() * 10_000_000)).padStart(7, "0");
    const letraFinal = String.fromCharCode(65 + Math.floor(Math.random() * 26));
    return letraInicio + numeros + letraFinal;
}

// 🔸 Teléfono español de 9 dígitos
function generarTelefono() {
    return String(600000000 + Math.floor(Math.random() * 399999999))
}

// =====================================================
//   GENERAR DATOS RANDOM PARA FORMULARIOS DEL INMUEBLE
// =====================================================

// 🔹 SEGURO
export function generarSeguroRandom() {
    return {
        aseguradora: "ASEG-" + randomStr(),
        tipo_seguro: "Tipo-" + randomStr(),
        poliza: "POL-" + randomId(),
        telefono_seguro: generarTelefono(),   // ✓ 9 dígitos
        email_seguro: randomStr(5).toLowerCase() + "@mail.com",
    };
}

// 🔹 PROVEEDOR
export function generarProveedorRandom() {
    return {
        clave_proveedor: "P-" + randomStr(),
        nombre: "Proveedor " + randomStr(),
        tel_proveedor: generarTelefono(),     // ✓ 9 dígitos
        email_proveedor: randomStr(5).toLowerCase() + "@mail.com",
        servicio: "Servicio-" + randomStr(),
    };
}

// 🔹 HIPOTECA
export function generarHipotecaRandom() {
    return {
        banco: "BANCO-" + randomStr(),
        prestamo: Math.floor(Math.random() * 600000),
        cuota: Math.floor(Math.random() * 5000) + 500,
        fecha_hipoteca: randomDate(),
    };
}

// 🔹 INMUEBLE COMPLETO
export function generarInmuebleRandom() {
    return {
        clave_catastral: "CC-" + randomId(),
        valor_adquisicion: Math.floor(Math.random() * 900000) + 100000,
        fecha_adquisicion: randomDate(),

        dirInmueble: {
            calle: "Calle " + randomStr(),
            numero: Math.floor(Math.random() * 200),
            piso: Math.floor(Math.random() * 15),
            cp: String(10000 + Math.floor(Math.random() * 90000)),
            localidad: "Loc-" + randomStr(),
        },

        datoRegistralInmueble: {
            num_protocolo: randomId(),
            folio: randomId(),
            hoja: randomId(),
            inscripcion: randomId(),
            notario: "Notario " + randomStr(),
            fecha_inscripcion: randomDate(),
        }
    };
}

// 🔹 EMPRESA — (CORREGIDO)
export function generarEmpresaRandom() {
    return {
        cif: generarCIFValido(),           // ✓ CUMPLE Joi.length(9)
        nombre: "Empresa " + randomStr(5),
        tel: generarTelefono(),            // ✓ 9 dígitos string
        clave: randomStr(3)
    };
}

// 🔹 DIRECCIÓN
export function generarDireccionRandom() {
    return {
        calle: "Calle " + randomStr(5),
        numero: Math.floor(Math.random() * 200),
        piso: Math.floor(Math.random() * 15),
        cp: String(10000 + Math.floor(Math.random() * 90000)),
        localidad: "Loc-" + randomStr(5),
    };
}

// 🔹 DATO REGISTRAL
export function generarDatoRegistralRandom() {
    return {
        num_protocolo: randomId(),
        folio: randomId(),
        hoja: randomId(),
        inscripcion: randomId(),
        notario: "Notario " + randomStr(5),
        fecha_inscripcion: randomDate()
    };
}

// 🔹 PROPIETARIO — (CORREGIDO)
export function generarPropietarioRandom() {
    return {
        nie: generarNIEValido(),           // ✓ REGEX válido
        nombre: "Nombre " + randomStr(5),
        email: randomStr(5).toLowerCase() + "@mail.com",
        telefono: generarTelefono(),       // ✓ 9 dígitos
    };
}
