import React from "react";

const InmuebleSeguroForm = ({ inmuebleSeguro = {}, setInmuebleSeguro, validationErrors = {} }) => {

    const getError = (field) => validationErrors[field];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setInmuebleSeguro({
            ...inmuebleSeguro,
            [name]: value
        });
    };

    return (
        <div className="mb-6">
            <div className="grid grid-cols-2 m-3">
                <div className="flex justify-between">
                    <label htmlFor="clave_catastral">Clave Catastral:</label>
                    <input
                        id="clave_catastral"
                        type="text"
                        name="clave_catastral"
                        maxLength={25}
                        value={inmuebleSeguro.clave_catastral || ""}
                        onChange={handleChange}
                        className={`w-full ml-2 mr-2 border rounded-md ${getError('clave_catastral') ? 'border-red-500' : 'border-gray-300'}`}
                    />
                </div>
                <div className="flex justify-between">
                    <label htmlFor="empresa_seguro">Empresa Seguro:</label>
                    <input
                        id="empresa_seguro"
                        type="text"
                        name="empresa_seguro"
                        maxLength={300}
                        value={inmuebleSeguro.empresa_seguro || ""}
                        onChange={handleChange}
                        className={`w-full ml-2 mr-2 border rounded-md ${getError('empresa_seguro') ? 'border-red-500' : 'border-gray-300'}`}
                    />
                </div>
            </div>
        </div>
    );
};

export default InmuebleSeguroForm;