import React from "react";
import { Link } from "react-router-dom";
import { PlusIcon, BuildingOfficeIcon, UserGroupIcon, DocumentIcon } from "@heroicons/react/24/outline";

const Home = () => {
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
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 border border-gray-200">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <UserGroupIcon className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                                </div>
                                <div className="ml-3 sm:ml-4">
                                    <p className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wide">
                                        Total Clientes
                                    </p>
                                    <p className="text-lg sm:text-2xl font-semibold text-gray-900">--</p>
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
                                    <p className="text-lg sm:text-2xl font-semibold text-gray-900">--</p>
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
                                    <p className="text-lg sm:text-2xl font-semibold text-gray-900">€--</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 border border-gray-200">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <DocumentIcon className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600" />
                                </div>
                                <div className="ml-3 sm:ml-4">
                                    <p className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wide">
                                        Este Mes
                                    </p>
                                    <p className="text-lg sm:text-2xl font-semibold text-gray-900">€--</p>
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
                            <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-200">
                                <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                                    Actividad Reciente
                                </h3>
                                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                                    Últimas acciones realizadas en el sistema
                                </p>
                            </div>
                            
                            <div className="px-4 sm:px-6 py-8 sm:py-12 text-center">
                                <div className="max-w-sm mx-auto">
                                    <DocumentIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                    <h3 className="text-sm sm:text-base font-medium text-gray-900 mb-2">
                                        No hay actividad reciente
                                    </h3>
                                    <p className="text-xs sm:text-sm text-gray-500">
                                        Las actividades recientes aparecerán aquí una vez que comiences a usar el sistema.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Help Section */}
                    <div className="mt-8 sm:mt-12">
                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 sm:p-6 border border-blue-200">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                <div className="mb-4 sm:mb-0">
                                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                                        ¿Necesitas ayuda?
                                    </h3>
                                    <p className="text-xs sm:text-sm text-gray-600">
                                        Consulta nuestra documentación o contacta con soporte técnico
                                    </p>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                                    <button className="inline-flex items-center justify-center px-3 sm:px-4 py-2 border border-transparent text-xs sm:text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 transition-colors duration-300">
                                        Documentación
                                    </button>
                                    <button className="inline-flex items-center justify-center px-3 sm:px-4 py-2 border border-blue-300 text-xs sm:text-sm font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 transition-colors duration-300">
                                        Contactar Soporte
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;