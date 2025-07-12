import { pool } from '../config/db.js'

// Crear tabla si no existe
export const createTableEmpresa = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS empresa (
                cif VARCHAR(9) PRIMARY KEY,
                clave VARCHAR(3),
                nombre VARCHAR(300),
                propietario VARCHAR(9),
                direccion INTEGER REFERENCES direccion(id),
                dato_registral INTEGER REFERENCES dato_registral(id_dr),
                telefono VARCHAR(10),
                FOREIGN KEY (propietario) REFERENCES propietario(nie)
                ON DELETE CASCADE ON UPDATE CASCADE
            );
        `);
        console.log("Tabla 'empresa' creada");
    } catch (error) {
        console.error("Error creando la tabla:", error.message);
    }
};

// Función para insertar una empresa
export const agregarEmpresa = async ({ empresa, direccion, propietario, datoRegistral }) => {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        // Insertar dirección
        const resDireccion = await client.query(
            `INSERT INTO direccion (calle, numero, piso, codigo_postal, localidad)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id`,
            [direccion.calle, direccion.numero, direccion.piso, direccion.codigo_postal, direccion.localidad]
        );
        const direccionId = resDireccion.rows[0].id;

        // Validar unicidad del NIE
        const resProp = await client.query("SELECT nie FROM propietario WHERE nie = $1", [propietario.nie]);
        if (resProp.rows.length > 0) {
            throw new Error(`Ya existe un propietario con el NIE: ${propietario.nie}`);
        }

        // Insertar propietario
        const resPropietario = await client.query(
            `INSERT INTO propietario (nie, nombre, apellido_p, apellido_m, email, telefono)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING nie`,
            [propietario.nie, propietario.nombre, propietario.apellido_p, propietario.apellido_m, propietario.email, propietario.telefono]
        );
        const nie = resPropietario.rows[0].nie;

        // Insertar dato registral
        const resDato = await client.query(
            `INSERT INTO dato_registral (num_protocolo, folio, hoja, inscripcion, notario, fecha_inscripcion)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING id_dr`,
            [datoRegistral.num_protocolo, datoRegistral.folio, datoRegistral.hoja, datoRegistral.inscripcion, datoRegistral.notario, datoRegistral.fecha_inscripcion]
        );
        const datoRegistralId = resDato.rows[0].id_dr;

        // Insertar empresa
        const resEmpresa = await client.query(
            `INSERT INTO empresa (cif, clave, nombre, propietario, direccion, dato_registral, telefono)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING *`,
            [empresa.cif, empresa.clave, empresa.nombre, nie, direccionId, datoRegistralId, empresa.telefono]
        );

        await client.query("COMMIT");
        return resEmpresa.rows[0];

    } catch (error) {
        await client.query("ROLLBACK");
        throw new Error("Transacción fallida: " + error.message);
        console.error("Error al agregar empresa:", error.message);
    } finally {
        client.release();
    }
};


// Función para obtener empresas
export const obtenerEmpresas = async () => {
    try {
        const result = await pool.query("SELECT * FROM empresa");
        return result.rows;
    } catch (error) {
        throw new Error("Error al obtener clientes: " + error.message);
    }
};

export const obtenerEmpresasAdeudos = async () => {
    try{    
        const result = await db.query("SELECT cif, nombre FROM empresa"); 
        return result.rows; 
    } catch (error) {
        throw new Error("Error al obtener empresas con adeudos: " + error.message);
        }
};
