// Import stylesheet global aplikasi
import "./globals.css";
import React from "react";
// Import tipe data metadata buat next
import type { Metadata } from "next";
// Import penyedia tema buat dark mode
import { ThemeProvider } from "next-themes";
// Import komponen sidebar
import Sidebar from "@/components/layouts/Sidebar";
// Import komponen header
import Header from "@/components/layouts/Header";
// Import komponen top header
import TopHeader from "@/components/layouts/TopHeader";
// Import penyedia redux
import ReduxProvider from "@/store/ReduxProvider";
// Import penyedia react query
import QueryProvider from "@/store/QueryProvider";
// Import komponen toaster buat notifikasi
import { Toaster } from "sonner";
import BottomNav from "@/components/layouts/BottomNav";

// Object metadata buat judul dan deskripsi window browser
export const metadata: Metadata = {
  title: {
    template: "%s | Metrotv Executive",
    default: "Metrotv Executive",
  },
  description: "Created by MIS Metrotv",
};

// Komponen layout utama yang ngebungkus semua page
export default function RootLayout({
  // Ambil anak komponen dari props
  children,
}: {
  // Tipe data buat anak komponen
  children: React.ReactNode;
}) {
  // Return struktur html dasar aplikasi
  return (
    // Tag html dengan bahasa indonesia
    <html
      lang="id"
      // Supaya warning error kalo tampilan dari server beda sama tampilan di browser
      suppressHydrationWarning
      // className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      {/* antialiased: biar pinggiran text alus di layar */}
      <body className="antialiased">
        {/* Bungkus aplikasi pake provider query buat fetch data */}
        <QueryProvider>
          {/* Bungkus Theme Provider untuk dark mode */}
          <ThemeProvider attribute="class" defaultTheme="dark">
            {/* Bungkus redux disini buat state management */}
            <ReduxProvider>
              {/* Container utama buat atur layout flex kolom */}
              <div className="flex flex-col h-screen w-full relative bg-background text-foreground transition-colors duration-300">
                {/* Sidebar navigasi (komentarin buat sementara) */}
                {/* <Sidebar /> */}
                {/* Panggil komponen top header */}
                <TopHeader />
                {/* Konten utama yang bisa discroll */}
                <main className="flex-1 overflow-y-auto overflow-x-hidden p-0 custom-scrollbar relative z-0">
                  {/* Div buat efek background grid dekorasi */}
                  <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25 dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))] -z-10" />

                  {/* Wadah konten anak komponen dengan padding bawah buat mobile */}
                  <div className="w-full min-h-full pb-24 md:pb-0 ">
                    {/* Render konten page */}
                    {children}
                  </div>
                  <BottomNav/>
                </main>
                
              </div>
              {/* Komponen toaster buat munculin notif action user */}
              <Toaster
                // Posisi notif di atas tengah
                position="top-center"
                // Kasih warna notif otomatis
                richColors
                // Kasih tombol close
                closeButton
                // Durasi tampil lima detik
                duration={5000}
              />
            </ReduxProvider>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
