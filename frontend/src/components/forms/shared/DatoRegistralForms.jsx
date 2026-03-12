import InputConError from '../../common/InputError.jsx';
import { FileText } from "lucide-react";

const DatoRegistralForm = ({ prefijo = 'empresa.dato_registral' }) => {
    return (
        <div className="lg:col-span-1">
            <div className="border rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Datos Registrales{/*  <span className="text-red-500">*</span> */}
                </h3>
                <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                        <InputConError
                            name={`${prefijo}.num_protocolo`}
                            placeholder="Núm. Protocolo *"
                            className="w-full"
                        />
                        <InputConError
                            name={`${prefijo}.folio`}
                            placeholder="Folio *"
                            className="w-full"
                            registerOptions={{ valueAsNumber: true }}
                        />
                        <InputConError
                            name={`${prefijo}.hoja`}
                            placeholder="Hoja *"
                            className="w-full"
                        />
                        <InputConError
                            name={`${prefijo}.inscripcion`}
                            placeholder="Inscripción *"
                            className="w-full"
                            registerOptions={{ valueAsNumber: true }}
                        />
                    </div>
                    <InputConError
                        name={`${prefijo}.notario`}
                        placeholder="Notario *"
                        className="w-full"
                    />
                    <InputConError
                        name={`${prefijo}.fecha_inscripcion`}
                        type="date"
                        placeholder="Fecha Inscripción *"
                        className="w-full"
                    />
                </div>
            </div>
        </div>
    );
};

export default DatoRegistralForm;