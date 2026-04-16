import { useEffect, useState, useCallback } from "react";
import { getInmuebles, deleteInmueble, updateInmueble } from "../api/inmueble";
import { useMutation } from "../../../hooks/useMutation";
import Swal from "sweetalert2";

export const useInmuebles = (selectedClient) => {

    const [inmueblesList, setInmueblesList] = useState([]);
    const [selectedInmueble, setSelectedInmueble] = useState(null);

    const { mutate, loading } = useMutation();

    const fetchInmuebles = useCallback(async () => {

        if (!selectedClient) {
            setInmueblesList([]);
            return;
        }

        await mutate(getInmuebles, {
            data: selectedClient.cif,
            onSuccess: (data) => setInmueblesList(data),
            onError: (error) => {
                console.error("Error fetching inmuebles:", error);
                setInmueblesList([]);
            }
        })
    }, [selectedClient, mutate]);

    useEffect(() => {
        setSelectedInmueble(null);
        fetchInmuebles();
    }, [selectedClient]);

    const handleDeleteInmueble = async (clave_catastral) => {
        const result = await Swal.fire({
            title: "¿Eliminar inmueble?",
            text: `Esta acción eliminará permanentemente todos los datos del inmueble, incluyendo seguros, proveedores e hipotecas asociadas.
                \n\nEsta acción no se puede deshacer.`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar",
            reverseButtons: true
        })

        if (!result.isConfirmed) return;

        mutate(deleteInmueble, {
            data: clave_catastral,
            onSuccess: async () => {
                await fetchInmuebles();

                if (selectedInmueble?.clave_catastral === clave_catastral) {
                    setSelectedInmueble(null);
                }

                Swal.fire({
                    icon: "success",
                    title: "Inmueble creado",
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
            }
        })
    }

    const handleEditInmueble = async (clave_catastral, updatedData) => {
        await mutate(() => updateInmueble(clave_catastral, updatedData), {
            onSuccess: async () => {
                await fetchInmuebles();

                setSelectedInmueble(prev =>
                    prev?.clave_catastral === clave_catastral
                        ? { ...prev, ...updatedData }
                        : prev
                );

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
                    text: error.response?.data?.message || "No se pudo actualizar el inmueble."
                })
            }
        })
    }

    return {
        inmueblesList,
        selectedInmueble,
        setSelectedInmueble,
        loading,
        fetchInmuebles,
        handleDeleteInmueble,
        handleEditInmueble
    };
}