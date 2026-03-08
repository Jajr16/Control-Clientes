import InputConError from '../../common/InputError.jsx';
import { CircleUserRound } from "lucide-react";

const PropietarioForm = () => {
    return (
        <div className="space-y-4">
            <div className="border rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2"><CircleUserRound className="w-5 h-5" /> Propietario <span className="text-red-500">*</span></h3>
                <div className="space-y-2">
                    <InputConError
                        name="propietario.nie"
                        placeholder="NIE *"
                        className="w-full"
                    />
                    <InputConError
                        name="propietario.nombre"
                        placeholder="Nombre *"
                        className="w-full"
                    />
                    <InputConError
                        name="propietario.email"
                        placeholder="Email *"
                        type="email"
                        className="w-full"
                    />
                    <InputConError
                        name="propietario.telefono"
                        placeholder="Teléfono *"
                        className="w-full"
                    />
                </div>
            </div>
        </div>
    );
};

export default PropietarioForm;