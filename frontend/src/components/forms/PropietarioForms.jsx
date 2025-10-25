const PropietarioForm = ({ propietario, setPropietario }) => (
    <div className="space-y-2">
        <input className="w-full border p-2 rounded" placeholder="NIE *" onChange={e => setPropietario({ ...propietario, nie: e.target.value })} />
        <input className="w-full border p-2 rounded" placeholder="Nombre *" onChange={e => setPropietario({ ...propietario, nombre: e.target.value })} />
        <input className="w-full border p-2 rounded" placeholder="Email *" onChange={e => setPropietario({ ...propietario, email: e.target.value })} />
        <input className="w-full border p-2 rounded" placeholder="Teléfono *" onChange={e => setPropietario({ ...propietario, telefono: e.target.value })} />
    </div>
);

export default PropietarioForm;