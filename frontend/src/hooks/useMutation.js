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
            const response = await apiCall(data);

            if (onSuccess) {
                onSuccess(response.data);
            }

            return response.data;
        } catch (error) {
            if (onError) {
                onError(error);
            } else {
                console.error("Mutation error:", error);
            }
            throw error;
        } finally {
            setLoading(false);
        }
    };

    return { mutate, loading };
};