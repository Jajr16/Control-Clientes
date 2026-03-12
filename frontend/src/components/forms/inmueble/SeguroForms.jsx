import { X } from "lucide-react";
import InputConError from '../../common/InputError.jsx';

const SeguroForm = ({ prefijo, index, onRemove }) => {
    const prefijoBase = `${prefijo}.${index}`;
    
    return (
        <div className="border rounded p-3 bg-gray-50 relative">
            <button onClick={onRemove} className="absolute top-2 right-2 text-red-500 hover:text-red-700">
                <X className="w-4 h-4" />
            </button>
            <div className="flex pr-6">
                <InputConError
                    placeholder="Aseguradora *"
                    name={`${prefijoBase}.empresa_seguro`}
                />
                <InputConError
                    placeholder="Tipo de seguro *"
                    name={`${prefijoBase}.tipo_seguro`}
                />
                <InputConError
                    placeholder="Póliza *"
                    name={`${prefijoBase}.telefono`}
                />
                <InputConError
                    placeholder="Teléfono (9 dígitos) *"
                    name={`${prefijoBase}.email`}
                />
                <InputConError
                    placeholder="Email seguro *"
                    name={`${prefijoBase}.poliza`}
                    type="email"
                />
            </div>
        </div>
    );
};

export default SeguroForm;