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
            <InputConError 
                placeholder="Referencia catastral *"
                value={inmueble.referencia || ''}
                onChange={e => setInmueble({ ...inmueble, referencia: e.target.value })}
                error={errores[`${prefijoBase}.referencia`]}
                className="w-full"
            />
            
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