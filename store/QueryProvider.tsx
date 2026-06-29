"use client";

import React, { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

export default function QueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // inisialisasi QueryClient di dalam useState agar tidak ter-recreate setiap kali render
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Data dianggap fresh selama 1 menit
            staleTime: 60 * 1000,
            // Biar ga nge-fetch otomatis pas pindah tab browser
            refetchOnWindowFocus: false,
            // Kalo gagal, coba 1x lagi
            retry: 1,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Devtools ini bakal muncul di pojok kiri bawah (kalo di local) buat ngecek isi cache data */}
      {/* <ReactQueryDevtools initialIsOpen={false} /> */}
    </QueryClientProvider>
  );
}
