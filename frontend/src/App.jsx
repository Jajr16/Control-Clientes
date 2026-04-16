import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

import Layout from "./components/layout/layout";
// import AddAdeudos from "./features/adeudos/pages/AgregarAdeudo";
// import HistorialAdeudos from "./features/adeudos/pages/HistorialAdeudo";
import AddClientesPage from "./features/clientes/pages/AgregarCliente";
import Cliente from "./features/clientes/pages/Cliente";
import Home from "./features/home/pages/Home";

const App = () => {
    return (
        <Router>
            <Layout>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/nuevosClientes" element={<AddClientesPage />} />
                    <Route path="/clientes" element={<Cliente />} />
                    {/* <Route path="/adeudos" element={<AddAdeudos />} />
                    <Route path="/historicoAdeudos" element={<HistorialAdeudos />} /> */}
                </Routes>
            </Layout>
        </Router>
    );
};

export default App;