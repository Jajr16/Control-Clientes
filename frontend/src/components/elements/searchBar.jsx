import React, { useState, useEffect } from "react";
import Select from "react-select";
import { XMarkIcon, PencilIcon } from "@heroicons/react/24/solid";
import { updateClient, getClients } from "../../api/moduloClientes/clientes";

const API_URL = import.meta.env.VITE_API_URL;

const ClientSearch = ({
    onSelectClient,
    routeName,
    fieldsToInclude = ["cif", "nombre", "clave"],
    labelFormat = (client) => `${client.clave} - ${client.nombre}`,
}) => {
    const [clients, setClients] = useState([]);
    const [selectedClient, setSelectedClient] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editFormData, setEditFormData] = useState({});

    useEffect(() => {
        const fetchClients = async () => {
            try {
                const response = await getClients();
                setClients(response.data);
            } catch (error) {
                console.error("Error fetching clients:", error);
            }
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
            (option.data[field] || "").toString().toLowerCase().includes(searchTerm)
        );
    };

    const handleSelectClient = (selectedOption) => {
        setSelectedClient(selectedOption);
        if (onSelectClient) {
            onSelectClient(selectedOption);
        }
    };

    const handleClearSelection = () => {
        setSelectedClient(null);
        onSelectClient?.(null);
    };

    const handleEditClick = () => {
        if (selectedClient) {
            setEditFormData({ ...selectedClient });
            setIsEditModalOpen(true);
        }
    };

    const handleSaveEdit = async () => {
    try {
        console.log("Datos a enviar:", editFormData);
        
        const cifViejo = selectedClient.cif; // A52438818
        const cifNuevo = editFormData.cif;   // A52438880
        
        await updateClient(cifViejo, editFormData);
        
        const response = await fetch(`${API_URL}/${routeName}`);
        const data = await response.json();
        setClients(data.data);
        
        if (cifViejo !== cifNuevo) {
            const clienteActualizado = data.data.find(client => client.cif === cifNuevo);
            setSelectedClient(clienteActualizado || editFormData);
            onSelectClient?.(clienteActualizado || editFormData);
        } else {
            setSelectedClient(editFormData);
            onSelectClient?.(editFormData);
        }
        
        alert('Cliente actualizado correctamente');
        setIsEditModalOpen(false);
    } catch (error) {
        console.error("Error al actualizar cliente:", error);
        alert('Error al actualizar el cliente: ' + (error.response?.data?.message || error.message));
    }
};

    const handleCancelEdit = () => {
        setIsEditModalOpen(false);
        setEditFormData({});
    };

    const handleInputChange = (e, field) => {
        const value = e.target.value;
        setEditFormData(prev => ({
            ...prev,
            [field]: value
        }));
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
                    <div className="flex space-x-1 ml-2">
                        <button
                            onClick={handleEditClick}
                            className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-100 rounded transition-colors duration-200"
                            title="Editar cliente"
                        >
                            <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                            onClick={handleClearSelection}
                            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors duration-200"
                        >
                            <XMarkIcon className="h-5 w-5" />
                        </button>
                    </div>
                )}
            </div>

            {/* Modal de edición */}
            {isEditModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold mb-4">Editar Cliente</h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            {/* Información básica */}
                            <div className="space-y-3">
                                <h3 className="font-semibold text-lg border-b pb-2">Información Básica</h3>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">CIF</label>
                                    <input
                                        type="text"
                                        value={editFormData.cif || ''}
                                        onChange={(e) => handleInputChange(e, 'cif')}
                                        className="w-full p-2 border border-gray-300 rounded"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                                    <input
                                        type="text"
                                        value={editFormData.nombre || ''}
                                        onChange={(e) => handleInputChange(e, 'nombre')}
                                        className="w-full p-2 border border-gray-300 rounded"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Clave</label>
                                    <input
                                        type="text"
                                        value={editFormData.clave || ''}
                                        onChange={(e) => handleInputChange(e, 'clave')}
                                        className="w-full p-2 border border-gray-300 rounded"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">NIE</label>
                                    <input
                                        type="text"
                                        value={editFormData.nie || ''}
                                        onChange={(e) => handleInputChange(e, 'nie')}
                                        className="w-full p-2 border border-gray-300 rounded"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Propietario</label>
                                    <input
                                        type="text"
                                        value={editFormData.propietario || ''}
                                        onChange={(e) => handleInputChange(e, 'propietario')}
                                        className="w-full p-2 border border-gray-300 rounded"
                                    />
                                </div>
                            </div>

                            {/* Contacto y Dirección */}
                            <div className="space-y-3">
                                <h3 className="font-semibold text-lg border-b pb-2">Contacto</h3>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                                    <input
                                        type="text"
                                        value={editFormData.telefono || ''}
                                        onChange={(e) => handleInputChange(e, 'telefono')}
                                        className="w-full p-2 border border-gray-300 rounded"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input
                                        type="email"
                                        value={editFormData.email || ''}
                                        onChange={(e) => handleInputChange(e, 'email')}
                                        className="w-full p-2 border border-gray-300 rounded"
                                    />
                                </div>

                                <h3 className="font-semibold text-lg border-b pb-2 mt-4">Dirección</h3>
                                
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Calle</label>
                                        <input
                                            type="text"
                                            value={editFormData.calle || ''}
                                            onChange={(e) => handleInputChange(e, 'calle')}
                                            className="w-full p-2 border border-gray-300 rounded"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Número</label>
                                        <input
                                            type="text"
                                            value={editFormData.numero || ''}
                                            onChange={(e) => handleInputChange(e, 'numero')}
                                            className="w-full p-2 border border-gray-300 rounded"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Piso</label>
                                        <input
                                            type="text"
                                            value={editFormData.piso || ''}
                                            onChange={(e) => handleInputChange(e, 'piso')}
                                            className="w-full p-2 border border-gray-300 rounded"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Código Postal</label>
                                        <input
                                            type="text"
                                            value={editFormData.codigo_postal || ''}
                                            onChange={(e) => handleInputChange(e, 'codigo_postal')}
                                            className="w-full p-2 border border-gray-300 rounded"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Localidad</label>
                                    <input
                                        type="text"
                                        value={editFormData.localidad || ''}
                                        onChange={(e) => handleInputChange(e, 'localidad')}
                                        className="w-full p-2 border border-gray-300 rounded"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Datos Registrales */}
                        <div className="mb-6">
                            <h3 className="font-semibold text-lg border-b pb-2 mb-3">Datos Registrales</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">No. Protocolo</label>
                                    <input
                                        type="text"
                                        value={editFormData.num_protocolo || ''}
                                        onChange={(e) => handleInputChange(e, 'num_protocolo')}
                                        className="w-full p-2 border border-gray-300 rounded"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Folio</label>
                                    <input
                                        type="text"
                                        value={editFormData.folio || ''}
                                        onChange={(e) => handleInputChange(e, 'folio')}
                                        className="w-full p-2 border border-gray-300 rounded"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Hoja</label>
                                    <input
                                        type="text"
                                        value={editFormData.hoja || ''}
                                        onChange={(e) => handleInputChange(e, 'hoja')}
                                        className="w-full p-2 border border-gray-300 rounded"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Inscripción</label>
                                    <input
                                        type="text"
                                        value={editFormData.inscripcion || ''}
                                        onChange={(e) => handleInputChange(e, 'inscripcion')}
                                        className="w-full p-2 border border-gray-300 rounded"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Notario</label>
                                    <input
                                        type="text"
                                        value={editFormData.notario || ''}
                                        onChange={(e) => handleInputChange(e, 'notario')}
                                        className="w-full p-2 border border-gray-300 rounded"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Inscripción</label>
                                    <input
                                        type="date"
                                        value={editFormData.fecha_inscripcion ? new Date(editFormData.fecha_inscripcion).toISOString().split('T')[0] : ''}
                                        onChange={(e) => handleInputChange(e, 'fecha_inscripcion')}
                                        className="w-full p-2 border border-gray-300 rounded"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Botones de acción */}
                        <div className="flex justify-end space-x-3 pt-4 border-t">
                            <button
                                onClick={handleCancelEdit}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSaveEdit}
                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                            >
                                Guardar Cambios
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClientSearch;