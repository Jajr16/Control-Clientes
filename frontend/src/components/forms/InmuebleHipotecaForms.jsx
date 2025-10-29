import { X } from "lucide-react";
import InputConError from '../elements/InputError.jsx';

const InmuebleHipotecaForm = ({ hipoteca, setHipoteca, onRemove, errores = {}, inmuebleIdx, hipotecaIdx }) => {
    const prefijo = `inmuebles.${inmuebleIdx}.hipotecas.${hipotecaIdx}`;
    
    return (
        <div className="border rounded p-3 bg-gray-50 relative">
            <button onClick={onRemove} className="absolute top-2 right-2 text-red-500 hover:text-red-700">
                <X className="w-4 h-4" />
            </button>
            <div className="space-y-2 pr-6">
                <InputConError
                    placeholder="Banco *"
                    value={hipoteca.banco || ''}
                    onChange={e => setHipoteca({ ...hipoteca, banco: e.target.value })}
                    error={errores[`${prefijo}.banco`]}
                />
                <InputConError
                    placeholder="Préstamo *"
                    type="number"
                    value={hipoteca.prestamo || ''}
                    onChange={e => setHipoteca({ ...hipoteca, prestamo: e.target.value })}
                    error={errores[`${prefijo}.prestamo`]}
                />
                <InputConError
                    placeholder="Cuota *"
                    type="number"
                    value={hipoteca.cuota || ''}
                    onChange={e => setHipoteca({ ...hipoteca, cuota: e.target.value })}
                    error={errores[`${prefijo}.cuota`]}
                />
                <InputConError
                    placeholder="Fecha hipoteca *"
                    type="date"
                    value={hipoteca.fecha_hipoteca || ''}
                    onChange={e => setHipoteca({ ...hipoteca, fecha_hipoteca: e.target.value })}
                    error={errores[`${prefijo}.fecha_hipoteca`]}
                />
            </div>
        </div>
    );
};

export default InmuebleHipotecaForm;