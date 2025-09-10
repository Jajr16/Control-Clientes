import { BaseService } from './BaseService.js';
import Repositorio from "../repositories/globalPersistence.js";
import { pool } from "../config/db.js";
import formatDate from '../validations/formatDate.js';
import { adeudoSchema } from '../middleware/Schemas.js'
import { historicoExcel } from '../utils/adeudosExcel.js';

class AdeudoService extends BaseService {
    constructor() {
        super({
            adeudo: new Repositorio('adeudo', ['num_factura', 'empresa_cif']),
            protocolo: new Repositorio('protocolo', ['num_factura', 'empresa_cif']),
            anticipo: new Repositorio('anticipo', 'empresa_cif'),
            empresa: new Repositorio('empresa', 'cif')
        });
    }

    async insertarAdeudoCompleto({ adeudo, protocolo }) {
        return await this.withTransaction(async (client) => {
            // 1. Insertar adeudo SIN num_liquidacion
            const adeudoInsertado = await this.repositories.adeudo.insertar(adeudo, client);

            // 2. Insertar protocolo si existe
            if (protocolo && Object.keys(protocolo).length > 0) {
                await this.repositories.protocolo.insertar(protocolo, client);
            }

            // 3. Verificar anticipo existente
            const anticipoExistente = await this.repositories.anticipo
                .ObtenerPorId({ empresa_cif: adeudo.empresa_cif });

            if (anticipoExistente) {
                console.log('Usando anticipo existente:', anticipoExistente);
            }

            const empresa = await this.repositories.empresa.BuscarPorFiltros({ cif: adeudo.empresa_cif }, ['nombre'])

            if (empresa.length > 0) {
                await this.repositories.adeudo.registrarMovimiento({ accion: `Se agregó un adeudo para: ${empresa[0].nombre}`, datos: adeudo }, client);
            } else {
                console.log('No se encontró la empresa')
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
                a.fecha_creacion as f_adeudo_creacion, 
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
            LEFT JOIN protocolo p ON a.num_factura = p.num_factura AND a.empresa_cif = p.empresa_cif
            LEFT JOIN anticipo an ON a.empresa_cif = an.empresa_cif
            LEFT JOIN honorario h ON a.num_liquidacion = h.num_liquidacion AND a.empresa_cif = h.empresa_cif
            LEFT JOIN ajuste aj ON a.num_factura = aj.num_factura AND a.empresa_cif = aj.empresa_cif
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

        const adeudos = result.rows.map(row => ({
            ...row,
            ff: formatDate(row.ff)
        }));

        return {
            adeudos,
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

    async updateAdeudos(data) {
        console.log("Datos recibidos:", data);

        const empresa_cif = data.empresa_cif;
        const anticipoUnico = data.anticipo_unico;
        const cambiosProtocolo = data.cambios_protocolo || [];
        const setAdeudos = data.cambios_filas || [];

        if (anticipoUnico !== undefined && anticipoUnico !== null && isNaN(Number(anticipoUnico))) {
            throw new Error("El anticipo debe ser un número válido");
        }

        for (const adeudo of setAdeudos) {
            const { num_factura_original, ...nuevosDatos } = adeudo;
            const { error } = adeudoSchema.validate({ num_factura_original, ...nuevosDatos });
            if (error) throw new Error(`Error de validación en factura ${num_factura_original}: ${error.message}`);
        }

        for (const protocolo of cambiosProtocolo) {
            const { num_factura, cs_iva, protocolo_entrada } = protocolo;
            if (!num_factura) throw new Error("num_factura es obligatorio en cambios_protocolo");
        }

        return await this.withTransaction(async (client) => {

            // a) Anticipo
            if (anticipoUnico !== undefined) {
                const exists = await this.repositories.anticipo.ExistePorId({ empresa_cif });
                if (exists) {
                    await this.repositories.anticipo.actualizarPorId(
                        { empresa_cif },
                        { anticipo: Number(anticipoUnico) },
                        client
                    );
                    console.log("ANTICIPO ACTUALIZADO");
                } else {
                    await this.repositories.anticipo.insertar(
                        { empresa_cif, anticipo: Number(anticipoUnico) },
                        client
                    );
                    console.log("ANTICIPO INSERTADO");
                }
            }

            // b) Protocolos
            if (cambiosProtocolo.length > 0) {
                await Promise.all(
                    cambiosProtocolo.map(async (protocolo) => {
                        const { num_factura, ...nuevosDatos } = protocolo;
                        const exists = await this.repositories.protocolo.ExistePorId({ num_factura, empresa_cif });
                        if (exists) {
                            await this.repositories.protocolo.actualizarPorId({ num_factura, empresa_cif }, nuevosDatos, client);
                            console.log(`PROTOCOLO ACTUALIZADO: ${num_factura}`);
                        } else {
                            await this.repositories.protocolo.insertar({ ...nuevosDatos, num_factura, empresa_cif }, client);
                            console.log(`PROTOCOLO INSERTADO: ${num_factura}`);
                        }
                    })
                );
            }

            // c) Adeudos
            if (setAdeudos.length > 0) {
                await Promise.all(
                    setAdeudos.map(async (adeudo) => {
                        const { num_factura_original, ...nuevosDatos } = adeudo;

                        if (nuevosDatos.num_liquidacion === "" || isNaN(Number(nuevosDatos.num_liquidacion))) {
                            nuevosDatos.num_liquidacion = null;
                        }

                        await this.repositories.adeudo.actualizarPorId({ num_factura: num_factura_original, empresa_cif }, nuevosDatos, client);
                        console.log(`ADEUDO ACTUALIZADO: ${num_factura_original}`);
                    })
                );
                console.log("ADEUDOS ACTUALIZADOS");
            }

            const empresa = await this.repositories.empresa.BuscarPorFiltros({ cif: empresa_cif }, ['nombre'])

            if (empresa.length > 0) {
                await this.repositories.adeudo.registrarMovimiento({ accion: `Se actualizó un adeudo para: ${empresa[0].nombre}`, datos: data }, client);
            } else {
                console.log('No se encontró la empresa')
            }

            return {
                success: true,
                message: "Cambios guardados correctamente",
                adeudosActualizados: setAdeudos.length,
                protocolosActualizados: cambiosProtocolo.length,
                anticipoActualizado: anticipoUnico !== undefined
            };

        });
    }

    async deleteAdeudos(data) {
        return await this.withTransaction(async (cliente) => {
            console.log(data);

            await Promise.all(
                data.map(async (adeudo) => {
                    console.log(adeudo);
                    const exists = await this.repositories.adeudo.ExistePorId({
                        num_factura: adeudo.num_factura,
                        empresa_cif: adeudo.empresa_cif
                    });

                    if (exists) {
                        const eliminar = await this.repositories.adeudo.eliminarPorId(
                            { num_factura: adeudo.num_factura, empresa_cif: adeudo.empresa_cif },
                            cliente
                        );

                        if (!eliminar) {
                            return {
                                success: false,
                                message: "Hubo un error al eliminar el adeudo."
                            }
                        }
                    }
                })
            );

            const empresa = await this.repositories.empresa.BuscarPorFiltros({ cif: adeudo.empresa_cif }, ['nombre'])

            if (empresa.length > 0) {
                await this.repositories.adeudo.registrarMovimiento({ accion: `Se eliminó el adeudo con factura: ${adeudo.num_factura} para: ${empresa[0].nombre}`, adeudo }, client)
            } else {
                console.log('No se encontró la empresa')
            }

            return {
                success: true,
                message: "Adeudos eliminados correctamente",
            };
        });
    }

    async createRecord(data) {
        console.log("Esto llega primero " + data)
        const historico = await this.obtenerTodosAdeudosPorEmpresa(data)
        const empresa = await this.repositories.empresa.BuscarPorFiltros({ cif: data }, ['nombre'])
        const nombreEmpresa = empresa[0].nombre
        historico.nombreEmpresa = nombreEmpresa

        return historicoExcel(historico)
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