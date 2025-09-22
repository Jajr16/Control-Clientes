import React from "react";

const PropietarioForm = ({ propietario, setPropietario, validationErrors = {} }) => {

    const getError = (field) => {
        return validationErrors[field];
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setPropietario(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <div className="mb-6">
            <div className="flex justify-between m-3">
                <label htmlFor="nie">NIE:</label>
                <input
                    id="nie"
                    type="text"
                    name="nie"
                    onChange={handleChange}
                    className={`w-full ml-2 mr-2 border rounded-md ${getError('nie') ? 'border-red-500' : 'border-gray-300'}`}
                />
            </div>
            <div className="flex justify-between m-3">
                <label htmlFor="nombre">Nombre:</label>
                <input
                    id="nombre"
                    type="text"
                    name="nombre"
                    onChange={handleChange}
                    className={`w-full ml-2 mr-2 border rounded-md ${getError('nombre') ? 'border-red-500' : 'border-gray-300'}`}
                />
            </div>
            <div className="flex justify-between m-3">
                <label htmlFor="telefono">Teléfono:</label>
                <input
                    id="telefono"
                    type="text"
                    name="telefono"
                    onChange={handleChange}
                    className={`w-full ml-2 mr-2 border rounded-md ${getError('telefono') ? 'border-red-500' : 'border-gray-300'}`}
                />
            </div>
            <div className="flex justify-between m-3">
                <label htmlFor="email">Email:</label>
                <input
                    id="email"
                    type="text"
                    name="email"
                    onChange={handleChange}
                    className={`w-full ml-2 mr-2 border rounded-md ${getError('email') ? 'border-red-500' : 'border-gray-300'}`}
                />
            </div>
        </div>
    );
};

export default PropietarioForm;