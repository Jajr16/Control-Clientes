import React, { createContext } from "react";
import ClienteLayout from "../components/layout/ClienteLayout";
import { useClientesPage } from "../hooks/useClientesPage";

export const inmuebleContext = createContext();

const ClientePage = () => {
    const controller = useClientesPage();

    return (
        <inmuebleContext.Provider value={controller}>
            <ClienteLayout />
        </inmuebleContext.Provider>
    )
};

export default ClientePage;