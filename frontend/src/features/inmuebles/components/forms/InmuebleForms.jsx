import { DatoRegistralForm, DireccionForm } from '../../../shared/forms/index.js'
import InputConError from '../../../../components/common/InputError.jsx';
import ProveedorSection from '../../sub-modules/proveedor/proveedorSection.jsx';
import HipotecaSection from '../../sub-modules/hipoteca/hipotecaSection.jsx';
import SeguroSection from '../../sub-modules/seguro/seguroSection.jsx';

const InmuebleForm = ({ index = 0 }) => {
    const prefijoBase = `inmuebles.${index}`;

    return (
        <div className="p-4 space-y-6">
            <div className="border rounded-lg p-4 bg-blue-50">
                <h4 className="font-semibold mb-3">Datos Inmueble <span className="text-red-500">*</span></h4>

                <div className="space-y-2">
                    <div className="grid grid-cols-3 gap-2 border rounded-lg p-4">
                        <InputConError
                            placeholder="Clave catastral *"
                            name={`${prefijoBase}.clave_catastral`}
                            className="w-full"
                        />
                        <InputConError
                            type="number"
                            placeholder="Valor de adquisición"
                            name={`${prefijoBase}.valor_adquisicion`}
                            className="w-full"
                        />
                        <InputConError
                            type="date"
                            placeholder="Fecha de adquisición"
                            name={`${prefijoBase}.fecha_adquisicion`}
                            className="w-full"
                        />
                    </div>

                    <div>
                        <DireccionForm
                            prefijo={`${prefijoBase}.direccion`}
                        />
                    </div>

                    <div>
                        <DatoRegistralForm
                            prefijo={`${prefijoBase}.dato_registral`}
                        />
                    </div>
                </div>
            </div>

            <div>
                <ProveedorSection prefijoInmueble={prefijoBase} />
            </div>

            <div>
                <HipotecaSection prefijoInmueble={prefijoBase} />
            </div>

            <div>
                <SeguroSection prefijoInmueble={prefijoBase} />
            </div>
        </div>
    );
};

export default InmuebleForm;