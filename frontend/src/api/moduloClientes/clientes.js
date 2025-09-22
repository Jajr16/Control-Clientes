import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

// Nueva función para crear un cliente completo en una sola petición
export const addCliente = async (cliente) => {
  try {
    const res = await axios.post(`${API_URL}/clientes`, cliente);
    return res.data;
  } catch (error) {
    console.error("Error al crear cliente:", error);
    throw error;
  }
};

// Obtener cliente por CIF (ajusta según tu backend)
export const getClienteByCif = async (cif) => {
  try {
    const res = await axios.get(`${API_URL}/clientes/${cif}`);
    return res.data;
  } catch (error) {
    console.error("Error al obtener cliente:", error);
    throw error;
  }
};

// Puedes agregar aquí más funciones si tu backend las soporta, por ejemplo, listar todos los clientes:
export const getClientes = async () => {
  try {
    const res = await axios.get(`${API_URL}/clientes`);
    return res.data;
  } catch (error) {
    console.error("Error al obtener clientes:", error);
    throw error;
  }
};