import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFolderOpen } from "@fortawesome/free-regular-svg-icons";

const EmptyState = ({
    title = "No data available",
    description = "There is nothing to display here at the moment.",
    icon = faFolderOpen,
    actionButton = null
}) => {
    return (
        <div className="flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 border-dashed">
            <div className="h-16 w-16 bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 rounded-full flex items-center justify-center mb-4">
                <FontAwesomeIcon icon={icon} className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                {title}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-6">
                {description}
            </p>
            {actionButton && (
                <div>{actionButton}</div>
            )}
        </div>
    );
};

export default EmptyState;
