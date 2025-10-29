const InputConError = ({ 
    error, 
    className = "", 
    ...props 
}) => {
    return (
        <div className="w-full">
            <input 
                className={`border p-2 rounded ${error ? 'border-red-500 bg-red-50' : 'border-gray-300'} ${className}`}
                {...props}
            />
            {error && (
                <p className="text-red-500 text-xs mt-1">{error}</p>
            )}
        </div>
    );
};

export default InputConError;