import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export const clienteNuevo = async (cliente) => {
    const res = await axios.post(`${API_URL}/cliente`, cliente);
    return res.data;
}

export const updateClient = async (cif, clientData) => {
    try {
        console.log(`Enviando PUT a: ${API_URL}/cliente/${cif}`);
        const res = await axios.put(
            `${API_URL}/cliente/${cif}`,   
            clientData
        );
        console.log("Respuesta del servidor:", res.data);
        return res.data;
    } catch (error) {
        console.error("Error en updateClient:", error);
        throw error;
    }
}

export const getClients = async () => {
    try {
        const res = await axios.get(`${API_URL}/cliente`);
        return res.data;
    } catch (error) {
        console.error("Error en getClients:", error);
        throw error;
    }
}