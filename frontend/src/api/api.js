import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export const getEmpresas = async () => {
    const res = await axios.get(`${API_URL}/empresas`);
    return res.data;
};

export const addEmpresas = async (empresa) => {
    const res = await axios.post(`${API_URL}/empresas`, empresa);
    return res.data;
};

export const getDirecciones = async () => {
    const res = await axios.get(`${API_URL}/direcciones`);
    return res.data;
};

export const addDirecciones = async (direccion) => {
    const res = await axios.post(`${API_URL}/direcciones`, direccion);
    return res.data;
};

export const getPropietario = async () => {
    const res = await axios.get(`${API_URL}/propietario`);
    return res.data;
};

export const addPropietario = async (propietario) => {
    const res = await axios.post(`${API_URL}/propietario`, propietario);
    return res.data;
};


export const getDatoRegistral = async () => {
    const res = await axios.get(`${API_URL}/datoRegistral`);
    return res.data;
};

export const addDatoRegistral = async (dato_registral) => {
    const res = await axios.post(`${API_URL}/datoRegistral`, dato_registral);
    return res.data;
};