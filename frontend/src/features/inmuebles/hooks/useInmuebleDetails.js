import { useEffect, useState } from 'react'

export const useInmuebleDetails = (inmueble) => {
    const [proveedoresSegurosList, setProveedoresSegurosList] = useState(null);
    const [hipoteca, setHipoteca] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        setProveedoresSegurosList(null);
        setHipoteca({});
    }, [inmueble]);

    return {
        proveedoresSegurosList, setProveedoresSegurosList,
        hipoteca, setHipoteca,
        isEditing, setIsEditing
    }
}