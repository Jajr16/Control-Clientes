export function Label({ htmlFor, children }) {
    return (
      <label htmlFor={htmlFor} className="text-base block my-1 text-amber-950">
        {children}
      </label>
    );
  }