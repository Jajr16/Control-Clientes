import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

import { 
  addEmpresas,
  getEmpresas 
} from './empresas.js';
import { 
  addDirecciones,
  getDirecciones 
} from './direcciones.js';
import { 
  addPropietario,
  getPropietario 
} from './propietario.js';
import { 
  addDatoRegistral,
  getDatoRegistral 
} from './datoRegistral.js';

export const crearClienteCompleto = async (cliente) => {
  try {
    // 1. Insertar dirección
    const direccion = await addDirecciones(cliente.direccion);
    
    // 2. Insertar dato registral
    const datoRegistral = await addDatoRegistral(cliente.datoRegistral);
    
    // 3. Insertar propietario
    const propietario = await addPropietario(cliente.propietario);
    
    // 4. Insertar empresa con las referencias
    const empresa = await addEmpresas({
      ...cliente.empresa,
      direccion: direccion.id,
      dato_registral: datoRegistral.id_dr,
      propietario: propietario.nie
    });
    
    return {
      empresa,
      propietario,
      direccion,
      datoRegistral
    };
  } catch (error) {
    console.error("Error al crear cliente completo:", error);
    throw error;
  }
};

export const obtenerClienteCompleto = async (cif) => {
  try {
    const empresa = await getEmpresas(cif);
    const propietario = await getPropietario(empresa.propietario);
    const direccion = await getDirecciones(empresa.direccion);
    const datoRegistral = await getDatoRegistral(empresa.dato_registral);
    
    return {
      empresa,
      propietario,
      direccion,
      datoRegistral
    };
  } catch (error) {
    console.error("Error al obtener cliente completo:", error);
    throw error;
  }
};