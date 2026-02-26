import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell } from "@fortawesome/free-regular-svg-icons";
import { faCircle } from "@fortawesome/free-solid-svg-icons";

const NotificationBell = ({ unreadCount = 3 }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors focus:outline-none rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="View notifications"
                aria-expanded={isOpen}
            >
                <FontAwesomeIcon icon={faBell} className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1.5 flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 border border-white dark:border-gray-800"></span>
                    </span>
                )}
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                        aria-hidden="true"
                    />
                    <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 z-50 overflow-hidden transform origin-top-right animate-fade-in-up">
                        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50">
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Notifications</h3>
                            <button
                                className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium cursor-pointer"
                                onClick={() => setIsOpen(false)}
                            >
                                Mark all as read
                            </button>
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                            {unreadCount > 0 ? (
                                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                                    <a href="#" className="flex px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <div className="flex-shrink-0 pt-1">
                                            <FontAwesomeIcon icon={faCircle} className="text-blue-500 w-2 h-2" />
                                        </div>
                                        <div className="ml-3 w-0 flex-1">
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">Status Updated</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Your grievance #GRV-2026-123 has been marked as IN PROGRESS.</p>
                                            <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 uppercase">2 mins ago</p>
                                        </div>
                                    </a>
                                    <a href="#" className="flex px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <div className="flex-shrink-0 pt-1">
                                            <FontAwesomeIcon icon={faCircle} className="text-blue-500 w-2 h-2" />
                                        </div>
                                        <div className="ml-3 w-0 flex-1">
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">Staff Assigned</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Jane Doe was assigned to your case.</p>
                                            <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 uppercase">1 hour ago</p>
                                        </div>
                                    </a>
                                </div>
                            ) : (
                                <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                                    No new notifications
                                </div>
                            )}
                        </div>
                        <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700 text-center bg-gray-50/50 dark:bg-gray-900/50">
                            <a href="#" className="text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                                View all notifications
                            </a>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default NotificationBell;
