import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export const getInmuebles = async (cif) => {
    const res = await axios.get(`${API_URL}/inmueble/inmueblesList/${cif}`);
    return res.data;
};

export const getInmuebleDetails = async (cc) => {
    const res = await axios.get(`${API_URL}/inmueble/inmueblesProveedoresSeguros/${cc}`);
    return res.data;
};

export const getInmuebleHipotecas = async (cc) => {
    const res = await axios.get(`${API_URL}/inmueble/hipotecas/${cc}`)
    return res.data;
}