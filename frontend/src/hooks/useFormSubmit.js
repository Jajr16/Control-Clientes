import { useState } from "react";
import Swal from "sweetalert2";
import { setBackendErrors } from "../utils/setBackendErrors";

export const useFormSubmit = () => {
    const [loading, setLoading] = useState(false);

    const submit = async ({ apiCall, data, setError, successMessage, reload = false }) => {
        setLoading(true);

        try {
            const response = await apiCall(data);

            if (successMessage) {
                await Swal.fire({
                    icon: "success",
                    title: successMessage,
                    timer: 2000,
                    showConfirmButton: false
                });

                if (reload) {
                    window.location.reload();
                }
            }

            return response.data;

        } catch (error) {
            const datosError = error.response?.data;

            if (datosError?.error === "VALIDATION_ERROR" && setError) {
                setBackendErrors(datosError.fields, setError);
                return null;
            }

            Swal.fire({
                icon: "error",
                title: "Error",
                text: datosError?.message || "Ocurrió un error"
            });

            throw error;
        } finally {
            setLoading(false);
        }
    };

    return { submit, loading };
};