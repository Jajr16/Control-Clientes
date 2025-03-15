import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export const getClientes = async () => {
    const res = await axios.get(`${API_URL}/clientes`);
    return res.data;
};

export const addCliente = async (cliente) => {
    const res = await axios.post(`${API_URL}/clientes`, cliente);
    return res.data;
};
