import { useState } from "react";

export default function useSeccionesAbiertas(defaultIds = []) {
    const [seccionesAbiertas, setSeccionesAbiertas] = useState(new Set(defaultIds));

    const toggleSeccion = (id) => {
        const nuevas = new Set(seccionesAbiertas);
        if (nuevas.has(id)) nuevas.delete(id);
        else nuevas.add(id);
        setSeccionesAbiertas(nuevas);
    };

    return { seccionesAbiertas, toggleSeccion };
}