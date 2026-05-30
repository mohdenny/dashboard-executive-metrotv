"use client";

import React from "react";
import { Provider } from "react-redux";
import { store } from "./store";

// Bikin komponen wrapper(pembungkus)
// Komponen ini bakal nerima children, yang bakal dikasih akses ke data global si Redux
export default function ReduxProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Gabungkan semua komponen ke Gudang utama store yang sama
  <Provider store={store}>
    {children}
  </Provider>
  );
}
