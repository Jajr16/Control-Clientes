import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const Home = () => {

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Lista de Empresas</h1>
            <Link to="/nuevosClientes">
                <button className="bg-blue-500 text-white px-4 py-2 rounded-md mb-4">
                    Agregar Empresa
                </button>
            </Link>
        </div>
    );
};

export default Home;