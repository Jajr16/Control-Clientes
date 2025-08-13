import React, { useEffect, useState } from "react";
import ClientSearch from "../../components/elements/searchBar";
import { getAdeudoEmpresa } from "../../api/moduloAdeudos/adeudos"

const historico = () => {
    const [selectedClient, setSelectedClient] = useState(null);
    const [originalRows, setOriginalRows] = useState([]);
    const [editedRows, setEditedRows] = useState([]);


    useEffect(() => {
        const cleanup = () => {
            setOriginalRows(null);
            setEditedRows(null);
        };

        if (!selectedClient) {
            cleanup();
            return;
        }

        const fetchGetHistorico = async() => {
            try {
                const response = await getAdeudoEmpresa(selectedClient.cif)
                setOriginalRows(response.data)
            } catch (error) {
                console.error("Error fetching historico adeudos:", error);
                cleanup();
            }
        };

        fetchGetHistorico();
        cleanup();
    })

    return (
        <div className="w-full h-full">
            <div className="flex justify-between">
                <div className="flex w-[40%] ">
                    <ClientSearch
                        onSelectClient={(c) => setSelectedClient(c)}
                        routeName={'adeudos/empresa_adeudo'}
                        labelFormat={(c) => `${c.clave} - ${c.nombre}`}
                    />
                </div>
                <div className="flex items-center mr-10">
                    <label htmlFor="anticipo" className="font-bold mr-2">Anticipo único:</label>
                    <input id="anticipo" type="text" className="border border-black rounded-md"></input>
                </div>
            </div>

            {selectedClient && 
                <div className="w-full h-full">
                    Adeudos a Finatech desde 
                </div>
            }
        </div>
    )
}

export default historico;