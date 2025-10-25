const EmpresaForm = ({ empresa, setEmpresa, validationErrors }) => (
    <div className="space-y-2">
        <input className="w-full border p-2 rounded" placeholder="CIF *" onChange={e => setEmpresa({ ...empresa, cif: e.target.value })} />
        <input className="w-full border p-2 rounded" placeholder="Nombre *" onChange={e => setEmpresa({ ...empresa, nombre: e.target.value })} />
        <input className="w-full border p-2 rounded" placeholder="Teléfono *" onChange={e => setEmpresa({ ...empresa, tel: e.target.value })} />
        <input className="w-full border p-2 rounded" placeholder="Clave *" onChange={e => setEmpresa({ ...empresa, clave: e.target.value })} />
    </div>
);

export default EmpresaForm;