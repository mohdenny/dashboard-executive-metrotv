"use client";

import React, { useState } from "react";
// Import queryclient sama providernya dari library tanstack
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Bikin komponen pembungkus khusus buat tanstack query
export default function QueryProvider({
  // Ambil props children buat ngebungkus komponen lain
  children,
}: {
  // Seting tipe data children jadi react node
  children: React.ReactNode;
}) {
  // Masukin queryclient ke dalem wadah usestate biar ga dibikin ulang pas komponen re render
  const [queryClient] = useState(
    // Bikin instance baru queryclient pake fungsi arrow
    () =>
      // Eksekusi pembuatannya di sini trus masukin opsi bawaan
      new QueryClient({
        // Setingan global buat semua query yang jalan
        defaultOptions: {
          // Konfigurasi spesifik buat bagian queries
          queries: {
            // Anggap data masih seger selama semenit penuh sebelon disuruh refresh
            staleTime: 60 * 1000,
            // Matiin fitur refetch otomatis pas user bolak-balik tab browser
            refetchOnWindowFocus: false,
            // Kalo request gagal cuma dikasih kesempatan nyoba sekali lagi
            retry: 1,
          },
        },
      }),
  );

  // Balikin hasil render komponen
  return (
    // Pake queryclientprovider trus suapin client yang ada di state tadi
    <QueryClientProvider client={queryClient}>
      {/* Tampilin komponen anak yang kebungkus */}
      {children}
    </QueryClientProvider>
  );
}
