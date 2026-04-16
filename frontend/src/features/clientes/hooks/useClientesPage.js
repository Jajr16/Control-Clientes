import { useEffect } from "react";
import Swal from "sweetalert2";
import { useCliente } from "./useCliente";
import { useInmuebles } from "../../inmuebles/hooks/useInmueble";
import { useInmuebleDetails } from "../../inmuebles/hooks/useInmuebleDetails";

export const useClientesPage = () => {

    const cliente = useCliente();
    const inmuebles = useInmuebles(cliente.selectedClient);
    const inmuebleDetails = useInmuebleDetails(inmuebles.selectedInmueble);

    useEffect(() => {
        cliente.fetchClients()
    }, [])

    const canProgress = async () => {
        if (!inmuebleDetails.isEditing) return true;

        const result = await Swal.fire({
            title: "¿Hay cambios sin guardar?",
            text: "Si continúas, perderás los cambios realizados en el inmueble actual.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, descartar y continuar",
            cancelButtonText: "Cancelar",
            reverseButtons: true
        });

        if (result.isConfirmed) {
            inmuebleDetails.setIsEditing(false);
            return true;
        }
        return false;
    }

    const handleSelectClient = async (client) => {
        if (await canProgress()) {
            cliente.setSelectedClient(client);
            inmuebles.setSelectedInmueble(null);
            inmuebleDetails.setProveedoresSegurosList(null);
            inmuebleDetails.setHipoteca({})
        }
    }

    const handleSelectInmueble = async (inmueble) => {
        if (await canProgress()) {
            inmuebles.setSelectedInmueble(inmueble);
        }
    }

    const handleInmuebleAgregado = async () => {
        await inmuebles.fetchInmuebles();
    }

    const handleEditChangeInmueble = (isEditing) => {
        inmuebleDetails.setIsEditing(isEditing);
    }

    return {
        cliente,
        inmuebles,
        inmuebleDetails,

        handleSelectClient,
        handleSelectInmueble,
        handleInmuebleAgregado,
        handleEditChangeInmueble
    }
}