import InputConError from '../elements/InputError.jsx';

const DatoRegistralForm = ({ datoRegistral, setDatoRegistral, errores = {}, prefijo = 'cliente.datoRegistral' }) => {
    return (
        <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
                <InputConError
                    placeholder="Núm. Protocolo *"
                    value={datoRegistral.num_protocolo || ''}
                    onChange={e => setDatoRegistral({ ...datoRegistral, num_protocolo: e.target.value })}
                    error={errores[`${prefijo}.num_protocolo`]}
                    className="w-full"
                />
                <InputConError
                    placeholder="Folio *"
                    value={datoRegistral.folio || ''}
                    onChange={e => setDatoRegistral({ ...datoRegistral, folio: e.target.value })}
                    error={errores[`${prefijo}.folio`]}
                    className="w-full"
                />
                <InputConError
                    placeholder="Hoja *"
                    value={datoRegistral.hoja || ''}
                    onChange={e => setDatoRegistral({ ...datoRegistral, hoja: e.target.value })}
                    error={errores[`${prefijo}.hoja`]}
                    className="w-full"
                />
                <InputConError
                    placeholder="Inscripción *"
                    value={datoRegistral.inscripcion || ''}
                    onChange={e => setDatoRegistral({ ...datoRegistral, inscripcion: e.target.value })}
                    error={errores[`${prefijo}.inscripcion`]}
                    className="w-full"
                />
            </div>
            <InputConError
                placeholder="Notario *"
                value={datoRegistral.notario || ''}
                onChange={e => setDatoRegistral({ ...datoRegistral, notario: e.target.value })}
                error={errores[`${prefijo}.notario`]}
                className="w-full"
            />
            <InputConError
                type="date"
                placeholder="Fecha Inscripción *"
                value={datoRegistral.fecha_inscripcion || ''}
                onChange={e => setDatoRegistral({ ...datoRegistral, fecha_inscripcion: e.target.value })}
                error={errores[`${prefijo}.fecha_inscripcion`]}
                className="w-full"
            />
        </div>
    );
};

export default DatoRegistralForm;