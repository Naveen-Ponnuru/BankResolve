import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faHourglassHalf,
  faExclamationCircle,
  faXmarkCircle,
} from "@fortawesome/free-solid-svg-icons";

const StatusBadgeWithLabel = ({ status, label, size = "md" }) => {
  const statusConfig = {
    open: {
      color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      icon: faExclamationCircle,
      label: "Open",
    },
    "in-progress": {
      color:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      icon: faHourglassHalf,
      label: "In Progress",
    },
    resolved: {
      color:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      icon: faCheckCircle,
      label: "Resolved",
    },
    closed: {
      color: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
      icon: faXmarkCircle,
      label: "Closed",
    },
  };

  const config = statusConfig[status?.toLowerCase()] || statusConfig.open;
  const sizeClass =
    size === "sm"
      ? "px-2 py-1 text-xs"
      : size === "lg"
        ? "px-4 py-2 text-base"
        : "px-3 py-1.5 text-sm";

  return (
    <div
      className={`${config.color} rounded-full ${sizeClass} font-semibold flex items-center space-x-1 w-fit`}
    >
      <FontAwesomeIcon icon={config.icon} className="text-sm" />
      <span>{label || config.label}</span>
    </div>
  );
};

export default StatusBadgeWithLabel;
