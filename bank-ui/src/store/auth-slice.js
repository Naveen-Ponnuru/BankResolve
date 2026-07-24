import { createSlice } from "@reduxjs/toolkit";

// ─── Helpers ────────────────────────────────────────────────────────────────
const safeSet = (key, value) => {
  try {
    localStorage.setItem(
      key,
      typeof value === "string" ? value : JSON.stringify(value),
    );
  } catch (e) {
    console.warn("[auth-slice] localStorage write failed:", key, e);
  }
};

const safeParse = (key) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

// ─── Initial State (hydrate from localStorage) ───────────────────────────────
const token = safeParse("jwtToken") || localStorage.getItem("jwtToken");
const parsedUser = safeParse("user");

const initialAuthState = {
  jwtToken: token,
  user: parsedUser,
  isAuthenticated: !!token && !!parsedUser,
  isInitialized: false, // Hydration guard
};

// ─── Slice ──────────────────────────────────────────────────────────────────
const authSlice = createSlice({
  name: "auth",
  initialState: initialAuthState,
  reducers: {
    loginSuccess(state, action) {
      const { jwtToken, user } = action.payload;
      state.jwtToken = jwtToken;
      state.user = user;
      state.isAuthenticated = true;

      localStorage.setItem("jwtToken", jwtToken);
      localStorage.setItem("user", JSON.stringify(user));

      console.log("AUTH STATE:", state);
    },

    logout(state) {
      state.jwtToken = null;
      state.user = null;
      state.isAuthenticated = false;

      localStorage.removeItem("jwtToken");
      localStorage.removeItem("user");
    },

    initializeAuth(state) {
      state.isInitialized = true;
    },

    // Optional: update user profile without re-login
    updateUser(state, action) {
      state.user = { ...state.user, ...action.payload };
      safeSet("user", state.user);
    },
  },
});

export const { loginSuccess, logout, updateUser, initializeAuth } = authSlice.actions;
export default authSlice.reducer;

// ─── Selectors ───────────────────────────────────────────────────────────────
export const selectJwtToken = (state) => state.auth.jwtToken;
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectIsInitialized = (state) => state.auth.isInitialized;

