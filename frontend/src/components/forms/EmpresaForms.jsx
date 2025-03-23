import React from "react";

const EmpresaForm = ({ empresa, setEmpresa }) => {
    return (
        <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4">Empresa</h3>
            {["cif", "clave", "nombre", "telefono"].map(field => (
                <input
                    key={field}
                    type="text"
                    name={field}
                    placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                    value={empresa[field]}
                    onChange={(e) => setEmpresa(prev => ({ ...prev, [field]: e.target.value }))}
                    className="w-full p-2 mb-2 border border-gray-300 rounded-md"
                />
            ))}
        </div>
    );
}

export default EmpresaForm;