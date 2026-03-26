import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faCheckDouble, faCircle } from "@fortawesome/free-solid-svg-icons";
import notificationService from "../services/notificationService";
import { toast } from "react-toastify";
import { useSelector, useDispatch } from "react-redux";
import { selectUser } from "../store/auth-slice";
import { setNotifications, addNotification, markRead, markAllAsRead, selectUnreadCount } from "../store/notification-slice";
import { getThemeClasses } from "../utils/themeUtils";

const selectToken = (state) => state.auth?.jwtToken || null;

const NotificationBell = () => {
    const dispatch = useDispatch();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    
    const user = useSelector(selectUser);
    const token = useSelector(selectToken);
    const notifications = useSelector((state) => state.notifications.notifications);
    const unreadCount = useSelector(selectUnreadCount);

    const theme = getThemeClasses(user?.bankTheme || 'blue');

    const hasFetchedRef = useRef(false);

    const fetchNotifications = async (force = false) => {
        // Prevent over-fetching: if Redux has notifications or we already fetched, skip unless forced.
        if (!force && (hasFetchedRef.current || notifications.length > 0)) return;
        
        try {
            hasFetchedRef.current = true;
            const data = await notificationService.getNotifications();
            dispatch(setNotifications(data));
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
            hasFetchedRef.current = false;
        }
    };

    // Multi-tab synchronization and Reconciliation (Phase 14)
    useEffect(() => {
        const handleStorageChange = (e) => {
            if (e.key === "bankresolve_notifications_sync") {
                fetchNotifications(true);
            }
        };

        const handleFocus = () => {
            console.log("NotificationBell: App focused, reconciling state...");
            fetchNotifications(true);
        };

        window.addEventListener("storage", handleStorageChange);
        window.addEventListener("focus", handleFocus);
        
        // Tertiary safety net: Reconcile every 60 seconds for background tabs
        const intervalId = setInterval(() => {
            fetchNotifications(true);
        }, 60000);

        return () => {
            window.removeEventListener("storage", handleStorageChange);
            window.removeEventListener("focus", handleFocus);
            clearInterval(intervalId);
        };
    }, []);

    const isSubscribedRef = useRef(false);
    const subscriptionRef = useRef(null);

    const isInitialized = useSelector((state) => state.auth?.isInitialized);

    useEffect(() => {
        // 🛑 STRICT GUARD: Wait for full hydration and valid credentials
        if (!isInitialized || !user?.id || !token) {
            if (subscriptionRef.current) {
                subscriptionRef.current.disconnect();
                subscriptionRef.current = null;
                isSubscribedRef.current = false;
            }
            return;
        }

        // Prevent duplicate subscriptions across re-renders/StrictMode mounts
        const currentSubKey = `${user.id}`;
        if (isSubscribedRef.current === currentSubKey) return;
        
        // Cleanup logic for stale subscriptions
        if (subscriptionRef.current) {
            subscriptionRef.current.disconnect();
        }

        isSubscribedRef.current = currentSubKey;
        console.log(`NotificationBell: Initiating subscription for user ${user.id}`);
        
        // Initial fetch sync
        fetchNotifications();

        subscriptionRef.current = notificationService.subscribe(user.id, (newNotif, pollData) => {
            if (pollData && Array.isArray(pollData)) {
                dispatch(setNotifications(pollData));
                return;
            }
            if (newNotif && !newNotif.read) {
                dispatch(addNotification(newNotif));
                toast.info(`🔔 ${newNotif.message}`, { 
                    toastId: `notif-${newNotif.id}`,
                    position: "top-center",
                    autoClose: 5000
                });
            }
        }, token, () => {
            // ✅ FIX 3: On successful WebSocket connect, fetch from DB to catch missed events
            console.log("NotificationBell: WebSocket connected — reconciling with DB...");
            fetchNotifications(true);
        });

        return () => {
            if (subscriptionRef.current) {
                subscriptionRef.current.disconnect();
                subscriptionRef.current = null;
            }
            isSubscribedRef.current = false;
        };
    }, [user?.id, token, isInitialized]); // Added necessary dependencies for stability

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                if (!document.body.contains(event.target)) return;
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleMarkAsRead = async (e, id) => {
        e.stopPropagation();
        e.preventDefault();
        try {
            // Phase 8: Enterprise stability - update UI instantly and sync across tabs
            await notificationService.markAsRead(id);
            dispatch(markRead(id));
            localStorage.setItem("bankresolve_notifications_sync", Date.now().toString());
        } catch (error) {
            console.error("Failed to mark as read:", error);
            toast.error("Failed to update notification status");
        }
    };

    const getTypeIcon = (type) => {
        if (type?.includes("RESOLVED")) return "text-green-500";
        if (type?.includes("WITHDRAWN")) return "text-gray-400";
        if (type?.includes("STATUS") || type?.includes("CREATED")) return "text-blue-500";
        return "text-blue-400";
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition relative"
                aria-label="Notifications"
            >
                <FontAwesomeIcon icon={faBell} className="text-gray-600 dark:text-gray-300" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white border-2 border-white dark:border-gray-900">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className={`absolute right-0 mt-2 w-84 ${theme.glass} rounded-2xl shadow-2xl z-[60] overflow-hidden flex flex-col max-h-[480px] animate-in fade-in zoom-in duration-200`}>
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50">
                        <span className="text-sm font-bold text-gray-900 dark:text-white">Notifications</span>
                        <div className="flex items-center space-x-2">
                            <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400">
                                {unreadCount} Unread
                            </span>
                        </div>
                    </div>

                    <div className="overflow-y-auto flex-1 divide-y divide-gray-50 dark:divide-gray-700">
                        {notifications.length === 0 ? (
                            <div className="px-4 py-6 text-center">
                                <p className="text-sm text-gray-500 dark:text-gray-400">No notifications yet</p>
                            </div>
                        ) : (
                            notifications
                                .slice(0, 15)
                                .map((n) => (
                                <div 
                                    key={n.id} 
                                    className={`px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group relative ${!n.read ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}`}
                                >
                                    <div className="flex items-start space-x-3">
                                        <div className={`mt-1 flex-shrink-0 ${getTypeIcon(n.type)}`}>
                                            <FontAwesomeIcon icon={faCircle} className="h-2 w-2" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-xs leading-relaxed ${!n.read ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                                                {n.message}
                                            </p>
                                            <p className="text-[10px] text-gray-400 mt-1 uppercase font-medium">
                                                {n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Recently"}
                                            </p>
                                        </div>
                                        {!n.read && (
                                            <button 
                                                onClick={(e) => handleMarkAsRead(e, n.id)}
                                                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-blue-500 hover:text-blue-600"
                                                title="Mark as read"
                                            >
                                                <FontAwesomeIcon icon={faCheckDouble} className="text-[10px]" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 text-center">
                        <button 
                            onClick={async () => {
                                // 1. Immediately zero out the badge in Redux (optimistic update)
                                dispatch(markAllAsRead());
                                try {
                                    // 2. Persist to backend
                                    await notificationService.markAllAsRead();
                                    // 3. Re-sync from server to confirm truth and notify other tabs
                                    await fetchNotifications(true);
                                    localStorage.setItem("bankresolve_notifications_sync", Date.now().toString());
                                    toast.success("All notifications marked as read", { autoClose: 2000 });
                                } catch (e) {
                                    console.error("Could not mark all as read", e);
                                    // 4. On error, re-fetch to restore correct state
                                    await fetchNotifications();
                                    toast.error("Could not mark all as read. Please try again.");
                                } finally {
                                    setIsOpen(false);
                                }
                            }}
                            className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest hover:underline w-full py-1"
                        >
                            Mark All As Read
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
