// Import fungsi createslice sama payloadaction bawaan redux toolkit
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Bikin kondisi state awal sebelon kena tiban action apa apa
const initialState = {
  // Wadah boolean buat nentuin sidebar lagi ngebuka atau nutup
  isSidebarOpen: false,
};

// Bikin bungkus slice khusus urusan ui
export const uiSlice = createSlice({
  // Kasih nama slice ini ui doang
  name: "ui",
  // Masukin kondisi state awal yang udah dibikin barusan
  initialState,
  // Tempat ngumpulin fungsi2 reducer buat bongkar payload terus update state
  reducers: {
    // Fungsi ini ga nerima payload soalnya cuma buat ngebalikin saklar doang
    toggleSidebar: (state) => {
      // Tiban nilai sidebar saat ini pake nilai kebalikannya persis
      state.isSidebarOpen = !state.isSidebarOpen;
    },
    // Fungsi ini butuh boolean dari payload buat maksa sidebar ngebuka atau nutup
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      // Tiban isi state sidebar langsung pake boolean yang ada di dalem payload
      state.isSidebarOpen = action.payload;
    },
  },
});

// Bongkar dan ekspor fungsi2 actionnya biar komponen react bisa langsung pake
export const { toggleSidebar, setSidebarOpen } = uiSlice.actions;
// Ekspor reducernya doang buat didaftarin ke gudang store
export default uiSlice.reducer;
