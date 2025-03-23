import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
    return (
        <div className="bg-secondary-theme p-4 relative">
            <div className="flex items-center">
                <img src="/src/img/logoLetras.png" alt="Logo" className="h-6" />
            </div>
            
            <div className="absolute top-0 right-0 w-[5%] h-2 bg-terciary-theme"></div>
            <div className="absolute bottom-[40%] right-0 w-[10%] h-2 bg-terciary-theme"></div>
            <div className="absolute bottom-0 right-0 w-[97%] h-2 bg-terciary-theme"></div>
        </div>
    )
};

export default Navbar;