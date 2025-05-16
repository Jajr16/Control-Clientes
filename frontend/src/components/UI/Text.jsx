export function Text({ children, className, ...props }) {
    return (
        <span
            {...props}
            className={`w-full bg-amber-900 text-amber-50 px-4 py-2 rounded-md ${className}`}
        >
            {children}
        </span>
    );
}
