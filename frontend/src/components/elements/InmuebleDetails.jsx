import React, { useState, useEffect } from "react";
import { AtSymbolIcon, PhoneIcon, MapPinIcon, IdentificationIcon, BuildingOfficeIcon, InformationCircleIcon } from "@heroicons/react/24/solid";
const API_URL = import.meta.env.VITE_API_URL;

const InmuebleDetails = ({ inmueble }) => {
    const [proveedoresList, setProveedoresList] = useState(null);
    const [segurosList, setSegurosList] = useState(null);

    useEffect(() => {
        if (!inmueble) {return}

        console.log(inmueble)
        const fetchProveedores = async () => {
            const response = await fetch(`${API_URL}/inmueblesProveedores/${inmueble}`)
            const data = await response.json();
            setProveedoresList(data)
        }

        const fetchSeguros = async () => {
            const response = await fetch(`${API_URL}/inmueblesSeguros/${inmueble}`)
            const data = await response.json();
            setSegurosList(data)
        }

        fetchProveedores();
        fetchSeguros();
    }, [inmueble])

    return (
        <div className="relative flex w-[100%] h-full p-2">
            <div className="relative w-full h-full flex flex-col border border-black p-2">
            </div>
        </div>
    );
};

export default InmuebleDetails;