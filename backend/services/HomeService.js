import { BaseService } from "./BaseService.js";
import Repositorio from "../repositories/globalPersistence.js";
import { pool } from "../config/db.js";

class HomeService extends BaseService {
    constructor() {
        super({
            empresa: new Repositorio('empresa e', 'cif'),
            adeudo: new Repositorio('adeudo a', ['num_factura', 'empresa_cif']),
            movimiento: new Repositorio('movimiento', 'id_movimiento')
        })
    }

    async obtenerDatosHome() {
        // Total de clientes
        const clientes = await this.repositories.empresa.BuscarPorFiltros({}, ['COUNT(*)']);

        // Adeudos pendientes (estado diferente de LIQUIDADO)
        const joinsPendientes = [
            { type: 'INNER', table: 'protocolo p', on: 'a.num_factura = p.num_factura AND a.empresa_cif = p.empresa_cif' },
            { type: 'INNER', table: 'empresa e', on: 'a.empresa_cif = e.cif' }
        ];

        const filtrosPendientes = {
            'a.estado': { op: '!=', value: 'LIQUIDADO' }
        };

        const columnasPendientes = [
            'COUNT(a.*) AS adeudo_pendiente'
        ];

        const adeudosPendientes = await this.repositories.adeudo.BuscarConJoins(
            joinsPendientes, 
            filtrosPendientes, 
            'AND', 
            columnasPendientes
        );

        // Calcular el total que deben todas las empresas
        const totalDebeEmpresas = await this.calcularTotalDebeEmpresas();

        // Últimos 10 movimientos
        const movimientos = await this.obtenerMovimientosRecientes(10);

        return {
            clientes: parseInt(clientes[0].count) || 0,
            adeudos_pendientes: parseInt(adeudosPendientes[0].adeudo_pendiente) || 0,
            total_debe_empresas: parseFloat(totalDebeEmpresas) || 0,
            movimientos
        };
    }

    async calcularTotalDebeEmpresas() {
        try {
            // Query optimizada: calcular el debe de todas las empresas en una sola consulta
            const query = `
                SELECT COALESCE(SUM(debe_empresa_result), 0) as total_debe
                FROM (
                    SELECT DISTINCT a.empresa_cif
                    FROM adeudo a
                ) empresas
                CROSS JOIN LATERAL calcular_saldo_empresa(empresas.empresa_cif)
            `;
            
            const result = await pool.query(query);
            return parseFloat(result.rows[0].total_debe) || 0;
        } catch (error) {
            console.error('Error calculando total debe empresas:', error);
            return 0;
        }
    }

    async obtenerMovimientosRecientes(limite = 10) {
        // Traer todos los campos necesarios
        const movimientos = await this.repositories.movimiento.BuscarPorFiltros(
            {}, 
            ['id_movimiento', 'accion', 'datos', 'fecha']
        );

        // Ordenar por fecha DESC (más recientes primero) y limitar
        return movimientos
            .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
            .slice(0, limite)
            .map(mov => ({
                id: mov.id_movimiento,
                accion: mov.accion,
                datos: mov.datos,
                fecha: mov.fecha,
                // Formatear fecha para el frontend
                fecha_formateada: this.formatearFecha(mov.fecha)
            }));
    }

    formatearFecha(fecha) {
        if (!fecha) return '';
        
        const date = new Date(fecha);
        const ahora = new Date();
        const diff = ahora - date;
        
        // Menos de 1 minuto
        if (diff < 60000) {
            return 'Hace un momento';
        }
        
        // Menos de 1 hora
        if (diff < 3600000) {
            const minutos = Math.floor(diff / 60000);
            return `Hace ${minutos} ${minutos === 1 ? 'minuto' : 'minutos'}`;
        }
        
        // Menos de 24 horas
        if (diff < 86400000) {
            const horas = Math.floor(diff / 3600000);
            return `Hace ${horas} ${horas === 1 ? 'hora' : 'horas'}`;
        }
        
        // Formatear fecha completa
        const opciones = { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        
        return date.toLocaleDateString('es-ES', opciones);
    }
}

export default HomeService;