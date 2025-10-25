const DatoRegistralForm = ({ datoRegistral, setDatoRegistral }) => {
    return (
        <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
                <input className="border p-2 rounded" placeholder="Núm. Protocolo *" onChange={e => setDatoRegistral({ ...datoRegistral, num_protocolo: e.target.value })} />
                <input className="border p-2 rounded" placeholder="Folio *" onChange={e => setDatoRegistral({ ...datoRegistral, folio: e.target.value })} />
                <input className="border p-2 rounded" placeholder="Hoja *" onChange={e => setDatoRegistral({ ...datoRegistral, hoja: e.target.value })} />
                <input className="border p-2 rounded" placeholder="Inscripción *" value={datoRegistral.inscripcion || ''} onChange={e => setDatoRegistral({ ...datoRegistral, inscripcion: e.target.value })} />
            </div>
            <input className="w-full border p-2 rounded" placeholder="Notario *" onChange={e => setDatoRegistral({ ...datoRegistral, notario: e.target.value })} />
            <input className="w-full border p-2 rounded" type="date" placeholder="Fecha Inscripción *" onChange={e => setDatoRegistral({ ...datoRegistral, fecha_inscripcion: e.target.value })} />
        </div>
    );
};

export default DatoRegistralForm;