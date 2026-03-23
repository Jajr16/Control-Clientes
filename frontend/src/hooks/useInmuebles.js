import { useEffect, useState } from "react";
import { getInmuebles, deleteInmueble, updateInmueble } from "../../api/moduloInmuebles/inmueble";
import { useMutation } from "./useMutation";

export const useInmuebles = (selectedClient) => {
    const [inmueblesList, setInmueblesList] = useState(null);
    const [selectedInmueble, setSelectedInmueble] = useState(null);
    const { mutate, loading } = useMutation();

    const fetchInmuebles = async () => {
        try {
            setLoading(true);
            const response = await getInmuebles(selectedClient.cif);
            setInmueblesList(response.data);
        } catch (error) {
            console.error("Error fetching inmuebles:", error);
            cleanup();
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setSelectedInmueble(null);

        if (!selectedClient) {
            setInmueblesList(null)
            return;
        }

        fetchInmuebles();
    }, [selectedClient])

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
            onSucess: async () => {
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
        mutate((data) => updateInmueble(data.clave_catastral, data.updatedData), {
            data: {
                clave_catastral, updatedData
            },
            onSuccess: async () => {
                await fetchInmuebles();

                if (selectedInmueble?.clave_catastral === clave_catastral) {
                    setSelectedInmueble({ ...selectedInmueble, ...updatedData });
                }

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
}