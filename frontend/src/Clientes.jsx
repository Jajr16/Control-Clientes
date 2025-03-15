import React, { useEffect, useState } from "react";
import { getClientes, addCliente } from "./api.js";  // Asegurar la extensión

const Clientes = () => {
    const [clientes, setClientes] = useState([]);
    const [nombre, setNombre] = useState("");
    const [email, setEmail] = useState("");

    // Obtener clientes al cargar la página
    useEffect(() => {
        cargarClientes();
    }, []);

    const cargarClientes = async () => {
        try {
            const data = await getClientes();
            setClientes(data);
        } catch (error) {
            console.error("Error al obtener clientes:", error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!nombre || !email) return alert("Todos los campos son obligatorios");

        try {
            await addCliente({ nombre, email });
            cargarClientes();
            setNombre("");
            setEmail("");
        } catch (error) {
            console.error("Error al agregar cliente:", error);
        }
    };

    return (
        <div>
            <h1>Lista de Clientes</h1>
            <ul>
                {clientes.map((cliente) => (
                    <li key={cliente.id}>
                        {cliente.nombre} - {cliente.email}
                    </li>
                ))}
            </ul>

            <h2>Agregar Cliente</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Nombre"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                />
                <input
                    type="email"
                    placeholder="Correo"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <button type="submit">Agregar</button>
            </form>
        </div>
    );
};

export default Clientes;
