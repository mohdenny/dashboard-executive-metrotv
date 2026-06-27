"use client";

// Import ikon menu dari lucide
import {
  Menu,
  // Import ikon sun buat tema
  Sun,
  // Import ikon moon buat mode gelap
  Moon,
  // Import ikon bell buat notifikasi
  Bell,
  // Import ikon sun dim buat tema
  SunDim,
  // Import ikon funnel buat filter
  Funnel,
  // Import ikon bar chart 2
  BarChart2,
  // Import ikon line chart
  LineChart,
  // Import ikon pie chart
  PieChart,
} from "lucide-react";
// Import fungsi dispatch dari redux
import { useDispatch } from "react-redux";
// Import hook buat dapetin path url saat ini
import { usePathname } from "next/navigation";
// Import aksi buat toggle sidebar
import { toggleSidebar } from "@/store/slices/uiSlice";
// Import hook tema dari next-themes
import { useTheme } from "next-themes";
// Import helper buat ambil judul halaman
import { getTitleFromMenu, MenuGroup } from "@/lib/pageTitle";
// Import data menu groups dari folder konstan
import { menuGroups } from "@/constants/menuGroups";
// Import hook react dari library react
import { useEffect, useState, useSyncExternalStore } from "react";
// Import komponen image dari next
import Image from "next/image";
// Import komponen link dari next
import Link from "next/link";

// Fungsi dummy buat subscribe untuk optimasi memori
const emptySubscribe = () => () => {};

// Fungsi komponen utama buat header aplikasi
export default function Header() {
  // Ambil url path aktif atau set default ke root
  const pathname = usePathname() || "/";
  // Inisialisasi dispatch untuk kirim aksi redux
  const dispatch = useDispatch();
  // Ambil judul halaman berdasarkan menu
  const titlePage = getTitleFromMenu(pathname, menuGroups);

  // Daftar grup yang mau ditampilkan di header
  const groups = ["EXECUTIVE VIEW", "ANALYTICS TOOLS"];
  // Olah menu groups jadi menu utama yang flat
  const menuItems = menuGroups
    // Saring grup berdasarkan daftar yang disiapin
    .filter((menu) => groups.includes(menu.group))
    // Bongkar menu items jadi array satu dimensi
    .flatMap((menu) => menu.items);

  // Render elemen header
  return (
    // Header dengan posisi sticky dan blur
    <header className="h-16 bg-background/80 backdrop-blur-md flex items-center justify-between px-4 md:px-8 shrink-0 z-30 sticky top-0 border-2 border-amber-500">
      {/* Kontainer sisi kiri */}
      <div className="flex items-center gap-2">
        {/* Tombol menu buat buka sidebar di mobile */}
        <button
          // Aksi panggil fungsi toggle sidebar
          onClick={() => dispatch(toggleSidebar())}
          // Styling tombol mobile
          className="h-12 w-12 flex items-center -ml-2 text-foreground hover:bg-muted rounded-full md:hidden transition-colors cursor-pointer"
        >
          {/* Ikon menu */}
          <Menu size={24} />
        </button>
        {/* Kontainer logo yang disembunyiin di mobile kecil */}
        <div className="hidden sm:block">
          {/* Link balik ke home */}
          <Link
            // Navigasi ke root
            href="/"
            // Styling flex dan text logo
            className="flex items-center gap-1.5 text-xl text-foreground"
          >
            {/* Gambar logo metrotv */}
            <Image
              // Path logo
              src="/logo-metrotv.png"
              // Text alt
              alt="MTI Logo"
              // Lebar logo
              width={32}
              // Tinggi logo
              height={32}
              // Styling logo
              className="w-8 h-8 shrink-0 object-contain"
            />
            {/* Teks brand executive */}
            <span className="font-bold">Executive</span>
            {/* Teks brand dashboard */}
            <span className="font-normal text-muted-foreground">Dashboard</span>
          </Link>
        </div>
      </div>

      {/* Navigasi menu di tengah */}
      <nav className="hidden md:flex items-center gap-3">
        {/* Mapping menu items */}
        {menuItems.map((item, idx) => {
          // Cek apakah url aktif
          const isActive = pathname === item.href;
          // Cek apakah menu adalah dashboard
          const isDashboard = item.name === "Dashboard";

          // Kembalikan link tiap menu
          return (
            <Link
              // Key unik tiap menu
              key={idx}
              // Navigasi ke href
              href={item.href}
              // Styling link menu
              className={`flex items-center justify-center gap-2 h-10 rounded-full cursor-pointer text-sm font-medium transition-colors ${
                // Kondisi styling padding
                isDashboard ? "px-3" : "pl-4 pr-6"
              } ${
                // Kondisi warna aktif
                isActive
                  ? "bg-foreground text-background"
                  : "bg-muted text-foreground hover:text-white"
              }`}
            >
              {/* Ikon tiap menu */}
              <item.icon size={18} />
              {/* Render nama menu kalo bukan dashboard */}
              {!isDashboard && item.name}
            </Link>
          );
        })}
      </nav>

      {/* Kontainer sisi kanan */}
      <div className="flex gap-3">
        {/* Tombol filter */}
        <button
          // Aksi kosong sementara
          onClick={() => ""}
          // Styling tombol filter
          className="border-2 border-cyan-700 flex items-center justify-center gap-2 pl-4 pr-6 h-10 rounded-full cursor-pointer text-sm font-medium transition-colors hover:bg-muted"
        >
          {/* Ikon funnel */}
          <Funnel size={18} /> Filter
        </button>
        {/* Tombol buat nama user */}
        <div
          // Aksi kosong sementara
          onClick={() => ""}
          // Styling nama user
          className="border-2 border-cyan-700 flex items-center justify-center gap-2 pl-4 pr-6 h-10 rounded-full cursor-pointer text-sm font-medium transition-colors hover:bg-muted"
        >
          Davin
        </div>
      </div>
    </header>
  );
}
