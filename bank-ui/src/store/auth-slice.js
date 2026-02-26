import { createSlice } from "@reduxjs/toolkit";

// ─── Helpers ────────────────────────────────────────────────────────────────
const safeSet = (key, value) => {
  try {
    localStorage.setItem(key, typeof value === "string" ? value : JSON.stringify(value));
  } catch (e) {
    console.warn("[auth-slice] localStorage write failed:", key, e);
  }
};

const safeRemove = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (e) { }
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
const jwtToken = localStorage.getItem("jwtToken") || null;
const parsedUser = safeParse("user");

const initialAuthState = {
  jwtToken,
  user: parsedUser,
  isAuthenticated: !!jwtToken,
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

      // ✅ CRITICAL: Persist to localStorage so refresh doesn't lose session
      safeSet("jwtToken", jwtToken);
      safeSet("user", user);
    },

    logout(state) {
      state.jwtToken = null;
      state.user = null;
      state.isAuthenticated = false;

      // ✅ Clear all auth-related storage
      safeRemove("jwtToken");
      safeRemove("user");
    },

    // Optional: update user profile without re-login
    updateUser(state, action) {
      state.user = { ...state.user, ...action.payload };
      safeSet("user", state.user);
    },
  },
});

export const { loginSuccess, logout, updateUser } = authSlice.actions;
export default authSlice.reducer;

// ─── Selectors ───────────────────────────────────────────────────────────────
export const selectJwtToken = (state) => state.auth.jwtToken;
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
