import React from "react";
import EmptyState from "./EmptyState";
import Loader from "./Loader";

const DataTable = ({
    columns,
    data,
    isLoading = false,
    emptyStateProps = {},
    onRowClick = null,
    keyField = "id"
}) => {
    if (isLoading) {
        return (
            <div className="w-full bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 flex justify-center">
                <Loader size="md" text="Loading records..." />
            </div>
        );
    }

    if (!data || data.length === 0) {
        return <EmptyState {...emptyStateProps} />;
    }

    return (
        <div className="w-full bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-900/50">
                        <tr>
                            {columns.map((col, index) => (
                                <th
                                    key={index}
                                    scope="col"
                                    className={`px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 tracking-wider uppercase ${col.headerClassName || ''}`}
                                >
                                    {col.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {data.map((row, rowIndex) => (
                            <tr
                                key={row[keyField] || rowIndex}
                                onClick={onRowClick ? () => onRowClick(row) : undefined}
                                className={`transition-colors duration-150 ${onRowClick
                                        ? "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50"
                                        : "hover:bg-gray-50/50 dark:hover:bg-gray-700/30"
                                    }`}
                            >
                                {columns.map((col, colIndex) => (
                                    <td
                                        key={colIndex}
                                        className={`px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 ${col.cellClassName || ''}`}
                                    >
                                        {col.accessor ? col.accessor(row) : row[col.field]}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DataTable;
