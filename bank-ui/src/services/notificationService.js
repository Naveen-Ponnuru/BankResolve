import apiClient from "../api/apiClient";
import SockJS from "sockjs-client";
import Stomp from "stompjs";

const notificationService = {
    /**
     * GET /api/notifications - Get current user notifications
     */
    getNotifications: async () => {
        const response = await apiClient.get("/notifications");
        return response.data;
    },

    /**
     * GET /api/notifications/unread-count - Get unread count
     */
    getUnreadCount: async () => {
        const response = await apiClient.get("/notifications/unread-count");
        return response.data;
    },

    /**
     * PUT /api/notifications/{id}/read - Mark as read
     */
    markAsRead: async (id) => {
        const response = await apiClient.put(`/notifications/${id}/read`);
        return response.data;
    },

    /**
     * PUT /api/notifications/read-all - Mark all as read
     */
    markAllAsRead: async () => {
        const response = await apiClient.put("/notifications/read-all");
        return response.data;
    },

    /**
     * WebSocket Subscription (STOMP over SockJS)
     */
    subscribe: (userId, onMessage) => {
        if (!userId) {
            console.warn("WebSocket: No userId provided for subscription.");
            return { disconnect: () => {} };
        }

        // Phase 7: Fixed Dynamic URL derivation (Fallback to localhost if needed)
        const baseUrl = apiClient.defaults.baseURL || "http://localhost:8080/api";
        const wsHost = baseUrl.replace("/api", "");
        const wsUrl = `${wsHost}/ws`;
        
        console.log(`WebSocket: Attempting connection to ${wsUrl} for user ${userId}`);
        
        const socket = new SockJS(wsUrl);
        const stompClient = Stomp.over(socket);
        let isActive = true;

        stompClient.debug = (str) => {
            // Only log if it's an error or important handshake
            if (str.includes("ERROR") || str.includes("CONNECTED")) {
                console.log("WebSocket Debug:", str);
            }
        };

        stompClient.connect({}, () => {
            if (!isActive) {
                stompClient.disconnect();
                return;
            }
            // Phase 7: Strict Path Sync - /topic/notifications/{id}
            const topic = `/topic/notifications/${userId}`;
            stompClient.subscribe(topic, (message) => {
                try {
                    console.log(`WebSocket: Payload received on ${topic}`);
                    if (message.body && isActive) {
                        onMessage(JSON.parse(message.body));
                    }
                } catch (e) {
                    console.error("WebSocket: Failed to parse message body", e);
                }
            });
            console.log(`WebSocket: Successfully subscribed to ${topic}`);
        }, (error) => {
            console.error("WebSocket: Connection failed or interrupted:", error);
        });

        return {
            disconnect: () => {
                isActive = false;
                console.log(`WebSocket: Disconnecting from ${wsUrl}`);
                if (stompClient.connected) {
                    stompClient.disconnect();
                } else {
                    try { socket.close(); } catch (e) {}
                }
            }
        };
    }
};

export default notificationService;
