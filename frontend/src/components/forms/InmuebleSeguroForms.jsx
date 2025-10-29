import { X } from "lucide-react";
import InputConError from '../elements/InputError.jsx';

const InmuebleSeguroForm = ({ seguro, setSeguro, onRemove, errores = {}, inmuebleIdx, seguroIdx }) => {
    const prefijo = `inmuebles.${inmuebleIdx}.seguros.${seguroIdx}`;
    
    return (
        <div className="border rounded p-3 bg-gray-50 relative">
            <button onClick={onRemove} className="absolute top-2 right-2 text-red-500 hover:text-red-700">
                <X className="w-4 h-4" />
            </button>
            <div className="space-y-2 pr-6">
                <InputConError
                    placeholder="Aseguradora *"
                    value={seguro.aseguradora || ''}
                    onChange={e => setSeguro({ ...seguro, aseguradora: e.target.value })}
                    error={errores[`${prefijo}.aseguradora`]}
                />
                <InputConError
                    placeholder="Tipo de seguro *"
                    value={seguro.tipo_seguro || ''}
                    onChange={e => setSeguro({ ...seguro, tipo_seguro: e.target.value })}
                    error={errores[`${prefijo}.tipo_seguro`]}
                />
                <InputConError
                    placeholder="Póliza *"
                    value={seguro.poliza || ''}
                    onChange={e => setSeguro({ ...seguro, poliza: e.target.value })}
                    error={errores[`${prefijo}.poliza`]}
                />
                <InputConError
                    placeholder="Teléfono (9 dígitos) *"
                    value={seguro.telefono_seguro || ''}
                    onChange={e => setSeguro({ ...seguro, telefono_seguro: e.target.value })}
                    error={errores[`${prefijo}.telefono_seguro`]}
                />
                <InputConError
                    placeholder="Email seguro *"
                    type="email"
                    value={seguro.email_seguro || ''}
                    onChange={e => setSeguro({ ...seguro, email_seguro: e.target.value })}
                    error={errores[`${prefijo}.email_seguro`]}
                />
            </div>
        </div>
    );
};

export default InmuebleSeguroForm;