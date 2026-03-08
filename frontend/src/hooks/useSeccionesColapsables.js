import { useState, useCallback } from "react";

export default function useSeccionesColapsables(initial = {}) {
    const [seccionesAbiertas, setSeccionesAbiertas] = useState(initial);

    const toggleSeccion = useCallback((nombre) => {
        setSeccionesAbiertas(prev => ({
            ...prev,
            [nombre]: !prev[nombre]
        }))
    }, [])

    return { seccionesAbiertas, toggleSeccion };
}