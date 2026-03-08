import { useFormContext, get } from "react-hook-form";

const InputConError = ({ name, className = "", ...props }) => {
    const { register, formState: { errors } } = useFormContext();

    const error = get(errors, name);

    return (
        <div className="w-full">
            <input
                {...register(name)}
                {...props}
                className={`border p-2 rounded ${className}`}
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