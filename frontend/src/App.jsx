import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

import Layout from "./components/layout";

// Pagina principal
import Home from "./pages/Home";

// CRUD Clientes
import AddClientesPage from "./pages/AgregarCliente";
import Cliente from "./pages/Cliente";

// CRUD Inmuebles
import AddInmueblePage from "./pages/AgregarInmueble";

// CRUD Proveedores
import AddProveedorPage from "./pages/AgregarProveedor";

const App = () => {
    return (
        <Router>
            <Layout>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/nuevosClientes" element={<AddClientesPage />} />
                    <Route path="/clientes" element={<Cliente />} />
                    <Route path="/nuevosInmuebles" element={<AddInmueblePage />} />
                    <Route path="/nuevosProveedores" element={<AddProveedorPage />} />
                </Routes>
            </Layout>
        </Router>
    );
};

export default App;