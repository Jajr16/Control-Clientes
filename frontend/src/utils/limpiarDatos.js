// Función para limpiar objetos vacíos y arrays vacíos
const limpiarDatosVacios = (obj) => {
    if (Array.isArray(obj)) {
        // Si es un array, filtra elementos vacíos y limpia cada elemento
        const arrayLimpio = obj
            .map(item => limpiarDatosVacios(item))
            .filter(item => {
                if (item === null || item === undefined) return false;
                if (typeof item === 'object' && Object.keys(item).length === 0) return false;
                return true;
            });
        return arrayLimpio.length > 0 ? arrayLimpio : undefined;
    }
    
    if (obj !== null && typeof obj === 'object') {
        // Si es un objeto, limpia cada propiedad
        const objLimpio = {};
        for (const [key, value] of Object.entries(obj)) {
            // Ignora la propiedad 'id' que es solo para React
            if (key === 'id') continue;
            
            const valorLimpio = limpiarDatosVacios(value);
            
            // Solo agrega la propiedad si tiene valor
            if (valorLimpio !== undefined && valorLimpio !== '' && valorLimpio !== null) {
                objLimpio[key] = valorLimpio;
            }
        }
        return Object.keys(objLimpio).length > 0 ? objLimpio : undefined;
    }
    
    // Si es un valor primitivo, retornarlo si no está vacío
    return (obj === '' || obj === null || obj === undefined) ? undefined : obj;
};

export { limpiarDatosVacios };