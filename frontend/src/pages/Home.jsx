import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const Home = () => {

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Lista de Empresas</h1>
            <Link to="/nuevosClientes">
                <button className="bg-amber-800 text-white px-4 py-2 rounded-md mb-4">
                    Agregar Empresa
                </button>
            </Link>
            <Link to="/nuevosInmuebles">
                <button className="bg-amber-800 text-white px-4 py-2 rounded-md mb-4">
                    Agregar Inmueble
                </button>
            </Link>
            <Link to="/nuevosProveedores">
                <button className="bg-amber-800 text-white px-4 py-2 rounded-md mb-4">
                    Agregar Proveedor
                </button>
            </Link>
        </div>
    );
};

export default Home;