// Import fungsi configurestore dari redux toolkit buat ngerakit gudang
import { configureStore } from "@reduxjs/toolkit";
// Import file uireducer buat ngatur urusan antarmuka
import uiReducer from "./slices/uiSlice";

// Bikin wadah store utama terus diekspor biar bisa dipake seaplikasi
export const store = configureStore({
  // Nentuin reducer mana aja yang dapet izin ngelola state di store ini
  reducer: {
    // State ui dikasih ke uireducer buat diurusin
    ui: uiReducer,
  },
});

// Bongkar rootstate dari store terus ekspor tipe datanya buat keperluan typescript
export type RootState = ReturnType<typeof store.getState>;
// Ambil tipe data fungsi dispatch bawaan store terus ekspor biar aman pas ngirim payload
export type AppDispatch = typeof store.dispatch;
