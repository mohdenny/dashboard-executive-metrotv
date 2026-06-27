"use client";

// Import react bawaan
import React from "react";
// Import komponen provider dari react redux buat nyambungin aplikasi ke store
import { Provider } from "react-redux";
// Import objek store utama yang udah dirakit
import { store } from "./store";

// Bikin fungsi komponen pembungkus buat redux
export default function ReduxProvider({
  // Terima props children biar komponen dalemnya bisa ikutan dibungkus
  children,
}: {
  // Atur tipe data children pake tipe bawaan react node
  children: React.ReactNode;
}) {
  // Render komponen tampilan balikan
  return (
    // Bungkus pake komponen provider terus masukin store yang udah disiapin
    <Provider store={store}>
      {/* Render semua komponen anak di dalemnya biar pada dapet akses global state */}
      {children}
    </Provider>
  );
}
