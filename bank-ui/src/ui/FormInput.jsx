import React from "react";

const FormInput = React.forwardRef(
    (
        {
            label,
            id,
            name,
            type = "text",
            placeholder = "",
            error = null,
            required = false,
            pattern,
            minLength,
            maxLength,
            className = "",
            ...props
        },
        ref
    ) => {
        const inputId = id || name;

        return (
            <div className={`w-full ${className}`}>
                {label && (
                    <label
                        htmlFor={inputId}
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                        {label} {required && <span className="text-red-500">*</span>}
                    </label>
                )}
                <div className="relative">
                    <input
                        ref={ref}
                        id={inputId}
                        name={name}
                        type={type}
                        placeholder={placeholder}
                        required={required}
                        pattern={pattern}
                        minLength={minLength}
                        maxLength={maxLength}
                        aria-invalid={!!error}
                        aria-describedby={error ? `${inputId}-error` : undefined}
                        className={`w-full px-4 py-2 border rounded-lg shadow-sm transition-all duration-200 
              focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none
              bg-white dark:bg-gray-800 text-gray-900 dark:text-white
              placeholder-gray-400 dark:placeholder-gray-500
              ${error
                                ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                                : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
                            }`}
                        {...props}
                    />
                </div>
                {error && (
                    <p
                        id={`${inputId}-error`}
                        className="mt-1.5 text-sm text-red-600 dark:text-red-400 font-medium"
                        role="alert"
                    >
                        {error}
                    </p>
                )}
            </div>
        );
    }
);

FormInput.displayName = "FormInput";

export default FormInput;
