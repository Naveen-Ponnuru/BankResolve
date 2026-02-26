import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const DashboardCard = ({ title, value, icon, trend, trendValue, color = "blue", isLoading = false }) => {
    const colorMap = {
        blue: "text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/50",
        green: "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/50",
        yellow: "text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/50",
        red: "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/50",
        purple: "text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/50",
    };

    const iconClasses = colorMap[color] || colorMap.blue;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex items-center transition-transform hover:scale-[1.02] duration-200">
            <div className={`p-4 rounded-full mr-5 flex-shrink-0 ${iconClasses}`}>
                {icon && <FontAwesomeIcon icon={icon} className="w-6 h-6" />}
            </div>
            <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                    {title}
                </h3>
                {isLoading ? (
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse mt-1"></div>
                ) : (
                    <div className="flex items-baseline">
                        <span className="text-3xl font-bold text-gray-900 dark:text-white">
                            {value}
                        </span>
                        {trend && (
                            <span className={`ml-3 text-sm font-medium ${trend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                {trend === 'up' ? '↑' : '↓'} {trendValue}
                            </span>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DashboardCard;
