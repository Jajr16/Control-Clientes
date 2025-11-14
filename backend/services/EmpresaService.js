import { BaseService } from "./BaseService.js";
import Repositorio from "../repositories/globalPersistence.js";

export default class EmpresaService extends BaseService {
    constructor() {
        super({
            empresa: new Repositorio("empresa", "cif"),
        })
    }

    async crearEmpresa(data, client = null) {
        const existente = await this.repositories.empresa.ExistePorId({ cif: data.cif }, client);
        if (existente) throw new Error(`La empresa con CIF ${data.cif} ya existe`);

        return await this.repositories.empresa.insertar(data, client);
    }

    async obtenerEmpresa() {
        try {
            const joins = [
                { type: 'INNER', table: 'propietario p', on: 'empresa.propietario = p.nie' },
                { type: 'INNER', table: 'direccion d', on: 'empresa.direccion = d.id' },
                { type: 'INNER', table: 'dato_registral dr', on: 'empresa.dato_registral = dr.id_dr' }
            ];

            const columnas = [
                'empresa.clave', 'empresa.cif', 'empresa.nombre', 'p.nie',
                'p.nombre AS propietario', 'p.telefono', 'p.email',
                'd.calle', 'd.numero', 'd.piso', 'd.codigo_postal', 'd.localidad',
                'dr.num_protocolo', 'dr.folio', 'dr.hoja', 'dr.inscripcion',
                'dr.notario', 'dr.fecha_inscripcion'
            ];

            return await this.repositories.empresa.BuscarConJoins(joins, {}, 'AND', columnas);
        } catch (error) {
            console.error("Error al obtener información de clientes:", error);
            throw new Error("No se pudo obtener la información de los clientes");
        }
    }  
    
    async actualizarEmpresa(cif, nuevosDatos, client = null) {
    const ejecutar = async (conn) => {
        const empresaExiste = await this.repositories.empresa.ExistePorId({ cif: cif }, conn);
        if (!empresaExiste) {
            throw new Error('Empresa no encontrada');
        }
        return await this.repositories.empresa.actualizarPorId(
            { cif: cif },
            nuevosDatos,
            conn
        );
    };

    if (client) {
        return await ejecutar(client);
    } else {
        return await this.withTransaction(ejecutar);
    }
}

// En EmpresaService.js, agrega este método:
async obtenerEmpresaPorCif(cif, client = null) {
    const ejecutar = async (conn) => {
        // Usar BuscarPorFiltros en lugar de BuscarConJoins para evitar el error
        return await this.repositories.empresa.BuscarPorFiltros({ cif: cif }, 1, conn);
    };

    if (client) {
        return await ejecutar(client);
    } else {
        return await this.withTransaction(ejecutar);
    }
}

async obtenerEmpresaCompletaPorCif(cif, client = null) {
    const ejecutar = async (conn) => {
        // Método alternativo sin usar BuscarConJoins
        const empresa = await this.repositories.empresa.BuscarPorFiltros({ cif: cif }, 1, conn);
        
        if (empresa.length === 0) {
            return null;
        }

        // Obtener datos relacionados por separado
        const empresaData = empresa[0];
        
        // Aquí podrías obtener datos de dirección, propietario, etc. si es necesario
        // Por ahora, devolvemos los datos básicos
        return empresaData;
    };

    if (client) {
        return await ejecutar(client);
    } else {
        return await this.withTransaction(ejecutar);
    }
}

// En EmpresaService.js, agrega este método
async actualizarCIF(cifViejo, cifNuevo, client = null) {
    const ejecutar = async (conn) => {
        // 1. Verificar que el cliente viejo existe
        const empresaExiste = await this.repositories.empresa.ExistePorId({ cif: cifViejo }, conn);
        if (!empresaExiste) {
            throw new Error('Cliente no encontrado');
        }

        // 2. Verificar que el nuevo CIF no existe
        const nuevoCIFExiste = await this.repositories.empresa.ExistePorId({ cif: cifNuevo }, conn);
        if (nuevoCIFExiste) {
            throw new Error('El nuevo CIF ya existe en la base de datos');
        }

        // 3. Actualizar el CIF
        return await this.repositories.empresa.actualizarPorId(
            { cif: cifViejo },
            { cif: cifNuevo },
            conn
        );
    };

    if (client) {
        return await ejecutar(client);
    } else {
        return await this.withTransaction(ejecutar);
    }
}
}