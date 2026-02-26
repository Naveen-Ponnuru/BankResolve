import { createSlice } from "@reduxjs/toolkit";

const initialBankState = {
  availableBanks: [
    // Codes must match backend seed data (DataInitializer)
    { id: 1, name: "SBI Bank", code: "SBI001", branchCount: 24000 },
    { id: 2, name: "HDFC Bank", code: "HDFC001", branchCount: 8000 },
    { id: 3, name: "ICICI Bank", code: "ICICI001", branchCount: 5500 },
  ],
  selectedBank: null,
};

// Load selected bank from localStorage if available
const savedBank = localStorage.getItem("selectedBank");
if (savedBank) {
  try {
    initialBankState.selectedBank = JSON.parse(savedBank);
  } catch (e) {
    initialBankState.selectedBank = initialBankState.availableBanks[0];
  }
} else {
  initialBankState.selectedBank = initialBankState.availableBanks[0];
}

const bankSlice = createSlice({
  name: "bank",
  initialState: initialBankState,
  reducers: {
    setBank(state, action) {
      state.selectedBank = action.payload;
      localStorage.setItem("selectedBank", JSON.stringify(action.payload));
    },
    fetchBanksSuccess(state, action) {
      state.availableBanks = action.payload;
    },
  },
});

export const { setBank, fetchBanksSuccess } = bankSlice.actions;
export default bankSlice.reducer;

// Selectors
export const selectBank = (state) => state.bank.selectedBank;
export const selectAvailableBanks = (state) => state.bank.availableBanks;
