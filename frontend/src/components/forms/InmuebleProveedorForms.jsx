import React from "react";

const InmuebleProveedorForm = ({ inmuebleProveedor = {}, setInmuebleProveedor, validationErrors = {} }) => {

    const getError = (field) => validationErrors[field];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setInmuebleProveedor({
            ...inmuebleProveedor,
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
                        value={inmuebleProveedor.clave_catastral || ""}
                        onChange={handleChange}
                        className={`w-full ml-2 mr-2 border rounded-md ${getError('clave_catastral') ? 'border-red-500' : 'border-gray-300'}`}
                    />
                </div>
                <div className="flex justify-between">
                    <label htmlFor="clave">Clave Proveedor:</label>
                    <input
                        id="clave"
                        type="text"
                        name="clave"
                        maxLength={30}
                        value={inmuebleProveedor.clave || ""}
                        onChange={handleChange}
                        className={`w-full ml-2 mr-2 border rounded-md ${getError('clave') ? 'border-red-500' : 'border-gray-300'}`}
                    />
                </div>
            </div>
        </div>
    );
};

export default InmuebleProveedorForm;