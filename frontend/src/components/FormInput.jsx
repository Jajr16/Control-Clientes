import React from 'react';

const FormInput = ({ 
  label, 
  name, 
  value, 
  onChange, 
  readOnly = false, 
  required = true, 
  type = "text", 
  maxLength = null,
  error = null 
}) => (
  <div className="flex flex-col">
    <label htmlFor={name}>{label}</label>
    <input
      id={name}
      name={name}
      type={type}
      value={value !== undefined && value !== null ? value : ""}
      onChange={onChange}
      readOnly={readOnly}
      maxLength={maxLength || undefined}
      required={required}
      className={`w-full border rounded-md ${readOnly ? "bg-gray-100" : ""}
        ${error ? "border-red-500" : "border-gray-300"}`}
    />
  </div>
);

export default FormInput;