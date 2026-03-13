import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./auth-slice";
import bankReducer from "./bankSlice";
import notificationReducer from "./notification-slice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    bank: bankReducer,
    notifications: notificationReducer,
  },
});

// persist auth state similarly to ecommerce project
store.subscribe(() => {
  try {
    const authState = store.getState().auth;
    if (authState.isAuthenticated) {
      localStorage.setItem("jwtToken", authState.jwtToken);
      localStorage.setItem("user", JSON.stringify(authState.user));
    } else {
      localStorage.removeItem("jwtToken");
      localStorage.removeItem("user");
    }
  } catch (e) {
    console.error("Failed to persist auth state", e);
  }
});

export default store;
