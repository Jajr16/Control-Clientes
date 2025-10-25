import { X } from "lucide-react";

const InmuebleHipotecaForm = ({ hipoteca, setHipoteca, onRemove }) => (
    <div className="border rounded p-3 bg-gray-50 relative">
        <button onClick={onRemove} className="absolute top-2 right-2 text-red-500 hover:text-red-700">
            <X className="w-4 h-4" />
        </button>
        <input className="w-full border p-2 rounded mb-2" placeholder="Banco" onChange={e => setHipoteca({ ...hipoteca, banco: e.target.value })} />
        <input className="w-full border p-2 rounded" placeholder="Prestamo" onChange={e => setHipoteca({ ...hipoteca, prestamo: e.target.value })} />
        <input className="w-full border p-2 rounded" placeholder="Fecha_hipoteca" onChange={e => setHipoteca({ ...hipoteca, fecha_hipoteca: e.target.value })} />
        <input className="w-full border p-2 rounded" placeholder="cuota" onChange={e => setHipoteca({ ...hipoteca, cuota: e.target.value })} />
    </div>
);

export default InmuebleHipotecaForm;