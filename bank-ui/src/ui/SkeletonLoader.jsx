import React from "react";

/**
 * SkeletonLoader handles Suspense fallbacks and async loading states 
 * for Dashboard cards, DataTables, and Forms.
 */
const SkeletonLoader = ({ type = "card", count = 1 }) => {
    const CardSkeleton = () => (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex flex-col justify-between animate-pulse">
            <div className="flex items-center space-x-4 mb-4">
                <div className="rounded-full bg-gray-200 dark:bg-gray-700 h-12 w-12"></div>
                <div className="flex-1 space-y-2 py-1">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
            </div>
        </div>
    );

    const TableSkeleton = () => (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 w-full animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
            <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-4">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/5"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/6"></div>
                        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-20"></div>
                    </div>
                ))}
            </div>
        </div>
    );

    const FormSkeleton = () => (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 w-full max-w-2xl mx-auto animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-8"></div>
            <div className="space-y-6">
                <div className="space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                </div>
                <div className="space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                    <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                </div>
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-1/4 self-end ml-auto mt-4"></div>
            </div>
        </div>
    );

    if (type === "table") {
        return <TableSkeleton />;
    }

    if (type === "form") {
        return <FormSkeleton />;
    }

    // Default to cards grid
    return (
        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${Math.min(count, 4)} gap-6 w-full`}>
            {Array.from({ length: count }).map((_, idx) => (
                <CardSkeleton key={idx} />
            ))}
        </div>
    );
};

export default SkeletonLoader;
