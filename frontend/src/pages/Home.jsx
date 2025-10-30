import React from "react";
import { Link } from "react-router-dom";
import { PlusIcon, BuildingOfficeIcon, UserGroupIcon, DocumentIcon, ClockIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { getDatosHome } from "../api/Home/home";

const Home = () => {
    const [totalClientes, setTotalClientes] = useState("")
    const [adeudosPendientes, setAdeudosPendientes] = useState("")
    const [totalPendientes, setTotalPendientes] = useState("")
    const [movimientos, setMovimientos] = useState([]);

    useEffect(() => {
        const fetchDatosHome = async () => {
            try {
                const response = await getDatosHome();
                console.log(response.data)
                
                if (!response.success) {
                    alert(response.error);
                    return;
                }

                setTotalClientes(response.data.clientes)
                setAdeudosPendientes(response.data.adeudos_pendientes)
                setTotalPendientes(response.data.total_debe_empresas.toFixed(2))
                setMovimientos(response.data.movimientos || [])

            } catch (error) {
                console.error("Error fetching datos home:", error);
                resetState();
            }
        }

        const resetState = () => {
            setTotalClientes("")
            setAdeudosPendientes("")
            setTotalPendientes("")
            setMovimientos([])
        };

        fetchDatosHome();
    }, [])

    const quickActions = [
        {
            title: "Agregar Cliente",
            description: "Registra una nueva empresa en el sistema",
            icon: PlusIcon,
            color: "bg-blue-500 hover:bg-blue-600",
            link: "/nuevosClientes"
        },
        {
            title: "Ver Clientes",
            description: "Consulta y gestiona los clientes existentes",
            icon: UserGroupIcon,
            color: "bg-green-500 hover:bg-green-600",
            link: "/clientes"
        },
        {
            title: "Agregar Adeudo",
            description: "Registra un nuevo adeudo para una empresa",
            icon: DocumentIcon,
            color: "bg-purple-500 hover:bg-purple-600",
            link: "/adeudos"
        },
        {
            title: "Historial Adeudos",
            description: "Consulta el historial de adeudos por empresa",
            icon: BuildingOfficeIcon,
            color: "bg-orange-500 hover:bg-orange-600",
            link: "/historicoAdeudos"
        }
    ];

    return (
        <div className="w-full h-full overflow-y-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#5b3c1b] to-[#8f845b] px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                <div className="max-w-7xl mx-auto text-center">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 sm:mb-4">
                        Sistema de Gestión Empresarial
                    </h1>
                    <p className="text-base sm:text-lg text-blue-100 max-w-2xl mx-auto">
                        Administra clientes, adeudos y liquidaciones de manera eficiente
                    </p>
                </div>
            </div>

            {/* Stats Cards - Responsive */}
            <div className="px-4 sm:px-6 lg:px-8 -mt-8 relative z-10 mb-8">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 border border-gray-200">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <UserGroupIcon className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                                </div>
                                <div className="ml-3 sm:ml-4">
                                    <p className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wide">
                                        Total Clientes
                                    </p>
                                    <p className="text-lg sm:text-2xl font-semibold text-gray-900">{totalClientes}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 border border-gray-200">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <DocumentIcon className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
                                </div>
                                <div className="ml-3 sm:ml-4">
                                    <p className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wide">
                                        Adeudos Activos
                                    </p>
                                    <p className="text-lg sm:text-2xl font-semibold text-gray-900">{adeudosPendientes}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 border border-gray-200">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <BuildingOfficeIcon className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
                                </div>
                                <div className="ml-3 sm:ml-4">
                                    <p className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wide">
                                        Total Pendiente
                                    </p>
                                    <p className="text-lg sm:text-2xl font-semibold text-gray-900">€ {totalPendientes}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="px-4 sm:px-6 lg:px-8 pb-8">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-6 sm:mb-8">
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                            Acciones Rápidas
                        </h2>
                        <p className="text-sm sm:text-base text-gray-600">
                            Accede rápidamente a las funciones principales del sistema
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                        {quickActions.map((action, index) => {
                            const Icon = action.icon;
                            return (
                                <Link
                                    key={index}
                                    to={action.link}
                                    className="group bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 hover:border-gray-300 overflow-hidden"
                                >
                                    <div className="p-4 sm:p-6">
                                        <div className="flex items-center mb-3 sm:mb-4">
                                            <div className={`flex-shrink-0 p-2 sm:p-3 rounded-lg ${action.color} transition-colors duration-300`}>
                                                <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                                            </div>
                                        </div>
                                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 group-hover:text-gray-700">
                                            {action.title}
                                        </h3>
                                        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                                            {action.description}
                                        </p>
                                    </div>

                                    {/* Hover effect bar */}
                                    <div className="h-1 bg-gray-100 group-hover:bg-gradient-to-r group-hover:from-blue-500 group-hover:to-purple-500 transition-all duration-300"></div>
                                </Link>
                            );
                        })}
                    </div>

                    {/* Recent Activity Section */}
                    <div className="mt-8 sm:mt-12">
                        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                            <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
                                <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
                                    <ClockIcon className="h-5 w-5 mr-2 text-blue-600" />
                                    Actividad Reciente
                                </h3>
                                <p className="text-xs sm:text-sm text-gray-600 mt-1 ml-7">
                                    Últimas 10 acciones realizadas en el sistema
                                </p>
                            </div>

                            <div className="px-4 sm:px-6 py-4 sm:py-6">
                                {movimientos.length === 0 ? (
                                    <div className="text-center text-gray-500 py-8">
                                        <DocumentIcon className="mx-auto h-12 w-12 mb-4 text-gray-300" />
                                        <p className="text-xs sm:text-sm">No hay actividad reciente</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                                        {movimientos.map((mov, index) => (
                                            <div 
                                                key={mov.id || index} 
                                                className="bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 hover:border-blue-300"
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm sm:text-base text-gray-900 font-medium break-words">
                                                            {mov.accion}
                                                        </p>
                                                        {mov.datos && Object.keys(mov.datos).length > 0 && (
                                                            <div className="mt-2 text-xs text-gray-500 bg-gray-50 rounded px-2 py-1 inline-block">
                                                                {Object.entries(mov.datos).slice(0, 2).map(([key, value]) => (
                                                                    <span key={key} className="mr-3">
                                                                        <span className="font-semibold">{key}:</span> {' '}
                                                                        {typeof value === 'object' && value !== null 
                                                                            ? JSON.stringify(value) 
                                                                            : String(value)}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="ml-4 flex-shrink-0">
                                                        <span className="inline-flex items-center text-xs text-gray-500 bg-blue-50 px-2 py-1 rounded-full whitespace-nowrap">
                                                            <ClockIcon className="h-3 w-3 mr-1" />
                                                            {mov.fecha_formateada}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #f1f1f1;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #888;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #555;
                }
            `}</style>
        </div>
    );
};

export default Home;