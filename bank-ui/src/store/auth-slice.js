import { createSlice } from "@reduxjs/toolkit";

// ─── Helpers ────────────────────────────────────────────────────────────────
const safeSet = (key, value) => {
  try {
    localStorage.setItem(
      key,
      typeof value === "string" ? value : JSON.stringify(value),
    );
  } catch (_e) {
    console.warn("[auth-slice] localStorage write failed:", key, e);
  }
};

// safeRemove was unused

const safeParse = (key) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

// ─── Initial State (hydrate from localStorage) ───────────────────────────────
const token = localStorage.getItem("token");
const parsedUser = safeParse("user");

const initialAuthState = {
  jwtToken: token,
  user: parsedUser,
  bankCode: parsedUser?.bankCode || null,
  bankName: parsedUser?.bankName || null,
  isAuthenticated: !!token && !!parsedUser,
};

// ... console.log stays roughly the same ...

// ─── Slice ──────────────────────────────────────────────────────────────────
const authSlice = createSlice({
  name: "auth",
  initialState: initialAuthState,
  reducers: {
    loginSuccess(state, action) {
      const { jwtToken, user, bankCode, bankName } = action.payload;
      state.jwtToken = jwtToken;
      state.user = user;
      state.bankCode = bankCode || user?.bankCode || null;
      state.bankName = bankName || user?.bankName || null;
      state.isAuthenticated = true;

      localStorage.setItem("token", jwtToken);
      localStorage.setItem("user", JSON.stringify(user));

      console.log("AUTH STATE:", state);
    },

    logout(state) {
      state.jwtToken = null;
      state.user = null;
      state.bankCode = null;
      state.bankName = null;
      state.isAuthenticated = false;

      localStorage.removeItem("token");
      localStorage.removeItem("user");
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
