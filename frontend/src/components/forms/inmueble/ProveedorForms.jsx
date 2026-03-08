import { X } from "lucide-react";
import InputConError from '../../common/InputError.jsx';

const ProveedorForm = ({ prefijoInmueble, index, onRemove }) => {
    const prefijo = `${prefijoInmueble}.${index}`;

    return (
        <div className="border rounded p-3 bg-gray-50 relative">
            <button type="button" onClick={onRemove} className="absolute top-2 right-2 text-red-500 hover:text-red-700">
                <X className="w-4 h-4" />
            </button>
            <div className="flex pr-6">
                <InputConError
                    placeholder="Clave proveedor *"
                    name={`${prefijo}.clave`}
                />
                <InputConError
                    placeholder="Nombre proveedor *"
                    name={`${prefijo}.nombre`}
                />
                <InputConError
                    placeholder="Tel. proveedor (9 dígitos) *"
                    name={`${prefijo}.tipo_servicio`}
                />
                <InputConError
                    placeholder="Email proveedor *"
                    name={`${prefijo}.telefono`}
                    type="email"
                />
                <InputConError
                    placeholder="Servicio *"
                    name={`${prefijo}.email`}
                />
            </div>
        </div>
    );
};

export default ProveedorForm;