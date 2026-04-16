export class InmuebleDTO {

    static detallesInmuebles(items) {
        return items.map(item => ({
            cif: item.empresa_cif,
            clave_catastral: item.clave_catastral,
            valor_adquisicion: item.valor_adquisicion,
            fecha_adquisicion: item.fecha_adquisicion,
            direccion: {
                calle: item.calle,
                numero: item.numero,
                piso: item.piso,
                codigo_postal: item.codigo_postal,
                localidad: item.localidad
            },
            dato_registral: {
                folio: item.folio,
                hoja: item.hoja,
                inscripcion: item.inscripcion,
                num_protocolo: item.num_protocolo,
                notario: item.notario,
                fecha_inscripcion: item.fecha_inscripcion
            }
        }))
    } 
}