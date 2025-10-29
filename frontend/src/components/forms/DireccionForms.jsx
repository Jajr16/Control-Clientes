import InputConError from '../elements/InputError.jsx';

const DireccionForm = ({ direccion, setDireccion, errores = {}, prefijo = 'cliente.direccion' }) => {
    return (
        <div className="space-y-2 mt-4">
            <InputConError 
                placeholder="Calle *" 
                value={direccion.calle || ''}
                onChange={e => setDireccion({ ...direccion, calle: e.target.value })}
                error={errores[`${prefijo}.calle`]}
                className="w-full"
            />
            <div className="grid grid-cols-3 gap-2">
                <InputConError 
                    placeholder="Número *" 
                    value={direccion.numero || ''}
                    onChange={e => setDireccion({ ...direccion, numero: e.target.value })}
                    error={errores[`${prefijo}.numero`]}
                    className="w-full"
                />
                <InputConError 
                    placeholder="Piso *" 
                    value={direccion.piso || ''}
                    onChange={e => setDireccion({ ...direccion, piso: e.target.value })}
                    error={errores[`${prefijo}.piso`]}
                    className="w-full"
                />
                <InputConError 
                    placeholder="CP *" 
                    value={direccion.cp || ''}
                    onChange={e => setDireccion({ ...direccion, cp: e.target.value })}
                    error={errores[`${prefijo}.cp`]}
                    className="w-full"
                />
            </div>
            <InputConError 
                placeholder="Localidad *" 
                value={direccion.localidad || ''}
                onChange={e => setDireccion({ ...direccion, localidad: e.target.value })}
                error={errores[`${prefijo}.localidad`]}
                className="w-full"
            />
        </div>
    );
};

export default DireccionForm;