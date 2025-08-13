import { BaseService } from './BaseService.js';
import Repositorio from "../repositories/globalPersistence.js";
import { pool } from "../config/db.js";

class AdeudoService extends BaseService {
    constructor() {
        super({
            adeudo: new Repositorio('adeudo', 'num_factura'),
            protocolo: new Repositorio('protocolo', 'num_factura'),
            anticipo: new Repositorio('anticipo', 'empresa_cif'),
            ajuste: new Repositorio('ajuste', 'num_factura'),
            empresa: new Repositorio('empresa', 'cif')
        });
    }

    async insertarAdeudoCompleto({ adeudo, protocolo, ajuste }) {
        return await this.withTransaction(async (client) => {
            // 1. Insertar adeudo SIN num_liquidacion
            const adeudoInsertado = await this.repositories.adeudo.insertar(adeudo, client);
            console.log('Adeudo insertado como PENDIENTE:', adeudoInsertado);

            // 2. Insertar protocolo si existe
            if (protocolo && Object.keys(protocolo).length > 0) {
                await this.repositories.protocolo.insertar(protocolo, client);
                console.log('Protocolo insertado');
            }

            // 3. Verificar anticipo existente
            const anticipoExistente = await this.repositories.anticipo
                .ObtenerPorId({ empresa_cif: adeudo.empresa_cif });

            if (anticipoExistente) {
                console.log('Usando anticipo existente:', anticipoExistente);
            }

            // 4. Insertar ajuste si existe
            if (ajuste && Object.keys(ajuste).length > 0) {
                await this.repositories.ajuste.insertar(ajuste, client);
                console.log('Ajuste insertado');
            }

            return adeudoInsertado;
        });
    }

    async obtenerTodosAdeudosPorEmpresa(empresa_cif) {
        const query = `
            SELECT 
                a.num_factura,
                a.concepto,
                a.proveedor,
                a.ff,
                a.importe,
                a.iva,
                a.retencion,
                a.num_liquidacion,
                COALESCE(p.protocolo_entrada, '') AS protocolo_entrada,
                COALESCE(p.cs_iva, 0) AS cs_iva,
                (COALESCE(a.importe,0) + COALESCE(a.iva,0) - COALESCE(a.retencion,0) + COALESCE(p.cs_iva,0)) AS total,
                COALESCE(an.anticipo, 0) AS anticipo,
                COALESCE(h.honorario, 0) AS honorarios_base,
                COALESCE(h.iva, 0) AS honorarios_iva,
                a.empresa_cif,
                CASE 
                    WHEN a.num_liquidacion IS NULL THEN 'PENDIENTE'
                    ELSE 'LIQUIDADO'
                END as estado,
                h.fecha_creacion as fecha_liquidacion
            FROM adeudo a
            LEFT JOIN protocolo p ON a.num_factura = p.num_factura
            LEFT JOIN anticipo an ON a.empresa_cif = an.empresa_cif
            LEFT JOIN honorario h ON a.num_liquidacion = h.num_liquidacion AND a.empresa_cif = h.empresa_cif
            WHERE a.empresa_cif = $1
            ORDER BY 
                CASE WHEN a.num_liquidacion IS NULL THEN 0 ELSE 1 END,
                COALESCE(a.num_liquidacion, 999999) DESC, 
                a.ff ASC
        `;

        const result = await pool.query(query, [empresa_cif]);

        // Calcular resumen
        const resumen = this._calcularResumen(result.rows);

        return {
            adeudos: result.rows,
            resumen
        };
    }

    async obtenerAdeudosPendientes(empresa_cif) {
        const query = `
            SELECT 
                a.num_factura,
                a.concepto,
                a.proveedor,
                a.ff,
                a.importe,
                a.iva,
                a.retencion,
                a.num_liquidacion,
                COALESCE(p.protocolo_entrada, '') AS protocolo_entrada,
                COALESCE(p.cs_iva, 0) AS cs_iva,
                (COALESCE(a.importe,0) + COALESCE(a.iva,0) - COALESCE(a.retencion,0) + COALESCE(p.cs_iva,0)) AS total,
                COALESCE(an.anticipo, 0) AS anticipo,
                a.empresa_cif,
                'PENDIENTE' as estado
            FROM adeudo a
            LEFT JOIN protocolo p ON a.num_factura = p.num_factura
            LEFT JOIN anticipo an ON a.empresa_cif = an.empresa_cif
            WHERE a.empresa_cif = $1 AND a.num_liquidacion IS NULL
            ORDER BY a.ff ASC
        `;

        const result = await pool.query(query, [empresa_cif]);

        return {
            adeudos: result.rows,
            resumen: {
                total_pendientes: result.rows.length
            }
        };
    }

    async verificarAdeudosPendientes(empresa_cif) {
        const query = `
            SELECT COUNT(*) as total_pendientes
            FROM adeudo 
            WHERE empresa_cif = $1 AND num_liquidacion IS NULL
        `;

        const result = await pool.query(query, [empresa_cif]);
        const totalPendientes = parseInt(result.rows[0].total_pendientes);

        return {
            hay_pendientes: totalPendientes > 0,
            total_pendientes: totalPendientes
        };
    }

    async getEmpresasAdeudos() {
        return await this.withTransaction(async () => {
            const empresas = await this.repositories.empresa.BuscarConJoins([], {}, 'AND', ['cif', 'nombre', 'clave'])
            return empresas;
        })
    }

    _calcularResumen(adeudos) {
        return {
            total: adeudos.length,
            pendientes: adeudos.filter(a => a.estado === 'PENDIENTE').length,
            liquidados: adeudos.filter(a => a.estado === 'LIQUIDADO').length
        };
    }
}

export default AdeudoService;