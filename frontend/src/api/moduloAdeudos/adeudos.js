import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export const getAdeudos = async () => {
    const res = await axios.get(`${API_URL}/adeudos`);
    return res.data;
};

export const addAdeudo = async (adeudo) => {
    const res = await axios.post(`${API_URL}/adeudos`, adeudo);
    return res.data;
};

export const getAdeudoEmpresa = async (empresa) => {
    const res = await axios.get(`${API_URL}/adeudos/empresa/${empresa}`);
    return res.data
}

export const updateAdeudos = async (cambios) => {
    const res = await axios.post(`${API_URL}/adeudos/update`, cambios)
    return res.data
}