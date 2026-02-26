import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

const Loader = ({ size = "lg", fullScreen = false, text = "Loading..." }) => {
    const sizeMap = {
        sm: "w-4 h-4 text-sm",
        md: "w-6 h-6 text-base",
        lg: "w-10 h-10 text-xl",
    };

    const content = (
        <div className="flex flex-col items-center justify-center space-y-3">
            <FontAwesomeIcon
                icon={faSpinner}
                spin
                className={`${sizeMap[size] || sizeMap.md} text-blue-600 dark:text-blue-400`}
                aria-hidden="true"
            />
            {text && (
                <span className="text-gray-600 dark:text-gray-300 font-medium">
                    {text}
                </span>
            )}
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-sm z-50">
                {content}
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center w-full h-full min-h-[100px]">
            {content}
        </div>
    );
};

export default Loader;
