import DatoRegistralForm from "./DatoRegistralForms.jsx";
import DireccionForm from "./DireccionForms.jsx";
import InputConError from '../elements/InputError.jsx';

const InmuebleForm = ({ inmueble, setInmueble, errores = {}, indice = 0 }) => {
    const actualizarDireccion = (nuevaDireccion) => {
        setInmueble({
            ...inmueble,
            dirInmueble: nuevaDireccion
        });
    };

    const actualizarDatoRegistral = (nuevoDatoRegistral) => {
        setInmueble({
            ...inmueble,
            datoRegistralInmueble: nuevoDatoRegistral
        });
    };

    const prefijoBase = `inmuebles.${indice}.datosInmueble`;

    return (
        <div className="space-y-2">
            <div className="grid grid-cols-3 gap-2">
                <InputConError
                    placeholder="Clave catastral *"
                    value={inmueble.clave_catastral || ''}
                    onChange={e => setInmueble({ ...inmueble, clave_catastral: e.target.value })}
                    error={errores[`${prefijoBase}.clave_catastral`]}
                    className="w-full"
                />
                <InputConError
                    type="number"
                    placeholder="Valor de adquisición *"
                    value={inmueble.valor_adquisicion || ''}
                    onChange={e => setInmueble({ ...inmueble, valor_adquisicion: e.target.value })}
                    error={errores[`${prefijoBase}.valor_adquisicion`]}
                    className="w-full"
                />
                <InputConError
                    type="date"
                    placeholder="Fecha de adquisición *"
                    value={inmueble.fecha_adquisicion || ''}
                    onChange={e => setInmueble({ ...inmueble, fecha_adquisicion: e.target.value })}
                    error={errores[`${prefijoBase}.fecha_adquisicion`]}
                    className="w-full"
                />
            </div>

            <div>
                <h4 className="font-semibold mb-2">Dirección del Inmueble *</h4>
                <DireccionForm
                    direccion={inmueble.dirInmueble || {}}
                    setDireccion={actualizarDireccion}
                    errores={errores}
                    prefijo={`${prefijoBase}.dirInmueble`}
                />
            </div>

            <hr className="my-4" />

            <div>
                <h4 className="font-semibold mb-2">Datos Registrales del Inmueble *</h4>
                <DatoRegistralForm
                    datoRegistral={inmueble.datoRegistralInmueble || {}}
                    setDatoRegistral={actualizarDatoRegistral}
                    errores={errores}
                    prefijo={`${prefijoBase}.datoRegistralInmueble`}
                />
            </div>
        </div>
    );
};

export default InmuebleForm;