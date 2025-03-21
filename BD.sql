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
    telefono VARCHAR(9)
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
    telefono VARCHAR(9),
    FOREIGN KEY (propietario) REFERENCES propietario(nie) 
    ON DELETE CASCADE ON UPDATE CASCADE
);
