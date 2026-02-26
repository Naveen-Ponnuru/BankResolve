import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleCheck, faClock, faSpinner, faCircleExclamation } from "@fortawesome/free-solid-svg-icons";

// Map standard status strings to visual themes
const STATUS_CONFIG = {
    PENDING: {
        color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800",
        icon: faClock,
    },
    IN_PROGRESS: {
        color: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-400 border-blue-200 dark:border-blue-800",
        icon: faSpinner,
    },
    RESOLVED: {
        color: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400 border-green-200 dark:border-green-800",
        icon: faCircleCheck,
    },
    REJECTED: {
        color: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-400 border-red-200 dark:border-red-800",
        icon: faCircleExclamation,
    },
    DEFAULT: {
        color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700",
        icon: null,
    }
};

const StatusBadge = ({ status, className = "" }) => {
    const normalizedStatus = status?.toUpperCase().replace(/\s+/g, '_') || "DEFAULT";
    const config = STATUS_CONFIG[normalizedStatus] || STATUS_CONFIG.DEFAULT;

    return (
        <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.color} ${className}`}
            role="status"
        >
            {config.icon && (
                <FontAwesomeIcon icon={config.icon} className="w-3 h-3 mr-1.5" aria-hidden="true" />
            )}
            {status || "Unknown"}
        </span>
    );
};

export default StatusBadge;
