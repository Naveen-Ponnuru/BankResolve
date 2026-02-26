import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const KPICard = ({
  title,
  value,
  icon,
  bgColor = "bg-blue-50",
  iconBgColor = "bg-blue-100",
  iconColor = "text-blue-600",
  darkBgColor = "dark:bg-blue-900",
  darkIconBgColor = "dark:bg-blue-800",
  darkIconColor = "dark:text-blue-400",
  trend,
  trendUp = true,
  subtitle,
}) => {
  return (
    <div
      className={`${bgColor} ${darkBgColor} rounded-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow`}
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">
            {title}
          </p>
          <p className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {subtitle}
            </p>
          )}
          {trend && (
            <div
              className={`text-sm mt-2 ${trendUp ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
            >
              {trendUp ? "↑" : "↓"} {trend}
            </div>
          )}
        </div>
        <div
          className={`${iconBgColor} ${darkIconBgColor} ${iconColor} ${darkIconColor} p-3 rounded-lg`}
        >
          <FontAwesomeIcon icon={icon} className="text-2xl" />
        </div>
      </div>
    </div>
  );
};

export default KPICard;
