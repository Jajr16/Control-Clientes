const DireccionForm = ({ direccion, setDireccion }) => (
    <div className="space-y-2 mt-4">
        <input className="w-full border p-2 rounded" placeholder="Calle *" onChange={e => setDireccion({ ...direccion, calle: e.target.value })} />
        <div className="grid grid-cols-3 gap-2">
            <input className="border p-2 rounded" placeholder="Número *" onChange={e => setDireccion({ ...direccion, numero: e.target.value })} />
            <input className="border p-2 rounded" placeholder="Piso *" onChange={e => setDireccion({ ...direccion, piso: e.target.value })} />
            <input className="border p-2 rounded" placeholder="CP *" onChange={e => setDireccion({ ...direccion, cp: e.target.value })} />
        </div>
        <input className="w-full border p-2 rounded" placeholder="Localidad *" onChange={e => setDireccion({ ...direccion, localidad: e.target.value })} />
    </div>
);

export default DireccionForm;