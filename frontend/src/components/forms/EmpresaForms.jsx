import React from "react";

const EmpresaForm = ({ empresa, setEmpresa, validationErrors = {} }) => {

    const getError = (field) => {
        return validationErrors[field];
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEmpresa(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <div className="mb-6">
            <div className="grid grid-cols-3 m-3">
                <div className="flex justify-between">
                    <label htmlFor="CIF">CIF:</label>
                    <input id="CIF" type="text" name="cif" maxLength={9}
                        onChange={handleChange}
                        className={`w-full ml-2 mr-2 border rounded-md ${getError('cif') ? 'border-red-500' : 'border-gray-300'}`} />
                </div>
                <div className="flex justify-between">
                    <label htmlFor="CLAVE">CLAVE:</label>
                    <input id="CLAVE" type="text" name="clave" maxLength={3}
                        onChange={handleChange}
                        className={`w-full ml-2 mr-2 border rounded-md ${getError('clave') ? 'border-red-500' : 'border-gray-300'}`} />
                </div>
                <div className="flex justify-between">
                    <label htmlFor="TELEFONO">Teléfono:</label>
                    <input id="TELEFONO" type="text" name="tel" maxLength={9}
                        onChange={handleChange}
                        className={`w-full ml-2 mr-2 border rounded-md ${getError('tel') ? 'border-red-500' : 'border-gray-300'}`} />
                </div>
            </div>
            <div className="flex justify-between m-3">
                <label htmlFor="NombreEmpresa">Nombre:</label>
                    <input id="NombreEmpresa" type="text" name="nombre" onChange={handleChange}
                        className={`w-full ml-2 mr-2 border rounded-md ${getError('nombre') ? 'border-red-500' : 'border-gray-300'}`} />
            </div>
        </div>
    );
}

export default EmpresaForm;