import { X } from "lucide-react";

const InmuebleProveedorForm = ({ proveedor, setProveedor, onRemove }) => (
    <div className="border rounded p-3 bg-gray-50 relative">
        <button onClick={onRemove} className="absolute top-2 right-2 text-red-500 hover:text-red-700">
            <X className="w-4 h-4" />
        </button>
        <input className="w-full border p-2 rounded mb-2" placeholder="Clave proveedor" onChange={e => setProveedor({ ...proveedor, clave_proveedor: e.target.value })} />
        <input className="w-full border p-2 rounded mb-2" placeholder="Nombre proveedor" onChange={e => setProveedor({ ...proveedor, nombre: e.target.value })} />
        <input className="w-full border p-2 rounded mb-2" placeholder="Tel. proveedor" onChange={e => setProveedor({ ...proveedor, tel_proveedor: e.target.value })} />
        <input className="w-full border p-2 rounded mb-2" placeholder="Email proveedor" onChange={e => setProveedor({ ...proveedor, email_proveedor: e.target.value })} />
        <input className="w-full border p-2 rounded" placeholder="Servicio" onChange={e => setProveedor({ ...proveedor, servicio: e.target.value })} />
    </div>
);

export default InmuebleProveedorForm;