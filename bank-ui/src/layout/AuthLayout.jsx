import React from "react";
import { Outlet } from "react-router-dom";

// AuthLayout provides a specialized wrapper for Login, Register, Forgot Password
// It doesn't need the main App navbar/footer, perhaps just a simple centered card layout.

const AuthLayout = () => {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors duration-200">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
                    Bank Grievance System
                </h2>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-100 dark:border-gray-700">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;
