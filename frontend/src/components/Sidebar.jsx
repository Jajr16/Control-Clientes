import React from "react";
import { Link } from "react-router-dom";
import { HomeIcon, UserCircleIcon, BuildingOffice2Icon } from "@heroicons/react/24/solid";

const Sidebar = () => {
    return (
        <aside className="bg-secondary-theme w-1 p-7">
            <div className="flex flex-col space-y-4">
                {/* Ícono de Inicio */}
                <div className="flex items-center justify-center w-full">
                    <Link to="/">
                        <HomeIcon className="h-6 w-6" />
                    </Link>
                </div>

                {/* Ícono de Empresas */}
                <div className="flex items-center justify-center w-full">
                    <Link to="/nuevosClientes">
                        <BuildingOffice2Icon className="h-16 w-6" />
                    </Link>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;