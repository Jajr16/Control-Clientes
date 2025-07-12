import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

import Layout from "./components/layout";
import AddAdeudos from "./pages/AgregarAdeudo";
import AddClientesPage from "./pages/AgregarCliente";
import Cliente from "./pages/Cliente";
import Home from "./pages/Home";

const App = () => {
    return (
        <Router>
            <Layout>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/nuevosClientes" element={<AddClientesPage />} />
                    <Route path="/clientes" element={<Cliente />} />
                    <Route path="/adeudos" element={<AddAdeudos />} />
                </Routes>
            </Layout>
        </Router>
    );
};

export default App;