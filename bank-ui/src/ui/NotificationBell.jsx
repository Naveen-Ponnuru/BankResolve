import React, { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faCircle } from "@fortawesome/free-solid-svg-icons";
import apiClient from "../api/apiClient";
import { setNotifications, addNotification, markRead, markAllAsRead } from "../store/notification-slice";

const formatTime = (createdAt) => {
    if (!createdAt) return "";
    const diff = Math.floor((Date.now() - new Date(createdAt).getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
};

const NotificationBell = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((s) => s.auth);
    const { notifications, unreadCount } = useSelector((s) => s.notifications);
    const [isOpen, setIsOpen] = useState(false);
    const eventSourceRef = useRef(null);

    // Load initial notifications and subscribe to SSE
    useEffect(() => {
        if (!user?.id) return;

        // Fetch existing notifications
        apiClient.get(`/notifications/user/${user.id}`)
            .then((res) => dispatch(setNotifications(res.data)))
            .catch((err) => console.error("Failed to load notifications:", err));

        // Subscribe to SSE for live updates
        const token = localStorage.getItem("jwtToken");
        const url = `${import.meta.env.VITE_API_BASE_URL || "/api"}/notifications/subscribe/${user.id}`;
        const es = new EventSource(url + (token ? `?token=${token}` : ""));

        es.addEventListener("notification", (event) => {
            try {
                const notification = JSON.parse(event.data);
                dispatch(addNotification(notification));
            } catch {
                console.error("Failed to parse SSE notification");
            }
        });

        es.onerror = () => {
            console.warn("SSE connection lost. Will retry when network available.");
        };

        eventSourceRef.current = es;

        return () => {
            es.close();
        };
    }, [user?.id, dispatch]);

    const handleMarkAllRead = async () => {
        dispatch(markAllAsRead());
        // Fire-and-forget server updates
        notifications.filter((n) => !n.isRead).forEach((n) =>
            apiClient.put(`/notifications/${n.id}/read`).catch(() => { })
        );
    };

    const handleMarkOne = async (id) => {
        dispatch(markRead(id));
        apiClient.put(`/notifications/${id}/read`).catch(() => { });
    };



    const categoryIcon = (category) => {
        switch (category) {
            case "SLA_BREACH": return "🚨";
            case "GRIEVANCE_ESCALATED": return "⚠️";
            case "GRIEVANCE_RESOLVED": return "✅";
            default: return "🔔";
        }
    };

    return (
        <div className="relative">
            <button
                id="notification-bell-btn"
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
                    <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 z-50 overflow-hidden transform origin-top-right">
                        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50">
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                                Notifications {unreadCount > 0 && <span className="ml-1 text-xs bg-red-500 text-white rounded-full px-1.5">{unreadCount}</span>}
                            </h3>
                            {unreadCount > 0 && (
                                <button
                                    className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium cursor-pointer"
                                    onClick={handleMarkAllRead}
                                >
                                    Mark all read
                                </button>
                            )}
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                            {notifications.length > 0 ? (
                                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {notifications.map((n) => (
                                        <button
                                            key={n.id}
                                            type="button"
                                            onClick={() => handleMarkOne(n.id)}
                                            className={`w-full text-left flex px-4 py-3 transition-colors ${n.isRead
                                                    ? "hover:bg-gray-50 dark:hover:bg-gray-700/30"
                                                    : "bg-blue-50/50 dark:bg-blue-900/10 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                                }`}
                                        >
                                            <div className="flex-shrink-0 pt-0.5 text-base">{categoryIcon(n.category)}</div>
                                            <div className="ml-3 w-0 flex-1">
                                                <p className={`text-sm ${n.isRead ? "text-gray-600 dark:text-gray-400" : "font-medium text-gray-900 dark:text-white"}`}>
                                                    {n.message}
                                                </p>
                                                <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 uppercase">
                                                    {formatTime(n.createdAt)}
                                                </p>
                                            </div>
                                            {!n.isRead && (
                                                <FontAwesomeIcon icon={faCircle} className="text-blue-500 w-2 h-2 self-center ml-2 flex-shrink-0" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-6 text-center text-sm text-gray-500 dark:text-gray-400">
                                    <FontAwesomeIcon icon={faBell} className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                    <p>No notifications yet</p>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default NotificationBell;
