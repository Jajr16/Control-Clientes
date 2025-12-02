// Navbar.jsx
import React from "react";
import { Bars3Icon } from "@heroicons/react/24/solid";
import logoLetras from '../img/logoLetras.png';

const Navbar = ({ onMenuClick }) => {
    return (
        <div className="bg-secondary-theme p-3 sm:p-4 relative z-50">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    {/* Botón de menú móvil */}
                    <button
                        onClick={onMenuClick}
                        className="lg:hidden p-1 rounded-md hover:bg-gray-100 hover:bg-opacity-20 transition-colors"
                    >
                        <Bars3Icon className="h-6 w-6 text-gray-700" />
                    </button>
                    
                    <img 
                        src={logoLetras} 
                        alt="Logo" 
                        className="h-5 sm:h-6 lg:h-8" 
                    />
                </div>
            </div>
            
            {/* Elementos decorativos responsivos */}
            <div className="absolute top-0 right-0 w-[5%] sm:w-[3%] h-1 sm:h-2 bg-terciary-theme"></div>
            <div className="absolute bottom-[40%] right-0 w-[10%] sm:w-[8%] h-1 sm:h-2 bg-terciary-theme"></div>
            <div className="absolute bottom-0 right-0 w-[95%] sm:w-[97%] h-1 sm:h-2 bg-terciary-theme"></div>
        </div>
    );
};

export default Navbar;