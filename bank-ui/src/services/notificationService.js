import apiClient from "../api/apiClient";
import SockJS from "sockjs-client";
import Stomp from "stompjs";

const notificationService = {
    getNotifications: async (unreadOnly = false) => {
        const response = await apiClient.get("/notifications", { params: { unreadOnly } });
        return response.data;
    },

    /**
     * GET /api/notifications/paged - Paginated notifications
     */
    getNotificationsPaged: async (page = 0, size = 10, unreadOnly = false) => {
        try {
            const response = await apiClient.get("/notifications/paged", { 
                params: { page, size, unreadOnly } 
            });
            return response.data; // Page object
        } catch (error) {
            console.error("API ERROR (getNotificationsPaged):", error.response || error.message);
            throw error;
        }
    },

    getUnreadCount: async () => {
        const response = await apiClient.get("/notifications/unread-count");
        return response.data;
    },

    markAsRead: async (id) => {
        const response = await apiClient.put(`/notifications/${id}/read`);
        return response.data;
    },

    markAllAsRead: async () => {
        const response = await apiClient.put("/notifications/read-all");
        return response.data;
    },

    // Module-level state for Singleton pattern
    _activeSubscriptions: new Map(),

    /**
     * Enterprise WebSocket Subscription with:
     * - Automatic reconnection (simplified fallback)
     * - Multi-listener safety (Set of callbacks per userId)
     * - Singleton connection per userId
     * - JWT Authorization header on STOMP handshake
     */
    subscribe: (userId, onMessage, token, onConnected) => {
        if (!userId) {
            console.warn("WebSocket: No userId provided for subscription.");
            return { disconnect: () => {} };
        }

        const subKey = String(userId);
        
        // If already connected/connecting, just add listener
        if (notificationService._activeSubscriptions.has(subKey)) {
            const sub = notificationService._activeSubscriptions.get(subKey);
            sub.listeners.add(onMessage);
            return {
                disconnect: () => {
                    sub.listeners.delete(onMessage);
                    if (sub.listeners.size === 0) {
                        sub.isActive = false;
                        if (sub.stompClient && sub.stompClient.connected) {
                            sub.stompClient.disconnect();
                        }
                        notificationService._activeSubscriptions.delete(subKey);
                        console.log(`WebSocket: Fully disconnected for user ${userId}`);
                    }
                }
            };
        }

        // Initialize new subscription tracking
        const sub = {
            isActive: true,
            listeners: new Set([onMessage]),
            stompClient: null,
            isConnecting: false,
            onConnected: onConnected || null, // ✅ FIX 3: Fallback fetch callback
        };
        notificationService._activeSubscriptions.set(subKey, sub);

        const baseUrl = apiClient.defaults.baseURL || "http://localhost:8080/api";
        const wsHost = baseUrl.replace("/api", "");
        const wsUrl = `${wsHost}/ws`;
        const topic = `/user/queue/notifications`; // ✅ STRICT: Private User Queue

        const connect = () => {
            if (!sub.isActive) return;
            if (sub.isConnecting) return;
            
            // 🛑 FINAL GUARD: No token = No connection
            if (!token) {
                console.warn("WebSocket: Connection aborted — No token available.");
                sub.isActive = false;
                notificationService._activeSubscriptions.delete(subKey);
                return;
            }

            sub.isConnecting = true;

            const socket = new SockJS(wsUrl);
            sub.stompClient = Stomp.over(socket);

            // Suppress debug noise; keep only CONNECTED and ERROR
            sub.stompClient.debug = (str) => {
                if (str.includes("ERROR") || str.includes("CONNECTED")) {
                    console.log("WebSocket Debug:", str);
                }
            };

            // 10s heartbeats for early drop detection
            sub.stompClient.heartbeat = { outgoing: 10000, incoming: 10000 };

            const headers = { Authorization: `Bearer ${token}` };

            sub.stompClient.connect(headers, () => {
                sub.isConnecting = false;
                if (!sub.isActive) { sub.stompClient.disconnect(); return; }
                console.log(`WebSocket: Connected to private queue for user ${userId}`);

                // ✅ FIX 3: Fallback fetch on connect — covers events missed during connection gap
                if (sub.onConnected) {
                    try { sub.onConnected(); } catch (e) { console.warn("WebSocket: onConnected callback error", e); }
                }

                sub.stompClient.subscribe(topic, (message) => {
                    try {
                        if (message.body && sub.isActive) {
                            const parsed = JSON.parse(message.body);
                            // Notify all registered listeners
                            sub.listeners.forEach(listener => listener(parsed));
                        }
                    } catch (e) {
                        console.error("WebSocket: Failed to parse message body", e);
                    }
                });
            }, (error) => {
                sub.isConnecting = false;
                console.error(`WebSocket: Connection error for user ${userId}:`, error);
                
                // If 401/403, do not retry
                if (error?.headers?.message?.includes("AccessDenied") || error?.command === "ERROR") {
                    console.error("WebSocket: AUTHENTICATION REJECTED. Stopping connection.");
                    sub.isActive = false;
                    notificationService._activeSubscriptions.delete(subKey);
                    return;
                }

                if (!sub.isActive) return;
                console.warn("WebSocket: Connection failed. Auto-reconnect disabled.");
            });
        };

        connect();

        return {
            disconnect: () => {
                sub.listeners.delete(onMessage);
                if (sub.listeners.size === 0) {
                    sub.isActive = false;
                    if (sub.stompClient && sub.stompClient.connected) {
                        sub.stompClient.disconnect();
                    }
                    notificationService._activeSubscriptions.delete(subKey);
                    console.log(`WebSocket: Fully disconnected for user ${userId}`);
                }
            }
        };
    }
};

export default notificationService;
