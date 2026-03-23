import Swal from "sweetalert2";
import { useMutation } from "./useMutation";
import { setBackendErrors } from "../utils/setBackendErrors";

export const useFormSubmit = () => {

    const { mutate, loading } = useMutation();

    const submit = async ({
        apiCall,
        data,
        setError,
        successMessage = "Operación realizada correctamente",
        showSuccess = true,
        reload = false,
        onSuccess
    }) => {

        return mutate(apiCall, {
            data,
            onSuccess: async (responseData) => {

                if (showSuccess) {
                    await Swal.fire({
                        icon: "success",
                        title: successMessage,
                        // timer: 2000,
                        // showConfirmButton: false
                    });
                }

                if (reload) {
                    window.location.reload();
                }

                if (onSuccess) {
                    onSuccess(responseData);
                }
            },
            onError: (error) => {
                const datosError = error.response?.data;
                if (datosError?.error === "VALIDATION_ERROR" && setError) {
                    console.log(datosError)
                    setBackendErrors(datosError.fields, setError);
                    return;
                }

                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: datosError?.message || "Ocurrió un error"
                });
            }
        });
    };

    return { submit, loading };
};