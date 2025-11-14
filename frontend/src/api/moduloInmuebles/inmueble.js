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

export const getInmuebleHipotecas = async (cc) => {
    const res = await axios.get(`${API_URL}/inmueble/hipotecas/${cc}`)
    return res.data;
};

// ========== ACTUALIZAR SEGUROS ==========
export const updateSeguro = async (claveCatastral, empresaSeguro, datos) => {
    const res = await axios.put(
        `${API_URL}/inmueble/seguro/${claveCatastral}/${empresaSeguro}`, 
        datos
    );
    return res.data;
};

// ========== ACTUALIZAR PROVEEDORES ==========
export const updateProveedor = async (claveCatastral, nombre, datos) => {
    const res = await axios.put(
        `${API_URL}/inmueble/proveedor/${claveCatastral}/${nombre}`,        
        datos
    );
    return res.data;
};

// ========== ACTUALIZAR HIPOTECAS ==========
export const updateHipoteca = async (claveCatastral, idHipoteca, datos) => {
    const res = await axios.put(
        `${API_URL}/inmueble/hipoteca/${claveCatastral}/${idHipoteca}`,                
        datos
    );
    return res.data;
};

// ========== ACTUALIZAR DATOS REGISTRALES ==========
export const updateDatosRegistrales = async (claveCatastral, datos) => {
    const res = await axios.put(
        `${API_URL}/inmueble/datosRegistrales/${claveCatastral}`,   
        datos
    );
    return res.data;
};

// ========== ACTUALIZAR INMUEBLE ==========
export const updateInmueble = async (claveCatastral, datos) => {
    const res = await axios.put(
        `${API_URL}/inmueble/${claveCatastral}`,   
        datos
    );
    return res.data;
};

// ========== ELIMINAR INMUEBLE ==========
export const deleteInmueble = async (claveCatastral) => {
    const res = await axios.delete(`${API_URL}/inmueble/${claveCatastral}`);
    return res.data;
};

// ========== ELIMINAR SEGURO ==========
export const deleteSeguro = async (claveCatastral, empresaSeguro) => {
    const res = await axios.delete(`${API_URL}/inmueble/seguro/${claveCatastral}/${empresaSeguro}`);
    return res.data;
};

// ========== ELIMINAR PROVEEDOR ==========
export const deleteProveedor = async (claveCatastral, claveProveedor) => {
    const res = await axios.delete(`${API_URL}/inmueble/proveedor/${claveCatastral}/${claveProveedor}`);
    return res.data;
};

// ========== ELIMINAR HIPOTECA ==========
export const deleteHipoteca = async (claveCatastral, idHipoteca) => {
    const res = await axios.delete(`${API_URL}/inmueble/hipoteca/${claveCatastral}/${idHipoteca}`);
    return res.data;
};
