"use client";

import { Menu, Sun, Moon, Bell, SunDim } from "lucide-react";
import { useDispatch } from "react-redux";
import { usePathname } from "next/navigation";
import { toggleSidebar } from "@/store/slices/uiSlice";
import { useTheme } from "next-themes";
import { getTitleFromMenu, MenuGroup } from "@/lib/pageTitle";
import { menuGroups } from "@/constants/menuGroups";
import { useEffect, useState, useSyncExternalStore } from "react";

// Trik optimasi React18+, daftarin fungsi subscribe kosong di luar komponen supaya memori ram browser stabil
// Dibuat sekali, disimpen diram sekali aja
const emptySubscribe = () => () => {};

export default function Header() {
  // Ambil url path yang lagi diakses
  const pathname = usePathname() || "/";
  const dispatch = useDispatch();
  const { theme, setTheme } = useTheme();
  const titlePage = getTitleFromMenu(pathname, menuGroups);

  // Untuk cegah hydration mismatch error antara render server dan client
  // isClient otomatis bernilai true di browser, dan false kalo SSR (Server)
  const isClient = useSyncExternalStore(
    emptySubscribe,
    // Nilai Client
    () => true,
    // Nilai Server
    () => false,
  );
  return (
    <header className="h-16 md:h-20 bg-background/80 backdrop-blur-md flex items-center justify-between px-4 md:px-8 shrink-0 z-30 sticky top-0 border-2 border-amber-500">
      {/* Sisi Kiri */}
      <div className="flex items-center gap-4">
        {/* Drawer Menu Mobile */}
        <button
          onClick={() => dispatch(toggleSidebar())}
          className="p-3 -ml-3 text-foreground hover:bg-muted rounded-full md:hidden transition-colors cursor-pointer"
        >
          <Menu size={24} />
        </button>
        <div className="border-2 border-cyan-700 hidden sm:block">
          <h1 className="text-2xl font-bold text-foreground ">{titlePage}</h1>
        </div>
      </div>

      {/* Sisi Kanan */}
      <div className="flex items-center gap-2 border-2 border-cyan-800">
        {/* Toggle dark mode */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="p-2.5 text-muted-foreground hover:bg-muted hover:text-foreground rounded-full transition-colors relative cursor-pointer"
        >
          {isClient ? (
            theme === "dark" ? (
              <Sun size={22} />
            ) : (
              <Moon size={22} />
            )
          ) : (
            // Placeholder sebelum mounted icon ke load biar layoutnya ga ke geser
            <div className="w-[22px] h-[22px]" />
          )}
        </button>
        <div className="ml-2 px-4 w-full h-10 rounded-full bg-secondary text-secondary-foreground border border-border flex items-center justify-center font-bold text-sm cursor-pointer shadow-sm hover:shadow-md transition-shadow">
          Mamang Elon Musk
        </div>
      </div>
    </header>
  );
}
