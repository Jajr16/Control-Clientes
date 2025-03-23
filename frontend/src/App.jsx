import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

import Layout from "./components/layout";

import AddClientesPage from "./pages/AgregarCliente";
import Home from "./pages/Home";

const App = () => {
    return (
        <Router>
            <Layout>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/nuevosClientes" element={<AddClientesPage />} />
                </Routes>
            </Layout>
        </Router>
    );
};

export default App;