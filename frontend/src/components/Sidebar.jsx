import React from "react";
import { Link } from "react-router-dom";
import { HomeIcon, UserCircleIcon, BuildingOffice2Icon, UserGroupIcon, HomeModernIcon } from "@heroicons/react/24/solid";
import { FaFileInvoiceDollar } from "react-icons/fa";

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

                {/* Ícono de clientes */}
                <div className="flex items-center justify-center w-full">
                    <Link to="/clientes">
                        <UserGroupIcon className="h-16 w-6" />
                    </Link>
                </div>

                {/* Ícono de adeudos */}
                <div className="flex items-center justify-center w-full">
                    <Link to="/adeudos">
                        <FaFileInvoiceDollar className="h-6 w-6" />
                    </Link>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;