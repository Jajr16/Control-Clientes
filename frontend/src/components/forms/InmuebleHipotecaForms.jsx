import React from "react";

const InmuebleHipotecaForm = ({ inmuebleHipoteca, setInmuebleHipoteca, validationErrors = {} }) => {

    const getError = (field) => validationErrors[field];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setInmuebleHipoteca(prev => ({
            ...prev,
            [name]: value
        }));
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
                        value={inmuebleHipoteca.clave_catastral || ""}
                        onChange={handleChange}
                        className={`w-full ml-2 mr-2 border rounded-md ${getError('clave_catastral') ? 'border-red-500' : 'border-gray-300'}`}
                    />
                </div>
                <div className="flex justify-between">
                    <label htmlFor="id_hipoteca">ID Hipoteca:</label>
                    <input
                        id="id_hipoteca"
                        type="number"
                        name="id_hipoteca"
                        value={inmuebleHipoteca.id_hipoteca || ""}
                        onChange={handleChange}
                        className={`w-full ml-2 mr-2 border rounded-md ${getError('id_hipoteca') ? 'border-red-500' : 'border-gray-300'}`}
                    />
                </div>
            </div>
        </div>
    );
};

export default InmuebleHipotecaForm;