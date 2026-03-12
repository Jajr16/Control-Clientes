import ClienteForm from '../../components/forms/cliente/clienteForm';
import { clienteNuevo } from "../../api/clientes/clientes.js";
import { useFormSubmit } from "../../hooks/useFormSubmit";
import { limpiarDatosVacios } from '../../utils/limpiarDatos.js';

const AddClientesPage = () => {
    const { submit, loading } = useFormSubmit();

    const handleSubmit = async (data, setError) => {
        const normalized = limpiarDatosVacios(data)
        await submit({
            apiCall: clienteNuevo,
            data: normalized,
            setError,
            successMessage: "¡Cliente creado!",
            reload: true
        });
    };

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-2xl font-bold mb-4">Agregar Cliente</h1>
            <ClienteForm onSubmit={handleSubmit} loading={loading} />
        </div>
    );
};

export default AddClientesPage;