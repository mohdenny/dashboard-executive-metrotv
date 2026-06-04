import { configureStore } from "@reduxjs/toolkit";
import uiReducer from "./slices/uiSlice";

// Bikin/konfigurasu redux store global
export const store = configureStore({
  // Tentuin reducer yang akan ngelola state di store
  reducer: {
    // State global yang namanya 'ui' bakal ngelola si slice uiReducer
    ui: uiReducer,
  },
});

// Ambil tipe data otomatis dari seluruh state yang ada di dalem store
export type RootState = ReturnType<typeof store.getState>;
// Ambi tipe data fungsi dispatch dari store ini
export type AppDispatch = typeof store.dispatch;
