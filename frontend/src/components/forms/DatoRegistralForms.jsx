import React from "react";

const DatoRegistralForm = ({ datoRegistral, setDatoRegistral }) => {
    return (
        <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4">Dato Registral</h3>
            {["num_protocolo", "folio", "hoja", "inscripcion", "notario", "fecha_inscripcion"].map(field => (
                <input
                    key={field}
                    type={field === "fecha_inscripcion" ? "date" : "text"}
                    name={field}
                    placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                    value={datoRegistral[field]}
                    onChange={(e) => setDatoRegistral(prev => ({ ...prev, [field]: e.target.value }))}
                    className="w-full p-2 mb-2 border border-gray-300 rounded-md"
                />
            ))}
        </div>
    );
};

export default DatoRegistralForm;