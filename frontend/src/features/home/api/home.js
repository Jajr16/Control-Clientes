import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export const getDatosHome = async () => {
    const res = await axios.get(`${API_URL}/home`)
    return res.data
}