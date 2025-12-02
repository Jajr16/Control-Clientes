// Sidebar.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { HomeIcon, UserGroupIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { FaFileInvoiceDollar } from "react-icons/fa";
import logoLetras from '../img/logoLetras.png';

const Sidebar = ({ isOpen, onClose }) => {
    const location = useLocation();

    const menuItems = [
        { path: "/", icon: HomeIcon, label: "Inicio" },
        { path: "/clientes", icon: UserGroupIcon, label: "Clientes" },
        { path: "/adeudos", icon: FaFileInvoiceDollar, label: "Adeudos", isReactIcon: true }
    ];

    return (
        <>
            {/* Sidebar Desktop */}
            <aside className="hidden lg:flex bg-secondary-theme w-16 xl:w-20 flex-col items-center py-6 space-y-6 fixed left-0 top-16 bottom-0 z-30">
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    const Icon = item.icon;
                    
                    return (
                        <div key={item.path} className="relative group">
                            <Link
                                to={item.path}
                                className={`flex items-center justify-center w-10 h-10 xl:w-12 xl:h-12 rounded-lg transition-all duration-200 ${
                                    isActive 
                                        ? 'bg-terciary-theme text-white shadow-lg' 
                                        : 'text-gray-600 hover:bg-gray-100 hover:bg-opacity-20'
                                }`}
                            >
                                {item.isReactIcon ? (
                                    <Icon className="h-5 w-5 xl:h-6 xl:w-6" />
                                ) : (
                                    <Icon className="h-5 w-5 xl:h-6 xl:w-6" />
                                )}
                            </Link>
                            
                            {/* Tooltip */}
                            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                                {item.label}
                            </div>
                        </div>
                    );
                })}
            </aside>

            {/* Sidebar Mobile */}
            <aside className={`fixed top-0 left-0 h-full w-64 bg-secondary-theme z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${
                isOpen ? 'translate-x-0' : '-translate-x-full'
            }`}>
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <img 
                        src={logoLetras}
                        alt="Logo" 
                        className="h-6" 
                    />
                    <button
                        onClick={onClose}
                        className="p-1 rounded-md hover:bg-gray-100 hover:bg-opacity-20 transition-colors"
                    >
                        <XMarkIcon className="h-6 w-6 text-gray-700" />
                    </button>
                </div>
                
                <nav className="mt-6">
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        const Icon = item.icon;
                        
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={onClose}
                                className={`flex items-center px-6 py-3 text-sm font-medium transition-colors duration-200 ${
                                    isActive 
                                        ? 'bg-terciary-theme text-white border-r-2 border-white' 
                                        : 'text-gray-600 hover:bg-gray-100 hover:bg-opacity-20'
                                }`}
                            >
                                {item.isReactIcon ? (
                                    <Icon className="h-5 w-5 mr-3" />
                                ) : (
                                    <Icon className="h-5 w-5 mr-3" />
                                )}
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>
            </aside>
        </>
    );
};

export default Sidebar;