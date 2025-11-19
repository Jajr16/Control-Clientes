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

// =====================================================
//   GENERAR DATOS RANDOM PARA FORMULARIOS DEL INMUEBLE
// =====================================================

// 🔹 SEGURO
export function generarSeguroRandom() {
    return {
        aseguradora: "ASEG-" + randomStr(),
        tipo_seguro: "Tipo-" + randomStr(),
        poliza: "POL-" + randomId(),
        telefono_seguro: String(600000000 + Math.floor(Math.random() * 399999999)),
        email_seguro: randomStr(5).toLowerCase() + "@mail.com",
    };
}

// 🔹 PROVEEDOR
export function generarProveedorRandom() {
    return {
        clave_proveedor: "P-" + randomStr(),
        nombre: "Proveedor " + randomStr(),
        tel_proveedor: String(600000000 + Math.floor(Math.random() * 399999999)),
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

// 🔹 INMUEBLE COMPLETO (para el formulario principal)
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
