import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export const getDatoRegistral = async () => {
    const res = await axios.get(`${API_URL}/datoRegistral`);
    return res.data;
};

export const addDatoRegistral = async (dato_registral) => {
    const res = await axios.post(`${API_URL}/datoRegistral`, dato_registral);
    return res.data;
};