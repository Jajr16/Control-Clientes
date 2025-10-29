import InputConError from '../elements/InputError.jsx';

const EmpresaForm = ({ empresa, setEmpresa, errores = {} }) => {
    return (
        <div className="space-y-2">
            <InputConError 
                placeholder="CIF *" 
                value={empresa.cif || ''}
                onChange={e => setEmpresa({ ...empresa, cif: e.target.value })}
                error={errores['cliente.empresa.cif']}
                className="w-full"
            />
            <InputConError 
                placeholder="Nombre *" 
                value={empresa.nombre || ''}
                onChange={e => setEmpresa({ ...empresa, nombre: e.target.value })}
                error={errores['cliente.empresa.nombre']}
                className="w-full"
            />
            <InputConError 
                placeholder="Teléfono *" 
                value={empresa.tel || ''}
                onChange={e => setEmpresa({ ...empresa, tel: e.target.value })}
                error={errores['cliente.empresa.tel']}
                className="w-full"
            />
            <InputConError 
                placeholder="Clave *" 
                value={empresa.clave || ''}
                onChange={e => setEmpresa({ ...empresa, clave: e.target.value })}
                error={errores['cliente.empresa.clave']}
                className="w-full"
            />
        </div>
    );
};

export default EmpresaForm;