import React, { useState, useEffect } from "react";
import Select from "react-select";

const ClientSearch = ({ onSelectClient }) => {
    const [clients, setClients] = useState([]);
    const [selectedClient, setSelectedClient ] = useState(null)

    useEffect(() => {
        const fetchClients = async () => {
            const response = await fetch("/api/searchClients")
            const data = await response.json()
            setClients(data)
        }

        fetchClients()
    }, [])

    // Formatear los clientes para React Select
    const clientOptions = clients.map((client) => ({
        value: client.id,
        label: `${client.nombre} - ${client.clave}`, 
        nombre: client.nombre, 
        clave: client.clave, 
        direccion: client.direccion, 
    }));

    const filterOptions = (option, inputValue) => {
        const searchTerm = inputValue.toLowerCase();
        return (
            option.data.nombre.toLowerCase().includes(searchTerm) ||
            option.data.clave.toLowerCase().includes(searchTerm) ||
            option.data.direccion.toLowerCase().includes(searchTerm)
        );
    }

    // Maneja la selección de un cliente
    const handleSelectClient = (selectedOption) => {
        setSelectedClient(selectedOption);
        if (selectedOption) {
            const client = clients.find((c) => c.id === selectedOption.value);
            onSelectClient(client); // Llama a la función para seleccionar un cliente
        }
    };

    return (
        <div className="p-4">
            <Select
                options={clientOptions}
                value={selectedClient}
                onChange={handleSelectClient}
                placeholder="Buscar cliente..."
                isSearchable // Habilita la búsqueda
                noOptionsMessage={() => "No hay resultados"} // Mensaje cuando no hay coincidencias
                filterOption={filterOptions} // Usa la función personalizada para filtrar
            />
        </div>
    );
}

export default ClientSearch;