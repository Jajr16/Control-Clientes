import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export const clienteNuevo = async (cliente) => {
    const res = await axios.post(`${API_URL}/cliente`, cliente);
    return res.data;
}