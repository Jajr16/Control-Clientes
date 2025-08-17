import { BaseService } from './BaseService.js';
import Repositorio from "../repositories/globalPersistence.js";
import { pool } from "../config/db.js";

class AdeudoService extends BaseService {
    constructor() {
        super({
            adeudo: new Repositorio('adeudo', 'num_factura'),
            protocolo: new Repositorio('protocolo', 'num_factura'),
            anticipo: new Repositorio('anticipo', 'empresa_cif'),
            empresa: new Repositorio('empresa', 'cif')
        });
    }

    async insertarAdeudoCompleto({ adeudo, protocolo }) {
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
                COALESCE(h.honorario, 0) AS honorarios_base,
                COALESCE(h.iva, 0) AS honorarios_iva,
                CASE 
                    WHEN a.num_liquidacion IS NULL THEN 'PENDIENTE'
                    ELSE 'LIQUIDADO'
                END as estado,
                h.fecha_creacion as fecha_liquidacion,
                CASE 
                    WHEN a.concepto = 'Registro Mercantil de Madrid' THEN COALESCE(aj.diferencia, 0)
                    ELSE NULL
                END AS diferencia
            FROM adeudo a
            LEFT JOIN protocolo p ON a.num_factura = p.num_factura
            LEFT JOIN anticipo an ON a.empresa_cif = an.empresa_cif
            LEFT JOIN honorario h ON a.num_liquidacion = h.num_liquidacion AND a.empresa_cif = h.empresa_cif
            LEFT JOIN ajuste aj ON a.num_factura = aj.num_factura
            WHERE a.empresa_cif = $1
            ORDER BY 
                CASE WHEN a.num_liquidacion IS NULL THEN 0 ELSE 1 END,
                COALESCE(a.num_liquidacion, 999999) DESC, 
                a.ff ASC
        `;

        const result = await pool.query(query, [empresa_cif]);

        const query_anticipo = `
            SELECT 
                an.empresa_cif,
                an.anticipo 
            FROM anticipo an
            WHERE an.empresa_cif = $1;
        `

        const anticipo_result = await pool.query(query_anticipo, [empresa_cif])
        const anticipo = anticipo_result.rows[0] || null;

        // Calcular resumen
        const resumen = this._calcularResumen(result.rows);

        const formatDate = (date) => {
            if (!date) return null;
            return new Date(date).toLocaleDateString("es-ES", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric"
            });
        };

        const adeudos = result.rows.map(row => ({
            ...row,
            ff: formatDate(row.ff),
            fecha_liquidacion: formatDate(row.fecha_liquidacion)
        }));

        return {
            anticipo,
            adeudos,
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

    async getAdeudos() {
        return await this.withTransaction(async () => {
            // const adeudos = await this.repositories.
        })
    }

    async updateAdeudos(data) {
        const is_num_fac = !!data.num_factura;
        const is_anticipo = !!data.anticipo_unico;
        let set = {}

        if (is_anticipo) {
            set.anticipo = data.anticipo_unico
        }
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