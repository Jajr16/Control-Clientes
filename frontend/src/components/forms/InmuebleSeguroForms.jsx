import { X } from "lucide-react";

const InmuebleSeguroForm = ({ seguro, setSeguro, onRemove }) => (
    <div className="border rounded p-3 bg-gray-50 relative">
        <button onClick={onRemove} className="absolute top-2 right-2 text-red-500 hover:text-red-700">
            <X className="w-4 h-4" />
        </button>
        <input className="w-full border p-2 rounded mb-2" placeholder="Aseguradora" onChange={e => setSeguro({ ...seguro, aseguradora: e.target.value })} />
        <input className="w-full border p-2 rounded" placeholder="Seguro de..." onChange={e => setSeguro({ ...seguro, tipo_seguro: e.target.value })} />
        <input className="w-full border p-2 rounded" placeholder="Teléfono" onChange={e => setSeguro({ ...seguro, telefono_seguro: e.target.value })} />
        <input className="w-full border p-2 rounded" placeholder="Email seguro" onChange={e => setSeguro({ ...seguro, email_seguro: e.target.value })} />
        <input className="w-full border p-2 rounded" placeholder="Póliza" onChange={e => setSeguro({ ...seguro, poliza: e.target.value })} />
    </div>
);

export default InmuebleSeguroForm;