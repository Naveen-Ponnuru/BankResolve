import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    notifications: [],
};

const notificationSlice = createSlice({
    name: "notifications",
    initialState,
    reducers: {
        setNotifications: (state, action) => {
            state.notifications = action.payload;
        },
        addNotification: (state, action) => {
            const exists = state.notifications.some(n => n.id === action.payload.id);
            if (!exists) {
                state.notifications.unshift(action.payload);
            }
        },
        markRead: (state, action) => {
            const notification = state.notifications.find((n) => n.id === action.payload);
            if (notification) {
                notification.read = true;
            }
        },
        markAllAsRead: (state) => {
            state.notifications.forEach((n) => (n.read = true));
        },
    },
});

export const { setNotifications, addNotification, markRead, markAllAsRead } =
    notificationSlice.actions;

// Derived Selector: "No manual increment/decrement"
export const selectNotifications = (state) => state.notifications.notifications;
export const selectUnreadCount = (state) => 
    state.notifications.notifications.filter(n => !n.read).length;

export default notificationSlice.reducer;
