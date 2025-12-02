CREATE TABLE direccion (
    id SERIAL PRIMARY KEY,
    calle VARCHAR(300),
    numero INTEGER,
    piso INTEGER,
    codigo_postal INTEGER,
    localidad VARCHAR(300)
);
CREATE TABLE propietario (
    nie VARCHAR(9) PRIMARY KEY,
    nombre VARCHAR(255),
    apellido_p VARCHAR(255),
    apellido_m VARCHAR(255),
    email VARCHAR(255),
    telefono VARCHAR(13)
);

CREATE TABLE dato_registral (
    id_dr SERIAL PRIMARY KEY,
    num_protocolo INTEGER,
    folio INTEGER,
    hoja INTEGER,
    inscripcion INTEGER,
    notario VARCHAR(500),
    fecha_inscripcion DATE
);

CREATE TABLE empresa (
    cif VARCHAR(10) PRIMARY KEY,
    clave VARCHAR(3),
    nombre VARCHAR(300),
    propietario VARCHAR(9),
    direccion INTEGER REFERENCES direccion(id),
    dato_registral INTEGER REFERENCES dato_registral(id_dr)
    ON DELETE CASCADE ON UPDATE CASCADE,
    telefono VARCHAR(13),
    FOREIGN KEY (propietario) REFERENCES propietario(nie) 
    ON DELETE CASCADE ON UPDATE CASCADE
);

-- Datos del cliente (tanto empresa como el del dueño de la empresa)
SELECT empresa.clave, empresa.cif, empresa.nombre, p.nie, CONCAT(p.nombre, ' ', p.apellido_p, ' ', p.apellido_m) AS propietario,
p.telefono, p.email, d.calle, d.numero, d.piso, d.codigo_postal, d.localidad, dr.num_protocolo, dr.folio, dr.hoja,
dr.inscripcion, dr.notario, dr.fecha_inscripcion FROM empresa INNER JOIN propietario p
on empresa.propietario = p.nie INNER JOIN direccion d on empresa.direccion = d.id INNER JOIN dato_registral dr ON
dato_registral = dr.id_dr;

-- Datos de los inmuebles de la empresa
select d.calle, d.numero, d.piso, d.codigo_postal, d.localidad, empresa_inmueble.clave_catastral, empresa_inmueble.valor_adquisicion, empresa_inmueble.fecha_adquisicion,
dr.num_protocolo, dr.folio, dr.hoja, dr.inscripcion, dr.notario, dr.fecha_inscripcion from empresa_inmueble
INNER JOIN inmueble i ON empresa_inmueble.clave_catastral = i.clave_catastral 
INNER JOIN direccion d ON i.direccion = d.id
INNER JOIN dato_registral dr ON i.dato_registral = dr.id_dr
WHERE empresa_inmueble.cif = '5454';

-- Datos de los proveedores de un inmueble
select p.nombre, p.telefono, p.email, p.tipo_servicio from inmueble_proveedor 
INNER JOIN proveedor p ON inmueble_proveedor.clave = p.clave 
WHERE inmueble_proveedor.clave_catastral = 'ABC123XYZ';

-- Datos de los seguros de los inmuebles de la empresa
select s.empresa_seguro, s.tipo_seguro, s.telefono, s.email, s.poliza from inmueble_seguro
INNER JOIN seguro s ON inmueble_seguro.empresa_seguro = s.empresa_seguro 
WHERE inmueble_seguro.clave_catastral = 'ABC123XYZ';

-- CONSULTA PARA DATOS DE HIPOTECAS
SELECT h.prestamo, h.banco_prestamo, h.fecha_hipoteca, h.cuota_hipoteca 
FROM inmueble_hipoteca 
INNER JOIN hipoteca h ON inmueble_hipoteca.id_hipoteca = h.id
WHERE inmueble_hipoteca.clave_catastral = 'ABC123XYZ';