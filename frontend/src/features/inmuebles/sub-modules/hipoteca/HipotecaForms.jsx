import { X } from "lucide-react";
import InputConError from '../../../../components/common/InputError.jsx';

const HipotecaForm = ({ prefijo, onRemove }) => {
    
    return (
        <div className="border rounded p-3 bg-gray-50 relative">
            <button onClick={onRemove} className="absolute top-2 right-2 text-red-500 hover:text-red-700">
                <X className="w-4 h-4" />
            </button>
            <div className="flex pr-6">
                <InputConError
                    placeholder="Banco *"
                    name={`${prefijo}.banco_prestamo`}
                />
                <InputConError
                    placeholder="Préstamo *"
                    name={`${prefijo}.prestamo`}
                    type="number"
                />
                <InputConError
                    placeholder="Cuota *"
                    name={`${prefijo}.cuota_hipoteca`}
                    type="number"
                />
                <InputConError
                    placeholder="Fecha hipoteca *"
                    name={`${prefijo}.fecha_hipoteca`}
                    type="date"
                />
            </div>
        </div>
    );
};

export default HipotecaForm;