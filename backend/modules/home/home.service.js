import { BaseService } from "../../services/base.service.js";
import Repositorio from "../../repositories/global.repository.js";
import { formatearFecha } from "../../validations/formatDate.js";
import { QueryBuilder } from "../../utils/queryBuilder.js";

class HomeService extends BaseService {
    constructor() {
        super({
            empresa: new Repositorio('empresa e', 'cif'),
            adeudo: new Repositorio('adeudo a', ['num_factura', 'empresa_cif']),
            movimiento: new Repositorio('movimiento', 'id_movimiento')
        })
    }

    async obtenerDatosHome() {

        // -------------------------
        // CLIENTES (COUNT EMPRESAS)
        // -------------------------
        const qbClientes = new QueryBuilder('empresa');

        const { query: queryClientes, params: paramsClientes } = qbClientes
            .select(['COUNT(*) AS total'])
            .build();


        // -------------------------
        // ADEUDOS PENDIENTES
        // -------------------------
        const qbAdeudos = new QueryBuilder('adeudo a');

        const { query: queryAdeudos, params: paramsAdeudos } = qbAdeudos
            .select(['COUNT(a.*) AS adeudo_pendiente'])
            .join('INNER', 'protocolo p', 'a.num_factura = p.num_factura AND a.empresa_cif = p.empresa_cif')
            .join('INNER', 'empresa e', 'a.empresa_cif = e.cif')
            .where('a.estado', 'LIQUIDADO', '!=')
            .build();


        // -------------------------
        // MOVIMIENTOS RECIENTES
        // -------------------------
        const qbMovimientos = new QueryBuilder('movimiento');

        const { query: queryMovimientos, params: paramsMovimientos } = qbMovimientos
            .select(['id_movimiento', 'accion', 'datos', 'fecha'])
            .orderBy('fecha', 'DESC')
            .limit(10)
            .build();

        const [
            clientes,
            adeudosPendientes,
            totalempresas,
            movimientos
        ] = await Promise.all([
            this.repositories.empresa.ejecutarQuery(queryClientes, paramsClientes),
            this.repositories.adeudo.ejecutarQuery(queryAdeudos, paramsAdeudos),
            this.calcularTotalDebeEmpresas(),
            this.repositories.movimiento.ejecutarQuery(queryMovimientos, paramsMovimientos)
        ]);

        return {
            clientes: Number(clientes?.[0]?.total ?? 0),
            adeudos_pendientes: Number(adeudosPendientes?.[0]?.adeudo_pendiente ?? 0),
            total_debe_empresas: Number(totalempresas ?? 0),
            movimientos: movimientos.map(mov => ({
                id: mov.id_movimiento,
                accion: mov.accion,
                datos: mov.datos,
                fecha: mov.fecha,
                fecha_formateada: formatearFecha(mov.fecha)
            }))
        }
    }


    async calcularTotalDebeEmpresas() {
        try {

            const query = `
                SELECT COALESCE(SUM(debe_empresa_result), 0) as total_debe
                FROM (
                    SELECT DISTINCT a.empresa_cif
                    FROM adeudo a
                ) empresas
                CROSS JOIN LATERAL calcular_saldo_empresa(empresas.empresa_cif)
            `;

            const result = await this.repositories.empresa.ejecutarQuery(query);

            return parseFloat(result[0].total_debe) || 0;

        } catch (error) {
            console.error('Error calculando total debe empresas:', error);
            return 0;
        }
    }
}

export default HomeService;