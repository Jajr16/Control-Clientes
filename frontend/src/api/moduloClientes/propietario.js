import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export const getPropietario = async () => {
    const res = await axios.get(`${API_URL}/propietario`);
    return res.data;
};

export const addPropietario = async (propietario) => {
    const res = await axios.post(`${API_URL}/propietario`, propietario);
    return res.data;
};
