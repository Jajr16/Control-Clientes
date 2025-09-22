import React from "react";

const fieldLabels = {
    num_protocolo: "Número de Protocolo",
    folio: "Folio",
    hoja: "Hoja",
    inscripcion: "Inscripción",
    notario: "Notario",
    fecha_inscripcion: "Fecha de Inscripción"
};

const DatoRegistralForm = ({ datoRegistral, setDatoRegistral }) => {
    return (
        <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4">Dato Registral</h3>
            {Object.entries(fieldLabels).map(([field, label]) => (
                <div key={field} className="mb-2">
                    <label htmlFor={field} className="block font-medium mb-1">
                        {label}
                    </label>
                    <input
                        id={field}
                        type={field === "fecha_inscripcion" ? "date" : "text"}
                        name={field}
                        placeholder={label}
                        value={datoRegistral[field] || ""}
                        onChange={(e) =>
                            setDatoRegistral(prev => ({ ...prev, [field]: e.target.value }))
                        }
                        className="w-full p-2 border border-gray-300 rounded-md"
                    />
                </div>
            ))}
        </div>
    );
};

export default DatoRegistralForm;