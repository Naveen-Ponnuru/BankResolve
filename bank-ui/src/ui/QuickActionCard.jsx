import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const QuickActionCard = ({
  title,
  description,
  icon,
  link,
  onClick,
  bgColor = "bg-blue-50",
  darkBgColor = "dark:bg-blue-900",
  iconColor = "text-blue-600",
  darkIconColor = "dark:text-blue-400",
}) => {
  const content = (
    <div
      className={`${bgColor} ${darkBgColor} rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow cursor-pointer group`}
    >
      <div className="flex items-start space-x-4">
        <div className={`${iconColor} ${darkIconColor} text-2xl shrink-0`}>
          <FontAwesomeIcon icon={icon} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
            {title}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">
            {description}
          </p>
        </div>
        <div className="text-gray-400 dark:text-gray-500 text-lg shrink-0 group-hover:translate-x-1 transition">
          →
        </div>
      </div>
    </div>
  );

  if (link) {
    return <Link to={link}>{content}</Link>;
  }

  return <button onClick={onClick}>{content}</button>;
};

export default QuickActionCard;
