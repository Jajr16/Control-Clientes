import React from "react";

const InmuebleForm = ({ inmueble, setInmueble, validationErrors = {} }) => {

    const getError = (field) => validationErrors[field];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setInmueble({
            ...inmueble,
            [name]: value
        });
    };

    return (
        <div className="mb-6">
            <div className="grid grid-cols-3 m-3">
                <div className="flex justify-between">
                    <label htmlFor="clave_catastral">Clave Catastral:</label>
                    <input
                        id="clave_catastral"
                        type="text"
                        name="clave_catastral"
                        maxLength={25}
                        value={inmueble.clave_catastral || ""}
                        onChange={handleChange}
                        className={`w-full ml-2 mr-2 border rounded-md ${getError('clave_catastral') ? 'border-red-500' : 'border-gray-300'}`}
                    />
                </div>
                <div className="flex justify-between">
                    <label htmlFor="direccion">Dirección:</label>
                    <input
                        id="direccion"
                        type="number"
                        name="direccion"
                        value={inmueble.direccion || ""}
                        onChange={handleChange}
                        className={`w-full ml-2 mr-2 border rounded-md ${getError('direccion') ? 'border-red-500' : 'border-gray-300'}`}
                    />
                </div>
                <div className="flex justify-between">
                    <label htmlFor="dato_registral">Dato Registral:</label>
                    <input
                        id="dato_registral"
                        type="number"
                        name="dato_registral"
                        value={inmueble.dato_registral || ""}
                        onChange={handleChange}
                        className={`w-full ml-2 mr-2 border rounded-md ${getError('dato_registral') ? 'border-red-500' : 'border-gray-300'}`}
                    />
                </div>
            </div>
        </div>
    );
};

export default InmuebleForm;