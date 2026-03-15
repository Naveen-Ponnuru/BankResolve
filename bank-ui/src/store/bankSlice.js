import { createSlice } from "@reduxjs/toolkit";
import apiClient from "../api/apiClient";

// ─── Fallback list — used when backend is unreachable ────────────────────────
// Must match backend seed data in DataInitializer.java
const FALLBACK_BANKS = [
  { id: 1, name: "SBI", code: "SBI001", branchCount: 24000 },
  { id: 2, name: "HDFC Bank", code: "HDFC001", branchCount: 8000 },
  { id: 3, name: "ICICI Bank", code: "ICICI001", branchCount: 5500 },
];

// ─── Legacy short-code migration (for localStorage compatibility) ─────────────
const legacyCodeMap = {
  SBI: "SBI001",
  HDFC: "HDFC001",
  ICICI: "ICICI001",
};

const migrateBankCode = (bank) => {
  if (bank?.code && legacyCodeMap[bank.code]) {
    return { ...bank, code: legacyCodeMap[bank.code] };
  }
  return bank;
};

// ─── Hydrate selectedBank from localStorage ───────────────────────────────────
let initialSelectedBank = FALLBACK_BANKS[0];
try {
  const savedBank = localStorage.getItem("selectedBank");
  if (savedBank) {
    const parsed = JSON.parse(savedBank);
    const migrated = migrateBankCode(parsed);
    if (migrated?.code !== parsed?.code) {
      localStorage.setItem("selectedBank", JSON.stringify(migrated));
    }
    initialSelectedBank = migrated;
  }
// eslint-disable-next-line no-unused-vars
} catch (err) {
  initialSelectedBank = FALLBACK_BANKS[0];
}

const bankSlice = createSlice({
  name: "bank",
  initialState: {
    availableBanks: FALLBACK_BANKS,
    selectedBank: initialSelectedBank,
    banksLoaded: false,
  },
  reducers: {
    setBank(state, action) {
      state.selectedBank = action.payload;
      localStorage.setItem("selectedBank", JSON.stringify(action.payload));
    },
    fetchBanksSuccess(state, action) {
      state.availableBanks = action.payload;
      state.banksLoaded = true;
    },
  },
});

export const { setBank, fetchBanksSuccess } = bankSlice.actions;
export default bankSlice.reducer;

// Selectors
export const selectBank = (state) => state.bank.selectedBank;
export const selectAvailableBanks = (state) => state.bank.availableBanks;
export const selectBanksLoaded = (state) => state.bank.banksLoaded;

/**
 * Thunk: load banks from the backend API.
 * Falls back to the static FALLBACK_BANKS list if the request fails.
 * Call this once on app startup (e.g., in RootShell or AppShell).
 */
export const loadBanksFromApi = () => async (dispatch) => {
  try {
    const response = await apiClient.get("/banks");
    const banks = response.data.map((b) => ({
      id: b.id,
      name: b.name,
      code: b.code,
      branchCount: b.branchCount ?? 0,
    }));
    if (banks.length > 0) {
      dispatch(fetchBanksSuccess(banks));
    }
  } catch (err) {
    console.warn("[bankSlice] Could not load banks from API — using fallback list.", err);
  }
};
