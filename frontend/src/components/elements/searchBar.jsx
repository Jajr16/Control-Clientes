import React, { useState, useEffect } from "react";
import Select from "react-select";
import { XMarkIcon } from "@heroicons/react/24/solid";
const API_URL = import.meta.env.VITE_API_URL;

const ClientSearch = ({ onSelectClient, className }) => {
    const [clients, setClients] = useState([]);
    const [selectedClient, setSelectedClient ] = useState(null)

    useEffect(() => {
        const fetchClients = async () => {
            const response = await fetch(`${API_URL}/searchClients`)
            const data = await response.json()
            setClients(data)
        }

        fetchClients()
    }, [])

    // Formatear los clientes para React Select
    const clientOptions = clients.map((client) => ({
        value: client.cif,
        label: `${client.clave} - ${client.nombre}`,
        clave: client.clave || "", 
        cif: client.cif || "",
        nombre: client.nombre || "", 
        propietario: client.propietario || "", 
        telefono: String(client.telefono) || "", 
        calle: client.calle || "", 
        numero: String(client.numero) || "", 
        piso: String(client.piso) || "", 
        codigo_postal: String(client.codigo_postal) || "",
        localidad: client.localidad || "",
        num_protocolo: String(client.num_protocolo) || "",
        folio: String(client.folio) || "",
        hoja: String(client.hoja) || "",
        inscripcion: String(client.inscripcion) || "",
        notario: client.notario || "",
        fecha_inscripcion: new Date(client.fecha_inscripcion).toISOString().split('T')[0] || "",
    }));

    const filterOptions = (option, inputValue) => {
        const searchTerm = inputValue.toLowerCase();

        return (
            option.data.clave.toLowerCase().includes(searchTerm) ||
            option.data.cif.toLowerCase().includes(searchTerm) ||
            option.data.nombre.toLowerCase().includes(searchTerm) ||
            option.data.propietario.toLowerCase().includes(searchTerm) ||
            option.data.telefono.toLowerCase().includes(searchTerm) ||
            option.data.calle.toLowerCase().includes(searchTerm) ||
            option.data.numero.toLowerCase().includes(searchTerm) ||
            option.data.piso.toLowerCase().includes(searchTerm) ||
            option.data.codigo_postal.toLowerCase().includes(searchTerm) ||
            option.data.localidad.toLowerCase().includes(searchTerm) ||
            option.data.num_protocolo.toLowerCase().includes(searchTerm) ||
            option.data.folio.toLowerCase().includes(searchTerm) ||
            option.data.hoja.toLowerCase().includes(searchTerm) ||
            option.data.inscripcion.toLowerCase().includes(searchTerm) ||
            option.data.notario.toLowerCase().includes(searchTerm) ||
            option.data.fecha_inscripcion.toLowerCase().includes(searchTerm)
        );
    }

    // Maneja la selección de un cliente
    const handleSelectClient = (selectedOption) => {
        setSelectedClient(selectedOption);
        if (selectedOption) {
            const client = clients.find((c) => c.cif === selectedOption.value);
            onSelectClient(client); // Llama a la función para seleccionar un cliente
        }
    };

    const handleClearSelection = () => {
        setSelectedClient(null); // Restablecer el estado
        if (onSelectClient) {
            onSelectClient(null); // Notificar al componente padre
        }
    };

    return (
        <div className='p-4 w-full'>
            <div className={`flex items-center w-full`}>
                <Select
                    options={clientOptions}
                    value={selectedClient}
                    onChange={handleSelectClient}
                    placeholder="Buscar cliente..."
                    isSearchable // Habilita la búsqueda
                    noOptionsMessage={() => "No hay resultados"} // Mensaje cuando no hay coincidencias
                    filterOption={filterOptions} // Usa la función personalizada para filtrar
                    className="flex-grow" // Ocupa el espacio disponible
                />
                
                {selectedClient && (
                    <button
                        onClick={handleClearSelection}
                        className="ml-2 p-1 text-gray-500 hover:text-gray-700 focus:outline-none"
                    >
                        <XMarkIcon className="h-5 w-5" /> {/* Ícono de "tache" */}
                    </button>
                )}
            </div>
        </div>
    );
}

export default ClientSearch;