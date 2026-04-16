import { useState, useCallback } from "react";
import { useMutation } from "../../../hooks/useMutation";
import { getClients, updateClient } from "../api/clientes";
import Swal from "sweetalert2";

export const useCliente = () => {
    const [clients, setClients] = useState([]);
    const [selectedClient, setSelectedClient] = useState(null);

    const { mutate, loading } = useMutation();

    const fetchClients = async () => {
        await mutate(getClients, {
            onSuccess: (data) => {
                setClients(data);
            },
            onError: (error) => {
                console.error("Error obteniendo clientes:", error);
            }
        })
    }

    const handleUpdateClient = async (cif, data) => {
        if (!data) return;

        await mutate(() => updateClient(cif, data), {
            onSuccess: async (response) => {
                const updatedData = response?.data || { ...selectedClient, ...data };

                setClients(prevClient => prevClient.map(client => client.cif === cif ? updatedData : client))
                setSelectedClient(updatedData)

                Swal.fire({
                    icon: "success",
                    title: "Inmueble actualizado",
                    timer: 1500,
                    showConfirmButton: false
                })
            },
            onError: (error) => {                
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: error.response?.data?.message || "No se pudo eliminar el inmueble."
                })
                throw error;
            }
        })
    }

    return {
        clients,
        selectedClient,
        setSelectedClient,
        fetchClients,
        handleUpdateClient
    };
}