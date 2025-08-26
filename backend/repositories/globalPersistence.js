import { pool } from '../config/db.js'

/**
 * Clase repositorio que funciona como capa de persistencia global para operaciones básicas de SQL
 * 
 * @param tabla Nombre de la tabla con la que se trabajará
 * @param clavesPrimarias Llave primaria de la tabla con la que se trabajará (puede ser llave primaria compuesta o simple)
 */
class Repositorio {
    constructor(tabla, clavesPrimarias) {
        this.tabla = tabla;
        this.clavesPrimarias = Array.isArray(clavesPrimarias) ? clavesPrimarias : [clavesPrimarias]
    }

    /**
     * Método para insertar nuevos registros a la tabla especificada en el constructor
     * 
     * @param {*} datos Datos a enviar que se insertarán en la tabla establecida en el constructor 
     * @returns Respuesta SQL retornada por PostgreSQL
     */
    async insertar(datos, client = null) {
        if (!datos || Object.keys(datos).length == 0) {
            throw new Error("No se pueden insertar datos vacíos.");
        }

        const queryClient = client || pool;

        const columnas = Object.keys(datos).join(", "); // Obtiene las nombres de las llaves del diccionario
        const valores = Object.values(datos) // Obtiene los valores del diccionario
        // Recorre cada valor para hacer la notación de inserción de valores dentro de una consulta
        const placeholders = valores.map((_, index) => `$${index + 1}`).join(', ')

        try {
            console.log(`Los datos recibidos son ${datos}`)

            const query = `
            INSERT INTO ${this.tabla} (${columnas}) VALUES(${placeholders})
            RETURNING *;
            `
            console.log(`El query resultante es ${query}`)

            // Realizar query
            const result = await queryClient.query(query, valores)
            return result.rows[0]
        } catch (error) {
            console.error(`Error al insertar en ${this.tabla}:`, error);
            // throw new Error(`No se pudo insertar en ${this.tabla}`);
            throw error;
        }
    }

    /**
     * Método para consultar todos los registros guardados en la tabla
     * 
     * @returns Respuesta SQL con todos los registros en la tabla
     */
    async ObtenerTodos() {
        try {
            const query = `SELECT * FROM ${this.tabla};`
            const result = await pool.query(query)

            return result.rows
        } catch (error) {
            console.error(`Error al obtener los registros de la tabla ${this.tabla}:`, error)
            throw new Error(`No se pudieron obtener los registros de ${this.tabla}`)
        }
    }

    /**
     * Método para buscar registros por id (sirve con llave primaria compuesta)
     * 
     * @param {*} claves Llave primaria de la tabla
     * @returns Respuesta SQL con los registros guardados en la tabla
     */
    async ObtenerPorId(claves) {
        if (!this._validarClaves(claves)) {
            throw new Error(`Las claves proporcionadas no coinciden con ${this.clavesPrimarias.join(', ')}`);
        }

        // Recorre cada valor para hacer la notación de las condiciones de los valores dentro de una consulta
        const condiciones = this.clavesPrimarias.map((clave, index) => `${clave} = $${index + 1}`).join(' AND ');
        const valores = this.clavesPrimarias.map(clave => claves[clave]); // Obtiene los valores del diccionario de claves (llaves primarias)

        try {
            const query = `SELECT * FROM ${this.tabla} WHERE ${condiciones}`
            const result = await pool.query(query, valores)
            return result.rows[0] || null
        } catch (error) {
            console.error(`Error al obtener el registro en ${this.tabla}: `, error)
            throw new Error(`Error al obtener el registro en ${this.tabla}`);
        }
    }

    /** 
     * Método para comprobar que un registro exista dentro de una tabla
     * 
     * @param {*} claves Llave primaria de la tabla
     * @returns Respuesta SQL con confirmación de si existe un registro o no
     * 
     */
    async ExistePorId(claves) {
        if (!this._validarClaves(claves)) {
            throw new Error(`Las claves proporcionadas no coinciden con ${this.clavesPrimarias.join(', ')}`);
        }

        // Recorre cada valor para hacer la notación de las condiciones de los valores dentro de una consulta
        const condiciones = this.clavesPrimarias.map((clave, index) => `${clave} = $${index + 1}`).join(' AND ');
        const valores = this.clavesPrimarias.map(clave => claves[clave]); // Obtiene los valores del diccionario de claves (llaves primarias)

        try {
            const query = `SELECT 1 FROM ${this.tabla} WHERE ${condiciones}`
            const result = await pool.query(query, valores);
            return result.rowCount > 0;
        } catch (error) {
            console.error(`Error al obtener el registro en ${this.tabla}: `, error)
            throw new Error(`Error al obtener el registro en ${this.tabla}`);
        }
    }

    /**
     * Método para actualizar un registro en la base de datos por medio de la llave primaria (sirve con llaves primarias compuestas)
     * 
     * @param {*} claves Llave primaria de la tabla
     * @param {*} nuevosDatos Nuevos datos a registrar
     * @returns Respuesta SQL de éxito o fracaso
     * 
     */
    async actualizarPorId(claves, nuevosDatos, client = null) {
        if (!this._validarClaves(claves)) {
            throw new Error(`Las claves proporcionadas no coinciden con ${this.clavesPrimarias.join(', ')}`);
        }

        if (!nuevosDatos || Object.keys(nuevosDatos).length === 0) {
            throw new Error('No se pueden actualizar con datos vacíos.');
        }

        const queryClient = client || pool;

        // Recorre cada valor para hacer la notación de inserción de valores dentro de un UPDATE
        const set = Object.keys(nuevosDatos).map((col, index) => `${col} = $${index + 1}`).join(', ')
        const valores = [...Object.values(nuevosDatos), ...this.clavesPrimarias.map(k => claves[k])]; // Los valores del diccionario 'nuevosDatos' los agrupa en un array
        // Notación para establecer las llaves primarias en las condiciones para el UPDATE
        const condiciones = this.clavesPrimarias.map((clave, index) => `${clave} = $${Object.keys(nuevosDatos).length + index + 1}`).join(' AND ');

        try {
            const query = `
                UPDATE ${this.tabla} SET ${set} WHERE ${condiciones} RETURNING *;
            `
            const result = await queryClient.query(query, valores)
            return result.rows[0] || null
        } catch (error) {
            console.error(`Error al actualizar en ${this.tabla}:`, error);
            throw new Error(`No se pudo actualizar en ${this.tabla}`);
        }
    }

    /**
     * Método para eliminar un registro por llave primaria (sirve con llave primaria compuesta)
     * 
     * @param {*} claves Llave primaria de la tabla
     * @returns Respuesta SQL indicando el éxito o fracaso de la operación
     */
    async eliminarPorId(claves, client = null) {
        if (!this._validarClaves(claves)) {
            throw new Error(`Las claves proporcionadas no coinciden con ${this.clavesPrimarias.join(', ')}`);
        }

        const queryClient = client || pool;

        // Notación para establecer las llaves primarias en las condiciones para el DELETE
        const condiciones = this.clavesPrimarias.map((clave, index) => `${clave} = $${index + 1}`).join(' AND ');
        const valores = this.clavesPrimarias.map(clave => claves[clave]); // Obtiene los valores del diccionario de claves (llaves primarias)

        try {
            const query = `DELETE FROM ${this.tabla} WHERE ${condiciones} RETURNING *;`;
            const result = await queryClient.query(query, valores);

            return result.rowCount > 0;
        } catch (error) {
            console.error(`Error al eliminar en ${this.tabla}:`, error);
            throw new Error(`No se pudo eliminar en ${this.tabla}`);
        }
    }

