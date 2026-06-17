"use client";

import {
  Menu,
  Sun,
  Moon,
  Bell,
  SunDim,
  Funnel,
  BarChart2,
  LineChart,
  PieChart,
} from "lucide-react";
import { useDispatch } from "react-redux";
import { usePathname } from "next/navigation";
import { toggleSidebar } from "@/store/slices/uiSlice";
import { useTheme } from "next-themes";
import { getTitleFromMenu, MenuGroup } from "@/lib/pageTitle";
import { menuGroups } from "@/constants/menuGroups";
import { useEffect, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";

// Trik optimasi React18+, daftarin fungsi subscribe kosong di luar komponen supaya memori ram browser stabil
// Dibuat sekali, disimpen diram sekali aja
const emptySubscribe = () => () => {};

export default function Header() {
  // // Untuk cegah hydration mismatch error antara render server dan client
  // // isClient otomatis bernilai true di browser, dan false kalo SSR (Server)
  // const isClient = useSyncExternalStore(
  //   emptySubscribe,
  //   // Nilai Client
  //   () => true,
  //   // Nilai Server
  //   () => false,
  // );

  // Ambil url path yang lagi diakses
  const pathname = usePathname() || "/";
  const dispatch = useDispatch();
  // Ini untuk dark mode
  // const { theme, setTheme } = useTheme();
  const titlePage = getTitleFromMenu(pathname, menuGroups);

  const groups = ["EXECUTIVE VIEW", "ANALYTICS TOOLS"];
  const menuItems = menuGroups
    // Ambil grup yang yang udah ditentuin
    .filter((menu) => groups.includes(menu.group))
    // Lebur semua array pake flatmap biar jadi satu array rata
    .flatMap((menu) => menu.items);

  return (
    <header className="h-16 bg-background/80 backdrop-blur-md flex items-center justify-between px-4 md:px-8 shrink-0 z-30 sticky top-0 border-2 border-amber-500">
      {/* Sisi Kiri */}
      <div className="flex items-center gap-2">
        {/* Drawer Menu Mobile */}
        <button
          onClick={() => dispatch(toggleSidebar())}
          className="h-12 w-12 flex items-center -ml-2 text-foreground hover:bg-muted rounded-full md:hidden transition-colors cursor-pointer"
        >
          <Menu size={24} />
        </button>
        <div className="hidden sm:block">
          {/* <h1 className="text-2xl font-bold text-foreground ">{titlePage}</h1> */}
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xl text-foreground"
          >
            {/* <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shadow-md">
                  E
                </div> */}
            {/* <button
                  onClick={() => dispatch(toggleSidebar())}
                  className="p-3 text-foreground hidden md:block hover:bg-muted rounded-full transition-colors cursor-pointer"
                >
                <Menu size={24} />
              </button> */}
            <Image
              src="/logo-metrotv.png"
              alt="MTI Logo"
              width={32}
              height={32}
              className="w-8 h-8 shrink-0 object-contain"
            />
            <span className="font-bold">Executive</span>
            <span className="font-normal text-muted-foreground">Dashboard</span>
          </Link>
        </div>
      </div>

      {/* {Sisi Tengah} */}
      <nav className="hidden md:flex items-center gap-3">
        {menuItems.map((item, idx) => {
          const isActive = pathname === item.href;
          const isDashboard = item.name === "Dashboard";

          return (
            <Link
              key={idx}
              href={item.href}
              className={`flex items-center justify-center gap-2 h-10 rounded-full cursor-pointer text-sm font-medium transition-colors ${
                isDashboard ? "px-3" : "pl-4 pr-6"
              } ${
                isActive
                  ? "bg-foreground text-background"
                  : "bg-muted text-foreground hover:text-white"
              }`}
            >
              <item.icon size={18} />
              {/* Nama bakal dirender selain Dashboard */}
              {!isDashboard && item.name}
            </Link>
          );
        })}
      </nav>

      {/* Sisi Kanan */}
      {/* <div className="flex items-center gap-2 border-2 border-cyan-800">
        Toggle dark mode
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
            Placeholder sebelum mounted icon ke load biar layoutnya ga ke geser
            <div className="w-[22px] h-[22px]" />
          )}
        </button>
      </div> */}
      <div className="flex gap-3">
        <button
          onClick={() => ""}
          className="border-2 border-cyan-700 flex items-center justify-center gap-2 pl-4 pr-6 h-10 rounded-full cursor-pointer text-sm font-medium transition-colors hover:bg-muted"
        >
          <Funnel size={18} /> Filter
        </button>
        <div
          onClick={() => ""}
          className="border-2 border-cyan-700 flex items-center justify-center gap-2 pl-4 pr-6 h-10 rounded-full cursor-pointer text-sm font-medium transition-colors hover:bg-muted"
        >
          Davin
        </div>
      </div>
    </header>
  );
}
