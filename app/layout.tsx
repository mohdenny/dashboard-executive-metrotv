import "./globals.css";
import React from "react";
import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import Sidebar from "@/components/layouts/Sidebar";
import Header from "@/components/layouts/Header";
import ReduxProvider from "@/store/ReduxProvider";

// Title Window
export const metadata: Metadata = {
  title: "MTV Executive",
  description: "Created by MIS Metro TV",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      // Supaya warning error kalo tampilan dari server beda sama tampilan di browser
      suppressHydrationWarning
      // className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      {/* antialiased: biar pinggiran text alus di layar */}
      <body className="antialiased">
        {/* Bungkus Theme Provider untuk dark mode */}
        <ThemeProvider attribute="class" defaultTheme="system">
          {/* Bungkus redux disini */}
          <ReduxProvider>
            <div className="flex h-screen w-full overflow-hidden relative bg-background text-foreground transition-colors duration-300 border-2 border-amber-500">
              {/* Sidebar */}
              <Sidebar />
              <div className="flex flex-col flex-1 min-w-0 h-full relative overflow-hidden border-2 border-amber-700">
                <Header />
                <main className="flex-1 overflow-y-auto overflow-x-hidden p-0 custom-scrollbar border-2 border-cyan-700">
                  <div className="w-full min-h-full pb-24 md:pb-0 border-2 border-b-fuchsia-700">
                    {children}
                  </div>
                </main>
              </div>
            </div>
          </ReduxProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
