import React, { useEffect, useState } from "react";
import ClientSearch from "../../components/elements/searchBar";
import { getEmpresas } from "../../api/moduloClientes/empresas"

const historico = () => {
    const [selectedClient, setSelectedClient] = useState(null);
    const [originalRows, setOriginalRows] = useState([]);
    const [editedRows, setEditedRows] = useState([]);


    useEffect(() => {
        const fetchGetHistorico = async() => {
            try {
                const response = await getAdeudoEmpresa(selectedClient.cif)
            } catch (error) {
                
            }
        }
    })

    return (
        <div className="w-full h-full">
            <div className="flex justify-between">
                <div className="flex w-[40%] ">
                    <ClientSearch
                        onSelectClient={(c) => setSelectedClient(c)}
                        routeName={'empresas/adeudos'}
                        labelFormat={(c) => `${c.clave} - ${c.nombre}`}
                    />
                </div>
                <div className="flex items-center mr-10">
                    <label htmlFor="anticipo" className="font-bold mr-2">Anticipo único:</label>
                    <input id="anticipo" type="text" className="border border-black rounded-md"></input>
                </div>
            </div>
        </div>
    )
}

export default historico;