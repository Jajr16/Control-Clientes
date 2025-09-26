import { useState } from "react";
import { formatCurrency } from "../../../hooks/Formateo.js";

// Hook personalizado para manejar el estado del saldo
export const InfoSaldo = () => {
    const [saldoInfo, setSaldoInfo] = useState(null);

    // Función para formatear moneda (necesaria dentro del componente)
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 2
        }).format(amount || 0);
    };

    const SaldoInfo = ({ saldoInfo, anticipoGeneral }) => {
        if (!saldoInfo && !anticipoGeneral) return null;

        const info = saldoInfo || anticipoGeneral;
        const estado = info.estado || (info.saldo_actual > 0 ? 'saldo_favorable' : info.debe_empresa > 0 ? 'debe_dinero' : 'saldado');

        const getEstadoColor = (estado) => {
            switch (estado) {
                case 'saldo_favorable':
                    return 'bg-green-100 border-green-300 text-green-800';
                case 'debe_dinero':
                    return 'bg-red-100 border-red-300 text-red-800';
                case 'saldado':
                    return 'bg-blue-100 border-blue-300 text-blue-800';
                default:
                    return 'bg-gray-100 border-gray-300 text-gray-800';
            }
        };

        const getEstadoTexto = (estado) => {
            switch (estado) {
                case 'saldo_favorable':
                    return 'Saldo a favor';
                case 'debe_dinero':
                    return 'Debe dinero';
                case 'saldado':
                    return 'Cuenta saldada';
                default:
                    return 'Sin información';
            }
        };

        return (
            <div className="grid grid-cols-1 sm:grid-cols-6 gap-3 sm:gap-4">
                <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                        {formatCurrency(info.anticipo_original || info.anticipo || 0)}
                    </div>
                    <div className="text-sm text-gray-600">Anticipo Original</div>
                </div>

                <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                        {formatCurrency(info.saldo_actual || 0)}
                    </div>
                    <div className="text-sm text-gray-600">Saldo Disponible</div>
                </div>

                <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                        {formatCurrency(info.total_adeudos || 0)}
                    </div>
                    <div className="text-sm text-gray-600">Total Adeudos</div>
                </div>

                <div className="text-center">
                    <div className="text-2xl font-bold text-amber-500">
                        {formatCurrency(info.total_honorarios || 0)}
                    </div>
                    <div className="text-sm text-gray-600">Total Honorarios</div>
                </div>

                <div className="text-center">
                    <div className="text-2xl font-bold text-red-800">
                        {formatCurrency(info.total_general || 0)}
                    </div>
                    <div className="text-sm text-gray-600">Total General</div>
                </div>

                <div className="text-center">
                    <div className={`inline-flex items-center px-3 py-2 rounded-full border-2 ${getEstadoColor(estado)}`}>
                        <div>
                            <div className="font-semibold">
                                {info.debe_empresa > 0 ? formatCurrency(info.debe_empresa) : getEstadoTexto(estado)}
                            </div>
                            <div className="text-xs">
                                {info.debe_empresa > 0 ? 'Debe' : 'Estado'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Retornar el estado y las funciones
    return {
        saldoInfo,
        setSaldoInfo,
        SaldoInfo
    };
};