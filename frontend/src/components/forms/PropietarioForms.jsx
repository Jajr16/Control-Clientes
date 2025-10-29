import InputConError from '../elements/InputError.jsx';

const PropietarioForm = ({ propietario, setPropietario, errores = {} }) => {
    return (
        <div className="space-y-2">
            <InputConError 
                placeholder="NIE *" 
                value={propietario.nie || ''}
                onChange={e => setPropietario({ ...propietario, nie: e.target.value })}
                error={errores['cliente.propietario.nie']}
                className="w-full"
            />
            <InputConError 
                placeholder="Nombre *" 
                value={propietario.nombre || ''}
                onChange={e => setPropietario({ ...propietario, nombre: e.target.value })}
                error={errores['cliente.propietario.nombre']}
                className="w-full"
            />
            <InputConError 
                placeholder="Email *" 
                type="email"
                value={propietario.email || ''}
                onChange={e => setPropietario({ ...propietario, email: e.target.value })}
                error={errores['cliente.propietario.email']}
                className="w-full"
            />
            <InputConError 
                placeholder="Teléfono *" 
                value={propietario.telefono || ''}
                onChange={e => setPropietario({ ...propietario, telefono: e.target.value })}
                error={errores['cliente.propietario.telefono']}
                className="w-full"
            />
        </div>
    );
};

export default PropietarioForm;