import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";

const FormSelect = React.forwardRef(
    (
        {
            label,
            id,
            name,
            options = [],
            placeholder = "Select an option",
            error = null,
            required = false,
            className = "",
            ...props
        },
        ref
    ) => {
        const selectId = id || name;

        return (
            <div className={`w-full ${className}`}>
                {label && (
                    <label
                        htmlFor={selectId}
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                        {label} {required && <span className="text-red-500">*</span>}
                    </label>
                )}
                <div className="relative">
                    <select
                        ref={ref}
                        id={selectId}
                        name={name}
                        required={required}
                        aria-invalid={!!error}
                        aria-describedby={error ? `${selectId}-error` : undefined}
                        className={`w-full px-4 py-2 pr-10 border rounded-lg shadow-sm transition-all duration-200 
              appearance-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none
              bg-white dark:bg-gray-800 text-gray-900 dark:text-white
              ${error
                                ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                                : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
                            }`}
                        {...props}
                    >
                        {placeholder && (
                            <option value="" disabled className="text-gray-500">
                                {placeholder}
                            </option>
                        )}
                        {options.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500 dark:text-gray-400 border-l border-transparent">
                        <FontAwesomeIcon icon={faChevronDown} className="w-3 h-3" />
                    </div>
                </div>
                {error && (
                    <p
                        id={`${selectId}-error`}
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

FormSelect.displayName = "FormSelect";

export default FormSelect;
