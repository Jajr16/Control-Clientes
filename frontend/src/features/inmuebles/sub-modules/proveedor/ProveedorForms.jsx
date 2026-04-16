import { X } from "lucide-react";
import InputConError from '../../../../components/common/InputError.jsx';

const ProveedorForm = ({ prefijo, index, onRemove }) => {
    const prefijoBase = `${prefijo}.${index}.data`;

    return (
        <div className="border rounded p-3 bg-gray-50 relative">
            <button type="button" onClick={onRemove} className="absolute top-2 right-2 text-red-500 hover:text-red-700">
                <X className="w-4 h-4" />
            </button>
            <div className="flex pr-6">
                <InputConError
                    placeholder="Clave proveedor *"
                    name={`${prefijoBase}.cup`}
                />
                <InputConError
                    placeholder="Nombre proveedor *"
                    name={`${prefijoBase}.nombre`}
                />
                <InputConError
                    placeholder="Tel. proveedor (9 dígitos) *"
                    name={`${prefijoBase}.telefono`}
                />
                <InputConError
                    placeholder="Email proveedor *"
                    name={`${prefijoBase}.email`}
                    type="email"
                />
                <InputConError
                    placeholder="Servicio *"
                    name={`${prefijoBase}.tipo_servicio`}
                />
            </div>
        </div>
    );
};

export default ProveedorForm;