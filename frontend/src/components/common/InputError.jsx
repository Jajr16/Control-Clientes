import { useFormContext, get } from "react-hook-form";
import { useMemo } from "react";

const InputConError = ({ name, className = "", registerOptions = {}, ...props }) => {
    const { register, formState: { errors } } = useFormContext();
    const error = get(errors, name);

    const inputProps = register(name, {
        ...registerOptions,
        setValueAs: (value) => value === "" ? undefined : value
    });

    return (
        <div className="w-full">
            <input
                {...inputProps}
                {...props}
                className={`border p-2 rounded ${className} ${error ? 'border-red-500' : 'border-gray-300'}`}
            />

            {error && (
                <p className="text-red-500 text-xs mt-1">
                    {error?.message}
                </p>
            )}
        </div>
    );
};

export default InputConError;