    /**
     * Método para hacer consultas SQL por diferentes filtros. Se pueden buscar n cantidad de columnas por n filtros posibles
     * 
     * @param {*} filtros Columnas junto con sus valores por los que queremos buscar
     * @param {*} columnasSeleccionadas Columnas que queremos obtener
     * @returns 
     */
    async BuscarPorFiltros(filtros = {}, columnasSeleccionadas = []) {
        const tieneFiltros = filtros && Object.keys(filtros).length > 0;
        const columnasQuery = columnasSeleccionadas.length > 0
            ? columnasSeleccionadas.join(', ')
            : '*';

        let query = `SELECT ${columnasQuery} FROM ${this.tabla}`;
        let valores = [];

        if (tieneFiltros) {
            const columnas = Object.keys(filtros);
            const condiciones = columnas
                .map((col, index) => `${col} = $${index + 1}`)
                .join(' AND ');
            valores = Object.values(filtros);
            query += ` WHERE ${condiciones}`;
        }

        try {
            const result = await pool.query(query, valores);
            return result.rows;
        } catch (error) {
            console.error(`Error al buscar en ${this.tabla} con filtros:`, error);
            throw new Error(`No se pudo realizar la búsqueda en ${this.tabla}`);
        }
    }

    /**
     * Método para hacer consultas SQL por diferentes filtros y JOINS. Se pueden buscar n cantidad de columnas por n filtros posibles
     * 
     * @param {*} joins Valores en donde vamos a unir tablas
     * @param {*} filtros Filtros que aplicaremos en caso de que ocupemos
     * @param {*} columnasSeleccionadas Columnas que queremos que se muestren
     * @returns 
     */
    async BuscarConJoins(joins = [], filtros = {}, operador = 'AND', columnasSeleccionadas = []) {
        if (!Array.isArray(joins)) {
            joins = [joins];
        }

        // Validar filtros
        if (!filtros || typeof filtros !== 'object') {
            filtros = {};
        }

        // Construir SELECT
        const columnas = columnasSeleccionadas.length > 0 ?
            columnasSeleccionadas.join(', ') :
            `${this.tabla}.*`;

        // Construir JOINs
        let joinClause = '';
        joins.forEach(join => {
            joinClause += ` ${join.type} JOIN ${join.table} ON ${join.on}`;
        });

        // Construir WHERE
        const condiciones = [];
        const valores = [];
        let contador = 1;

        for (const [campo, valor] of Object.entries(filtros)) {
            if (valor === null) {
                condiciones.push(`${campo} IS NULL`);
            } else if (typeof valor === 'object') {
                if (valor.raw) {
                    // Insertar expresión SQL tal cual
                    condiciones.push(`${campo} = ${valor.raw}`);
                } else if (valor.op) {
                    if (valor.value !== undefined) {
                        condiciones.push(`${campo} ${valor.op} $${contador}`);
                        valores.push(valor.value);
                        contador++;
                    } else {
                        condiciones.push(`${campo} ${valor.op}`);
                    }
                }
            } else {
                condiciones.push(`${campo} = $${contador}`);
                valores.push(valor);
                contador++;
            }
        }

        const whereClause = condiciones.length > 0 ?
            `WHERE ${condiciones.join(` ${operador} `)}` :
            '';

        // Construir query final
        const query = `
            SELECT ${columnas} 
            FROM ${this.tabla}
            ${joinClause}
            ${whereClause}
        `;

        try {
            const result = await pool.query(query, valores);
            return result.rows;
        } catch (error) {
            console.error(`Error al buscar en ${this.tabla} con JOINs:`, error);
            throw new Error(`No se pudo realizar la búsqueda en ${this.tabla}`);
        }
    }

    /**
     * Función en la que compara si las llaves primarias que se le pasan a las funciones coincide con las llaves primarias definidas en sus clases
     * 
     * @param {*} claves Llaves primarias de la tabla
     * @returns Boleano
     */
    _validarClaves(claves) {
        return Object.keys(claves).length === this.clavesPrimarias.length &&
            this.clavesPrimarias.every(k => claves.hasOwnProperty(k));
    }

    async registrarMovimiento({ accion, datos, }, client = null) {
        const queryClient = client || pool;

        try {
            const query = `
            INSERT INTO movimiento (accion, datos)
            VALUES ($1, $2)
            RETURNING *;
        `;
            const result = await queryClient.query(query, [
                accion,
                JSON.stringify(datos)
            ]);
            return result.rows[0];
        } catch (error) {
            console.error("Error al registrar movimiento:", error);
        }
    }
}

export default Repositorio;