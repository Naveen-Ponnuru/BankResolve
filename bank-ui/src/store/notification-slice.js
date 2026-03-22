import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    notifications: [],
    unreadCount: 0,
};

const notificationSlice = createSlice({
    name: "notifications",
    initialState,
    reducers: {
        setNotifications: (state, action) => {
            state.notifications = action.payload;
            state.unreadCount = action.payload.filter((n) => !n.isRead).length;
        },
        addNotification: (state, action) => {
            const exists = state.notifications.some(n => n.id === action.payload.id);
            if (!exists) {
                // Add the new notification at the top of the list
                state.notifications.unshift(action.payload);
                if (!action.payload.isRead) {
                    state.unreadCount += 1;
                }
            }
        },
        markRead: (state, action) => {
            const notification = state.notifications.find((n) => n.id === action.payload);
            if (notification && !notification.isRead) {
                notification.isRead = true;
                state.unreadCount = Math.max(0, state.unreadCount - 1);
            }
        },
        markAllAsRead: (state) => {
            state.notifications.forEach((n) => (n.isRead = true));
            state.unreadCount = 0;
        },
    },
});

export const { setNotifications, addNotification, markRead, markAllAsRead } =
    notificationSlice.actions;

export default notificationSlice.reducer;
