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
        const socket = new SockJS("http://localhost:8080/ws");
        const stompClient = Stomp.over(socket);
        let isActive = true;

        // Turn off debug logging in production
        stompClient.debug = null;

        stompClient.connect({}, () => {
            if (!isActive) {
                stompClient.disconnect();
                return;
            }
            const topic = `/topic/notifications/${userId}`;
            stompClient.subscribe(topic, (message) => {
                console.log(`DEBUG: Notification received on WS for topic ${topic}:`, message.body);
                if (message.body && isActive) {
                    onMessage(JSON.parse(message.body));
                }
            });
            console.log(`WebSocket: Subscribed to ${topic}`);
        }, (error) => {
            console.error("WebSocket Connection Error:", error);
        });

        return {
            disconnect: () => {
                isActive = false;
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
