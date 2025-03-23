import React from "react";

const PropietarioForm = ({ propietario, setPropietario }) => {
    return (
        <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4">Propietario</h3>
            {["nie", "nombre", "apellido_p", "apellido_m", "email", "telefono"].map(field => (
                <input
                    key={field}
                    type="text"
                    name={field}
                    placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                    value={propietario[field]}
                    onChange={(e) => setPropietario(prev => ({ ...prev, [field]: e.target.value }))}
                    className="w-full p-2 mb-2 border border-gray-300 rounded-md"
                />
            ))}
        </div>
    );
};

export default PropietarioForm;