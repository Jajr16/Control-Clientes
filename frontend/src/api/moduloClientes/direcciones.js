import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export const getDirecciones = async () => {
    const res = await axios.get(`${API_URL}/direcciones`);
    return res.data;
};

export const addDirecciones = async (direccion) => {
    const res = await axios.post(`${API_URL}/direcciones`, direccion);
    return res.data;
};
