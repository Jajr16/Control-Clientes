import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export const addProveedor = async (proveedor) => {
    const res = await axios.post(`${API_URL}/proveedor`, proveedor);
    return res.data;
};

export const getProveedores = async (cif) => {
    const res = await axios.get(`${API_URL}/proveedor/list/${cif}`);
    return res.data;
};

export const getProveedorDetails = async (id) => {
    const res = await axios.get(`${API_URL}/proveedor/details/${id}`);
    return res.data;
};