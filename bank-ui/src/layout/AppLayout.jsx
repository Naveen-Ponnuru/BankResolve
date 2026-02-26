import React from "react";
import { Outlet, useNavigation } from "react-router-dom";

const AppLayout = () => {
    const navigation = useNavigation();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200">
            {navigation.state === "loading" ? (
                <div className="flex items-center justify-center min-h-screen">
                    <div className="flex flex-col items-center">
                        <svg
                            className="animate-spin h-10 w-10 text-blue-600 dark:text-blue-400 mb-4"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                            ></circle>
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                        </svg>
                        <span className="text-xl font-medium">Loading Application...</span>
                    </div>
                </div>
            ) : (
                <Outlet />
            )}
        </div>
    );
};

export default AppLayout;
