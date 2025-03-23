import React, { useState } from "react";
import ClientSearch from "../components/elements/searchBar";
import ClientDetails from "../components/elements/ClienteDetails"; // Asegúrate de crear este componente
import { UserPlusIcon } from "@heroicons/react/24/solid";
import { Link } from "react-router-dom";

const Cliente = () => {
    const [selectedClient, setSelectedClient] = useState(null);

    return (
        <div className="w-full">
            <div className="flex w-full">
                <ClientSearch onSelectClient={setSelectedClient} />
                {!selectedClient && (
                    <div className="self-center ml-4">
                        <Link to="/">
                            <UserPlusIcon className="h-6 w-6" />
                        </Link>
                    </div>
                )}
            </div>
            {selectedClient && <ClientDetails client={selectedClient} />}
        </div>
    );
};

export default Cliente;