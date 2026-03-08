import InputConError from '../../common/InputError.jsx';
import DatoRegistralForm from '../shared/DatoRegistralForms.jsx';
import DireccionForm from '../shared/DireccionForms.jsx';
import { Building } from "lucide-react";

const EmpresaForm = () => {
    return (
        <div className="space-y-4" >
            <div className="border rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <Building className="w-5 h-5" />
                    Empresa <span className="text-red-500">*</span>
                </h3>
                <div className="space-y-2">
                    <InputConError
                        name="empresa.cif"
                        placeholder="CIF *"
                        className="w-full"
                    />
                    <InputConError
                        placeholder="Nombre *"
                        name="empresa.nombre"
                        className="w-full"
                    />
                    <InputConError
                        placeholder="Teléfono *"
                        name="empresa.telefono"
                        className="w-full"
                    />
                    <InputConError
                        placeholder="Clave *"
                        name="empresa.clave"
                        className="w-full"
                    />
                </div>
            </div>
            <DireccionForm />
            <DatoRegistralForm />
        </div>
    );
};

export default EmpresaForm;