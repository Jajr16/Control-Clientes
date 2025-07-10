import React from "react";

const DireccionForm = ({ direccion, setDireccion, validationErrors= {} }) => {

    const getError = (field) => {
        return validationErrors[field];
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setDireccion(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <div className="mb-6">
            <div className="grid grid-cols-2 m-3">
                {/* Campo para la calle */}
                <div className="flex justify-between">
                    <label htmlFor="Calle">Calle:</label>
                    <input id="Calle" type="text" name="calle"
                        onChange={handleChange}
                        className={`w-full ml-2 mr-2 border rounded-md ${getError('calle') ? 'border-red-500' : 'border-gray-300'}`} />
                </div>
                {/* Campo para la localidad */}
                <div className="flex justify-between">
                    <label htmlFor="Localidad">Localidad:</label>
                    <input id="Localidad" type="text" name="localidad"
                        onChange={handleChange}
                        className={`w-full ml-2 mr-2 border rounded-md ${getError('localidad') ? 'border-red-500' : 'border-gray-300'}`} />
                </div>
            </div>
            <div className="grid grid-cols-3 m-3">
                {/* Campo para la numero */}
                <div className="flex justify-between">
                    <label htmlFor="Numero">Número:</label>
                    <input id="Numero" type="number" name="numero"
                        onChange={handleChange}
                        className={`w-full ml-2 mr-2 border rounded-md ${getError('numero') ? 'border-red-500' : 'border-gray-300'}`} />
                </div>
                {/* Campo para la piso */}
                <div className="flex justify-between">
                    <label htmlFor="piso">Piso:</label>
                    <input id="piso" type="number" name="piso"
                        onChange={handleChange}
                        className={`w-full ml-2 mr-2 border rounded-md ${getError('locpisoalidad') ? 'border-red-500' : 'border-gray-300'}`} />
                </div>
                {/* Campo para la código postal */}
                <div className="flex justify-between">
                    <label htmlFor="cp">C.P.:</label>
                    <input id="cp" type="number" name="cp"
                        onChange={handleChange}
                        className={`w-full ml-2 mr-2 border rounded-md ${getError('cp') ? 'border-red-500' : 'border-gray-300'}`} />
                </div>
            </div>
        </div>
    );
};

export default DireccionForm;