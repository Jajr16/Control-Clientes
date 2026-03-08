import InputConError from '../../common/InputError.jsx';
import { MapPin } from "lucide-react";

const DireccionForm = ({ prefijo = 'empresa.direccion' }) => {
    return (
        <div>
            <div className="border rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <MapPin className="w-5 h-5" />Dirección <span className="text-red-500">*</span>
                </h3>
                <div className="space-y-2 mt-4">
                    <InputConError
                        name={`${prefijo}.calle`}
                        placeholder="Calle *"
                        className="w-full"
                    />
                    <div className="grid grid-cols-3 gap-2">
                        <InputConError
                            name={`${prefijo}.numero`}
                            placeholder="Número *"
                            className="w-full"
                        />
                        <InputConError
                            name={`${prefijo}.piso`}
                            placeholder="Piso *"
                            className="w-full"
                        />
                        <InputConError
                            name={`${prefijo}.codigo_postal`}
                            placeholder="CP *"
                            className="w-full"
                        />
                    </div>
                    <InputConError
                        name={`${prefijo}.localidad`}
                        placeholder="Localidad *"
                        className="w-full"
                    />
                </div>
            </div>
        </div>
    );
};

export default DireccionForm;