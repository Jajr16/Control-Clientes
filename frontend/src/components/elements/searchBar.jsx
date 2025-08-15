import React, { useState, useEffect } from "react";
import Select from "react-select";
import { XMarkIcon } from "@heroicons/react/24/solid";
const API_URL = import.meta.env.VITE_API_URL;

const ClientSearch = ({
    onSelectClient,
    routeName,
    fieldsToInclude = ["cif", "nombre", "clave"],
    labelFormat = (client) => `${client.clave} - ${client.nombre}`,
}) => {
    const [clients, setClients] = useState([]);
    const [selectedClient, setSelectedClient] = useState(null);

    useEffect(() => {
        const fetchClients = async () => {
            const response = await fetch(`${API_URL}/${routeName}`);
            const data = await response.json();
            setClients(data.data);
        };

        fetchClients();
    }, []);

    const clientOptions = clients.map((client) => {
        const base = {
            value: client.cif,
            label: labelFormat(client),
        };

        // Solo incluir campos solicitados
        fieldsToInclude.forEach((field) => {
            base[field] = client[field] ?? "";
        });

        return base;
    });

    const filterOptions = (option, inputValue) => {
        const searchTerm = inputValue.toLowerCase();
        return fieldsToInclude.some((field) =>
            (option.data[field] || "").toLowerCase().includes(searchTerm)
        );
    };

    const handleSelectClient = (selectedOption) => {
        setSelectedClient(selectedOption);
        if (onSelectClient) {
            onSelectClient(selectedOption); // Devuelves solo lo que incluiste
        }
    };

    const handleClearSelection = () => {
        setSelectedClient(null);
        onSelectClient?.(null);
    };

    return (
        <div className="p-4 w-full">
            <div className="flex items-center w-full">
                <Select
                    options={clientOptions}
                    value={selectedClient}
                    onChange={handleSelectClient}
                    placeholder="Buscar cliente..."
                    isSearchable
                    noOptionsMessage={() => "No hay resultados"}
                    filterOption={filterOptions}
                    className="flex-grow"
                />
                {selectedClient && (
                    <button
                        onClick={handleClearSelection}
                        className="ml-2 p-1 text-gray-500 hover:text-gray-700"
                    >
                        <XMarkIcon className="h-5 w-5" />
                    </button>
                )}
            </div>
        </div>
    );
};


export default ClientSearch;