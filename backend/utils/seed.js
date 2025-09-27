import { pool } from '../config/db.js';

const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

const nombres = ['Juan', 'Maria', 'Jose', 'Ana', 'Carlos', 'Laura', 'David', 'Sofia'];
const apellidos = ['García', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Perez', 'Sanchez'];
const tiposCalle = ['Calle', 'Avenida', 'Paseo', 'Plaza', 'Ronda'];
const nombresCalle = ['Mayor', 'del Sol', 'de la Luna', 'Real', 'Constitución', 'Gran Vía'];
const localidades = ['Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Zaragoza', 'Málaga'];
const sufijosEmpresa = ['S.L.', 'S.A.', 'Hermanos', 'Asociados'];
const serviciosProveedor = ['Electricidad', 'Fontanería', 'Gas', 'Internet', 'Limpieza', 'Seguridad'];
const tiposSeguro = ['Hogar', 'Impago de Alquiler', 'Comercio', 'Responsabilidad Civil'];
const bancos = ['CaixaBank', 'Santander', 'BBVA', 'Sabadell', 'Bankinter'];

/* GENERADORES DE DATOS REALISTAS */

const generarTelefono = () => `6${randomInt(10000000, 99999999)}`;
const generarNIE = () => `X${randomInt(1000000, 9999999)}L`;
const generarCIF = () => `A${randomInt(10000000, 99999999)}`;
const generarCodigoPostal = () => randomInt(10000, 52999);
const generarNombreCompleto = () => `${randomItem(nombres)} ${randomItem(apellidos)} ${randomItem(apellidos)}`;
const generarNombreEmpresa = () => `${randomItem(apellidos)} y ${randomItem(apellidos)} ${randomItem(sufijosEmpresa)}`;
const generarEmail = (nombre) => `${nombre.toLowerCase().replace(/\s/g, '.')}@email-ficticio.com`;
const generarClaveCatastral = () => `0123456${randomInt(1000000000000, 9999999999999)}AB`;
const generarFecha = () => {
    const anio = randomInt(2010, 2023);
    const mes = randomInt(1, 12).toString().padStart(2, '0');
    const dia = randomInt(1, 28).toString().padStart(2, '0');
    return `${anio}-${mes}-${dia}`;
};

/* FUNCIÓN PRINCIPAL DE POBLADO */

export const poblarDatos = async () => {
    const client = await pool.connect();
    console.log('Iniciando el poblado de la base de datos...');

    try {
        await client.query('BEGIN');

        // 1. POBLAR TABLAS INDEPENDIENTES
        console.log('Creando propietarios...');
        const propietariosNIEs = [];
        for (let i = 0; i < 5; i++) {
            const nombre = generarNombreCompleto();
            const nie = generarNIE();
            await client.query(
                `INSERT INTO propietario (nie, nombre, email, telefono) VALUES ($1, $2, $3, $4) ON CONFLICT (nie) DO NOTHING`,
                [nie, nombre, generarEmail(nombre), generarTelefono()]
            );
            propietariosNIEs.push(nie);
        }

        console.log('Creando proveedores...');
        const proveedoresClaves = [];
        for (let i = 0; i < 10; i++) {
            const clave = `PROV-${randomInt(100, 999)}`;
            const nombre = `Proveedor ${randomItem(serviciosProveedor)} ${i + 1}`;
            await client.query(
                `INSERT INTO proveedor (clave, nombre, telefono, email, tipo_servicio) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (clave) DO NOTHING`,
                [clave, nombre, generarTelefono(), generarEmail(nombre), randomItem(serviciosProveedor)]
            );
            proveedoresClaves.push(clave);
        }
        
        console.log('Creando seguros...');
        const segurosEmpresas = [];
        for (let i = 0; i < 5; i++) {
            const empresa = `Aseguradora Ficticia ${i + 1}`;
            segurosEmpresas.push(empresa);
            await client.query(
                `INSERT INTO seguro (empresa_seguro, tipo_seguro, telefono, email, poliza) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (empresa_seguro) DO NOTHING`,
                [empresa, randomItem(tiposSeguro), generarTelefono(), generarEmail(empresa), `POL-${randomInt(1000, 9999)}`]
            );
        }

        console.log('Creando hipotecas...');
        const hipotecaIds = [];
        for (let i = 0; i < 15; i++) {
            const res = await client.query(
                `INSERT INTO hipoteca (prestamo, banco_prestamo, fecha_hipoteca, cuota_hipoteca) VALUES ($1, $2, $3, $4) RETURNING id`,
                [randomInt(80000, 500000), randomItem(bancos), generarFecha(), randomInt(500, 2500)]
            );
            hipotecaIds.push(res.rows[0].id);
        }

        // 2. POBLAR TABLAS DEPENDIENTES (EMPRESAS, INMUEBLES)
        console.log('Creando empresas (clientes)...');
        const empresaCIFs = [];
        for (let i = 0; i < 5; i++) {
            // Dirección y Dato Registral únicos por empresa
            const dirRes = await client.query(`INSERT INTO direccion (calle, numero, piso, codigo_postal, localidad) VALUES ($1, $2, $3, $4, $5) RETURNING id`, [`${randomItem(tiposCalle)} Empresarial ${i}`, randomInt(1, 200), randomInt(1, 10), generarCodigoPostal(), randomItem(localidades)]);
            const drRes = await client.query(`INSERT INTO dato_registral (num_protocolo, folio, hoja, inscripcion, notario, fecha_inscripcion) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT ON CONSTRAINT unique_dato_registral DO NOTHING RETURNING id_dr`, [randomInt(100, 9999), randomInt(1, 50), randomInt(1, 100), i + 1, `Notario ${generarNombreCompleto()}`, generarFecha()]);
            
            const direccionId = dirRes.rows[0].id;
            // Si hay conflicto por la constraint UNIQUE, el id no se retorna, así que lo buscamos.
            const datoRegistralId = drRes.rows.length > 0 ? drRes.rows[0].id_dr : (await client.query('SELECT id_dr FROM dato_registral WHERE inscripcion = $1', [i+1])).rows[0].id_dr;
            
            const cif = generarCIF();
            empresaCIFs.push(cif);
            await client.query(
                `INSERT INTO empresa (cif, clave, nombre, propietario, direccion, dato_registral, telefono) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (cif) DO NOTHING`,
                [cif, `E${i+1}`, generarNombreEmpresa(), randomItem(propietariosNIEs), direccionId, datoRegistralId, generarTelefono()]
            );
        }
        
        console.log('Creando inmuebles...');
        const inmuebleClaves = [];
        for (let i = 0; i < 20; i++) {
            // Dirección y Dato Registral únicos por inmueble
            const dirRes = await client.query(`INSERT INTO direccion (calle, numero, piso, codigo_postal, localidad) VALUES ($1, $2, $3, $4, $5) RETURNING id`, [`${randomItem(tiposCalle)} Residencial ${i}`, randomInt(1, 200), randomInt(1, 10), generarCodigoPostal(), randomItem(localidades)]);
            const drRes = await client.query(`INSERT INTO dato_registral (num_protocolo, folio, hoja, inscripcion, notario, fecha_inscripcion) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT ON CONSTRAINT unique_dato_registral DO NOTHING RETURNING id_dr`, [randomInt(100, 9999), randomInt(1, 50), randomInt(1, 100), i + 100, `Notario ${generarNombreCompleto()}`, generarFecha()]);
            
            const direccionId = dirRes.rows[0].id;
            const datoRegistralId = drRes.rows.length > 0 ? drRes.rows[0].id_dr : (await client.query('SELECT id_dr FROM dato_registral WHERE inscripcion = $1', [i+100])).rows[0].id_dr;

            const claveCatastral = generarClaveCatastral();
            inmuebleClaves.push(claveCatastral);
            await client.query(
                `INSERT INTO inmueble (clave_catastral, direccion, dato_registral) VALUES ($1, $2, $3) ON CONFLICT (clave_catastral) DO NOTHING`,
                [claveCatastral, direccionId, datoRegistralId]
            );
        }

        // 3. POBLAR TABLAS DE UNIÓN (RELACIONES)
        console.log('Asignando inmuebles a empresas...');
        for(const clave of inmuebleClaves) {
            await client.query(
                `INSERT INTO empresa_inmueble (cif, clave_catastral, valor_adquisicion, fecha_adquisicion) VALUES ($1, $2, $3, $4)`,
                [randomItem(empresaCIFs), clave, randomInt(100000, 800000), generarFecha()]
            );
        }

        console.log('Asignando proveedores a inmuebles...');
        for(const clave of inmuebleClaves) {
            const numProveedores = randomInt(0, 3); // 0 a 3 proveedores por inmueble
            const proveedoresSeleccionados = [...proveedoresClaves].sort(() => 0.5 - Math.random()).slice(0, numProveedores);
            for(const provClave of proveedoresSeleccionados) {
                 await client.query(`INSERT INTO inmueble_proveedor (clave_catastral, clave) VALUES ($1, $2) ON CONFLICT DO NOTHING`, [clave, provClave]);
            }
        }

        console.log('Asignando seguros a inmuebles...');
         for(const clave of inmuebleClaves) {
            const numSeguros = randomInt(0, 2); // 0 a 2 seguros por inmueble
            const segurosSeleccionados = [...segurosEmpresas].sort(() => 0.5 - Math.random()).slice(0, numSeguros);
             for(const segEmpresa of segurosSeleccionados) {
                 await client.query(`INSERT INTO inmueble_seguro (clave_catastral, empresa_seguro) VALUES ($1, $2) ON CONFLICT DO NOTHING`, [clave, segEmpresa]);
            }
        }
        
        console.log('Asignando hipotecas a inmuebles...');
        const inmueblesConHipoteca = [...inmuebleClaves].sort(() => 0.5 - Math.random()).slice(0, 10); // 10 de 20 inmuebles tendrán hipoteca
        for(let i = 0; i < inmueblesConHipoteca.length; i++) {
            await client.query(
                `INSERT INTO inmueble_hipoteca (clave_catastral, id_hipoteca) VALUES ($1, $2)`,
                [inmueblesConHipoteca[i], hipotecaIds[i]]
            );
        }

        await client.query('COMMIT'); // Confirmar transacción
        console.log('¡Base de datos poblada exitosamente!');

    } catch (error) {
        await client.query('ROLLBACK'); // Revertir en caso de error
        console.error('Error al poblar la base de datos. Se revirtieron los cambios.', error);
    } finally {
        client.release(); // Liberar cliente
    }
};