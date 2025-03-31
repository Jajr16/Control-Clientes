import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export const addInmueble = async (inmueble) => {
    const res = await axios.post(`${API_URL}/inmueble`, inmueble);
    return res.data;
}

export const getInmuebles = async (cif) => {
    const res = await axios.get(`${API_URL}/inmueble/inmueblesList/${cif}`);
    return res.data;
};

export const getInmuebleDetails = async (cc) => {
    const res = await axios.get(`${API_URL}/inmueble/inmueblesProveedoresSeguros/${cc}`);
    return res.data;
};