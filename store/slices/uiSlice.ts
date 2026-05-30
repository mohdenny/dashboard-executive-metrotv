import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Kondisi awal, belum ada kiriman dari si kurir (dispatch)
const initialState = {
  isSidebarOpen: false,
};

export const uiSlice = createSlice({
  name: "ui",
  initialState,

  // reducers ibarat si penerima paket
  // reducers yang tugasnya bongkar isi paket, dan ubah kondisi
  reducers: {
    // Disini ga perlu ada kiriman paket, soalnya nilai kebalikan otomatis on/off
    toggleSidebar: (state) => {
      state.isSidebarOpen = !state.isSidebarOpen;
    },

    // Nah paket yang dikirim si kurir (dispatch), diterima sama reducers
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      // Action itu paketnya
      // Payload itu isi paketnya (action.payload)
      state.isSidebarOpen = action.payload;
    },
  },
});

export const { toggleSidebar, setSidebarOpen } = uiSlice.actions;
export default uiSlice.reducer;
