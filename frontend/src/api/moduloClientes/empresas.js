import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export const getEmpresas = async () => {
    const res = await axios.get(`${API_URL}/empresas`);
    return res.data;
};

export const getEmpresasadeudos = async () => {
  const res = await axios.get(`${API_URL}/empresas/adeudos`);
  return res.data;
};

export const addEmpresas = async (empresa) => {
    const res = await axios.post(`${API_URL}/empresas`, empresa);
    return res.data;
};