import React from "react";
import { Link } from "react-router-dom";

export default function Unauthorized() {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100">
          Unauthorized
        </h1>
        <p className="mt-4 text-gray-600 dark:text-gray-400">
          You do not have permission to view this page.
        </p>
        <Link
          to="/"
          className="mt-6 inline-block text-blue-600 dark:text-blue-400 hover:underline"
        >
          Go to login
        </Link>
      </div>
    </div>
  );
}
