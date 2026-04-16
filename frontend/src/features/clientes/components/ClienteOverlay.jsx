const ClienteOverlay = ({ loading }) => {

    if (!loading) return null;

    return (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-4 rounded-lg">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"/>
                <p className="mt-2 text-gray-700">Procesando...</p>
            </div>
        </div>
    );
};

export default ClienteOverlay;