import { BaseService } from "./BaseService.js";
import Repositorio from "../repositories/globalPersistence.js";

class HomeService extends BaseService {
    constructor() {
        super({
            empresa: new Repositorio('empresa e', 'cif'),
            adeudo: new Repositorio('adeudo a', ['num_factura', 'empresa_cif']),
            movimiento: new Repositorio('movimiento', 'id_movimiento')
        })
    }

    async obtenerDatosHome() {
        const clientes = await this.repositories.empresa.BuscarPorFiltros({}, ['COUNT(*)'])

        const joinsPendientes = [
            { type: 'INNER', table: 'protocolo p', on: 'a.num_factura = p.num_factura AND a.empresa_cif = p.empresa_cif' },
            { type: 'INNER', table: 'empresa e', on: 'a.empresa_cif = e.cif' },
        ]

        const filtrosPendientes = {
            'a.num_liquidacion': null
        }

        const columnasPendientes = [
            'COUNT(a.*) AS adeudo_pendiente', 'SUM(a.importe + a.iva - a.retencion + p.cs_iva) AS total_pendiente'
        ]

        const adeudosPendientes = await this.repositories.adeudo.BuscarConJoins(joinsPendientes, filtrosPendientes, 'AND', columnasPendientes);

        const joinLiquidado = [
            { type: 'INNER', table: 'protocolo p', on: 'a.num_factura = p.num_factura AND a.empresa_cif = p.empresa_cif' }
        ]

        const filtrosLiquidado = {
            'a.num_liquidacion': { op: 'IS NOT NULL' },
            "DATE_TRUNC('month', a.ff)": { raw: "DATE_TRUNC('month', CURRENT_DATE)" }
        }

        const columnasLiquidado = [
            'COALESCE(SUM(a.importe + a.iva - a.retencion + p.cs_iva), 0) AS liquidado'
        ]

        const liquidacion = await this.repositories.adeudo.BuscarConJoins(joinLiquidado, filtrosLiquidado, 'AND', columnasLiquidado)

        const movimientos = await this.obtenerMovimientosRecientes(10);

        return {
            clientes: clientes[0].count,
            adeudos_pendientes: adeudosPendientes[0].adeudo_pendiente,
            total_pendientes: adeudosPendientes[0].total_pendiente,
            liquidados: liquidacion[0].liquidado,
            movimientos
        };

    }

    async obtenerMovimientosRecientes(limite = 10) {
        const movimientos = await this.repositories.movimiento.BuscarPorFiltros({}, ['accion', 'fecha']);

        movimientos.sort((a, b) => new Date(b.fecha_creacion) - new Date(a.fecha_creacion));
        return movimientos.slice(0, limite);
    }
}

export default HomeService