import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export const addHipoteca = async (hipoteca) => {
    const res = await axios.post(`${API_URL}/hipoteca`, hipoteca);
    return res.data;
};

export const getHipotecas = async (cc) => {
    const res = await axios.get(`${API_URL}/hipoteca/list/${cc}`);
    return res.data;
};

export const getHipotecaDetails = async (id) => {
    const res = await axios.get(`${API_URL}/hipoteca/details/${id}`);
    return res.data;
};