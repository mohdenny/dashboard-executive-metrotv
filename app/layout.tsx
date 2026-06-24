import "./globals.css";
import React from "react";
import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import Sidebar from "@/components/layouts/Sidebar";
import Header from "@/components/layouts/Header";
import TopHeader from "@/components/layouts/TopHeader";
import ReduxProvider from "@/store/ReduxProvider";
import QueryProvider from "@/store/QueryProvider";
import { Toaster } from "sonner";
import BottomNav from "@/components/layouts/BottomNav";

// Title Window
export const metadata: Metadata = {
  title: "MTV Executive",
  description: "Created by MIS Metro TV",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      // Supaya warning error kalo tampilan dari server beda sama tampilan di browser
      suppressHydrationWarning
      // className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      {/* antialiased: biar pinggiran text alus di layar */}
      <body className="antialiased">
        <QueryProvider>
          {/* Bungkus Theme Provider untuk dark mode */}
          <ThemeProvider attribute="class" defaultTheme="dark">
            {/* Bungkus redux disini */}
            <ReduxProvider>
              <div className=" flex flex-col h-screen w-full relative bg-background text-foreground transition-colors duration-300">
                {/* Sidebar */}
                {/* <Sidebar /> */}
                <TopHeader />
                <main className="flex-1 overflow-y-auto overflow-x-hidden p-0 md:custom-scrollbar relative z-0">
                  <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25 dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))] -z-10" />

                  <div className=" w-full min-h-full pb-24 md:pb-0 ">
                    {children}
                  </div>
                </main>
                <BottomNav />
              </div>
            </ReduxProvider>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
