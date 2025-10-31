// hooks/useAnticipoManager.js
import { useState, useEffect } from 'react';
import { updateAdeudos } from '../api/moduloAdeudos/adeudos';

export const useAnticipoManager = () => {
    const [anticipoActual, setAnticipoActual] = useState("");
    const [anticipoOriginal, setAnticipoOriginal] = useState("");
    const [hasAnticipoChanged, setHasAnticipoChanged] = useState(false);

    // Verificar cambios en el anticipo
    useEffect(() => {
        const changed = anticipoActual !== anticipoOriginal;
        setHasAnticipoChanged(changed);
    }, [anticipoActual, anticipoOriginal]);

    // Inicializar anticipo
    const initializeAnticipo = (anticipoValue) => {
        const valor = anticipoValue?.anticipo ?? anticipoValue ?? 0;
        const valorString = valor.toString();
        setAnticipoActual(valorString);
        setAnticipoOriginal(valorString);
        setHasAnticipoChanged(false);
    };

    // Manejar cambio de anticipo
    const handleAnticipoChange = (value) => {
        setAnticipoActual(value);
    };

    // Guardar anticipo
    const saveAnticipo = async (cif, updateApiCall = updateAdeudos) => {
        if (!hasAnticipoChanged) {
            return { success: false, message: "No hay cambios en el anticipo" };
        }

        try {
            const payload = {
                empresa_cif: cif,
                anticipo_unico: anticipoActual === "" || anticipoActual === "0" 
                    ? null 
                    : parseFloat(anticipoActual)
            };

            console.log("Guardando anticipo:", payload);

            const response = await updateApiCall(payload);
            
            if (!response.success) {
                return { success: false, message: response.error || "Error al guardar el anticipo" };
            }

            // Actualizar el valor original después de guardar exitosamente
            setAnticipoOriginal(anticipoActual);
            setHasAnticipoChanged(false);

            return { success: true, message: "Anticipo guardado exitosamente" };
        } catch (error) {
            console.error("Error al guardar anticipo:", error);
            return { success: false, message: "Error al guardar el anticipo" };
        }
    };

    // Cancelar cambios del anticipo
    const cancelAnticipoChanges = () => {
        setAnticipoActual(anticipoOriginal);
        setHasAnticipoChanged(false);
    };

    // Resetear estado del anticipo
    const resetAnticipo = () => {
        setAnticipoActual("");
        setAnticipoOriginal("");
        setHasAnticipoChanged(false);
    };

    return {
        // Estados
        anticipoActual,
        anticipoOriginal,
        hasAnticipoChanged,

        // Funciones
        initializeAnticipo,
        handleAnticipoChange,
        saveAnticipo,
        cancelAnticipoChanges,
        resetAnticipo
    };
};