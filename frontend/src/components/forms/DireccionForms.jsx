import React from "react";

const DireccionForm = ({ direccion, setDireccion }) => {
    return (
        <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4">Dirección</h3>
            {["calle", "numero", "piso", "codigo_postal", "localidad"].map(field => (
                <input
                    key={field}
                    type="text"
                    name={field}
                    placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                    value={direccion[field]}
                    onChange={(e) => setDireccion(prev => ({ ...prev, [field]: e.target.value }))}
                    className="w-full p-2 mb-2 border border-gray-300 rounded-md"
                />
            ))}
        </div>
    );
};

export default DireccionForm;