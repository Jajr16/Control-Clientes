import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export const addSeguro = async (seguro) => {
    const res = await axios.post(`${API_URL}/seguro`, seguro);
    return res.data;
};

export const getSeguros = async (cc) => {
    const res = await axios.get(`${API_URL}/seguro/list/${cc}`);
    return res.data;
};

export const getSeguroDetails = async (id) => {
    const res = await axios.get(`${API_URL}/seguro/details/${id}`);
    return res.data;
};