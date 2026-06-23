"use client";

import {
  LayoutDashboard,
  MonitorPlay,
  GitCompare,
  BarChart3,
  Calendar,
  ShieldAlert,
  Settings,
  Moon,
  Sun,
  Menu,
  Database,
} from "lucide-react";
import React, { useState, useSyncExternalStore } from "react";
import { useDispatch, UseDispatch } from "react-redux";
import { usePathname } from "next/navigation";
import { toggleSidebar } from "@/store/slices/uiSlice";
import { useTheme } from "next-themes";
import { menuGroups } from "@/constants/menuGroups";
import Image from "next/image";
import Link from "next/link";

// Trik optimasi React18+, daftarin fungsi subscribe kosong di luar komponen supaya memori ram browser stabil
// Dibuat sekali, disimpen diram sekali aja
const emptySubscribe = () => () => {};

export default function TopHeader() {
  // Ambil url path yang lagi diakses
  const pathname = usePathname();

  // Kurir redux
  const dispatch = useDispatch();

  // Dark Mode
  // const { theme, setTheme } = useTheme();

  // Untuk cegah hydration mismatch error antara render server dan client
  // isClient otomatis bernilai true di browser, dan false kalo SSR (Server)
  const isClient = useSyncExternalStore(
    emptySubscribe,
    // Nilai Client
    () => true,
    // Nilai Server
    () => false,
  );

  // Menu utama
  const groups = ["EXECUTIVE VIEW", "ANALYTICS TOOLS"];
  const mainTabs = menuGroups
    // Ambil grup yang udah ditentuin
    .filter((menu) => groups.includes(menu.group))
    // Lebur semua array pake flatMap biar jadi satu array rata
    .flatMap((menu) => menu.items);

  // Menu tools
  const toolTabs = [
    { name: "Master Data", href: "/master-program", icon: Database },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-lg border-b border-border/50 shadow-sm">
      <div className="max-w-[1800px] mx-auto px-4 md:px-8 h-16 flex items-center justify-between gap-4">
        {/* Sisi Kiri */}
        <div className="flex items-center gap-2">
          {/* <div className="hidden sm:block"> */}
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xl text-foreground"
          >
            <Image
              src="/logo-metrotv.png"
              alt="MTI Logo"
              width={32}
              height={32}
              className="w-8 h-8 shrink-0 object-contain"
            />
            <span className="font-bold">MTV</span>
            <span className="font-normal text-muted-foreground">Executive</span>
          </Link>
          {/* </div> */}
        </div>

        {/* Main tab, tengah */}
        <nav className="hidden md:flex items-center gap-1 bg-muted/30 p-1 rounded-full border border-border/50">
          {mainTabs.map((tab) => {
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-background shadow-sm text-white"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <tab.icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                {tab.name}
              </Link>
            );
          })}
        </nav>

        {/* Tool tab, Kanan */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden lg:flex items-center gap-1 border-r border-border/50 pr-2 mr-1">
            {toolTabs.map((tab) => (
              <Link
                key={tab.href}
                href={tab.href}
                title={`Master Data: ${tab.name}`}
                className={`p-2 rounded-full transition-colors ${
                  pathname === tab.href
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <tab.icon size={20} />
              </Link>
            ))}
          </div>

          {/* Tombol dark mode*/}
          {/* <button
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
          </button> */}

          {/* <button className="p-2 text-muted-foreground hover:bg-muted hover:text-primary rounded-full transition-colors cursor-pointer mr-2">
            <Settings size={20} />
          </button> */}

          <div className="h-8 w-8 rounded-full bg-secondary border border-border flex items-center justify-center overflow-hidden cursor-pointer shadow-sm">
            M
          </div>
        </div>
      </div>

      {/* Mobile tab */}
      <div className="md:hidden flex overflow-x-auto custom-scrollbar px-4 py-2 bg-background border-t border-border/50 gap-2">
        {[...mainTabs, ...toolTabs].map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap border transition-all ${
                isActive
                  ? "bg-primary/10 border-primary/20 text-primary"
                  : "bg-card border-border text-muted-foreground"
              }`}
            >
              <tab.icon size={14} />
              {tab.name}
            </Link>
          );
        })}
      </div>
    </header>
  );
}
