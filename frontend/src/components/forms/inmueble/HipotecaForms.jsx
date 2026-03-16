import { X } from "lucide-react";
import InputConError from '../../common/InputError.jsx';

const HipotecaForm = ({ prefijo, index, onRemove }) => {
    const prefijoBase = `${prefijo}.${index}`;
    
    return (
        <div className="border rounded p-3 bg-gray-50 relative">
            <button onClick={onRemove} className="absolute top-2 right-2 text-red-500 hover:text-red-700">
                <X className="w-4 h-4" />
            </button>
            <div className="flex pr-6">
                <InputConError
                    placeholder="Banco *"
                    name={`${prefijoBase}.banco_prestamo`}
                />
                <InputConError
                    placeholder="Préstamo *"
                    name={`${prefijoBase}.prestamo`}
                    type="number"
                />
                <InputConError
                    placeholder="Cuota *"
                    name={`${prefijoBase}.cuota_hipoteca`}
                    type="number"
                />
                <InputConError
                    placeholder="Fecha hipoteca *"
                    name={`${prefijoBase}.fecha_hipoteca`}
                    type="date"
                    registerOptions={{ valueAsDate: true }}
                />
            </div>
        </div>
    );
};

export default HipotecaForm;