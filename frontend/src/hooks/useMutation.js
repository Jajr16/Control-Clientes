import { useState } from "react";

export const useMutation = () => {
    const [loading, setLoading] = useState(false);

    const mutate = async (apiCall, options = {}) => {
        const {
            data,
            onSuccess,
            onError
        } = options;

        try {
            setLoading(true);
            const response = data ? await apiCall(data) : await apiCall();

            onSuccess?.(response.data);

            return response.data;
        } catch (error) {
            onError?.(error)

            throw error;
        } finally {
            setLoading(false);
        }
    };

    return { mutate, loading };
};