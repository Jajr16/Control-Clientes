import { X } from "lucide-react";
import InputConError from '../elements/InputError.jsx';

const InmuebleProveedorForm = ({ proveedor, setProveedor, onRemove, errores = {}, inmuebleIdx, proveedorIdx }) => {
    const prefijo = `inmuebles.${inmuebleIdx}.proveedores.${proveedorIdx}`;
    
    return (
        <div className="border rounded p-3 bg-gray-50 relative">
            <button onClick={onRemove} className="absolute top-2 right-2 text-red-500 hover:text-red-700">
                <X className="w-4 h-4" />
            </button>
            <div className="space-y-2 pr-6">
                <InputConError
                    placeholder="Clave proveedor *"
                    value={proveedor.clave_proveedor || ''}
                    onChange={e => setProveedor({ ...proveedor, clave_proveedor: e.target.value })}
                    error={errores[`${prefijo}.clave_proveedor`]}
                />
                <InputConError
                    placeholder="Nombre proveedor *"
                    value={proveedor.nombre || ''}
                    onChange={e => setProveedor({ ...proveedor, nombre: e.target.value })}
                    error={errores[`${prefijo}.nombre`]}
                />
                <InputConError
                    placeholder="Tel. proveedor (9 dígitos) *"
                    value={proveedor.tel_proveedor || ''}
                    onChange={e => setProveedor({ ...proveedor, tel_proveedor: e.target.value })}
                    error={errores[`${prefijo}.tel_proveedor`]}
                />
                <InputConError
                    placeholder="Email proveedor *"
                    type="email"
                    value={proveedor.email_proveedor || ''}
                    onChange={e => setProveedor({ ...proveedor, email_proveedor: e.target.value })}
                    error={errores[`${prefijo}.email_proveedor`]}
                />
                <InputConError
                    placeholder="Servicio *"
                    value={proveedor.servicio || ''}
                    onChange={e => setProveedor({ ...proveedor, servicio: e.target.value })}
                    error={errores[`${prefijo}.servicio`]}
                />
            </div>
        </div>
    );
};

export default InmuebleProveedorForm;