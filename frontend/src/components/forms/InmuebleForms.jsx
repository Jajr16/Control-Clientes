import DatoRegistralForm from "../../components/forms/DatoRegistralForms.jsx";
import DireccionForm from "../../components/forms/DireccionForms.jsx";

const InmuebleForm = ({ inmueble, setInmueble }) => {
    const actualizarDireccion = (nuevaDireccion) => {
        setInmueble({
            ...inmueble,
            dirInmueble: nuevaDireccion
        })
    }

    const actualizarDatoRegistral = (nuevoDatoRegistral) => {
        setInmueble({
            ...inmueble,
            datoRegistralInmueble: nuevoDatoRegistral
        });
    };

    return (
        <div className="space-y-2">
            <input className="w-full border p-2 rounded" placeholder="Referencia catastral *" onChange={e => setInmueble({ ...inmueble, referencia: e.target.value })} />
            <div>
                <h4 className="font-semibold mb-2">Dirección del Inmueble *</h4>
                <DireccionForm
                    direccion={inmueble.dirInmueble || {}}
                    setDireccion={actualizarDireccion}
                />
            </div>

            <hr className="my-4" />

            <div>
                <h4 className="font-semibold mb-2">Datos Registrales del Inmueble *</h4>
                <DatoRegistralForm 
                    datoRegistral={inmueble.datoRegistralInmueble || {}} 
                    setDatoRegistral={actualizarDatoRegistral}
                />
            </div>
        </div>
    )
};

export default InmuebleForm;