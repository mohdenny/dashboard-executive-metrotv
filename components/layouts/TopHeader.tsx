"use client";

// Import icon dashboard dari lucide
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
import React, {
  // Import hook state buat nyimpen data lokal
  useState,
  // Import hook sinkronisasi store buat handle render server vs client
  useSyncExternalStore,
} from "react";
// Import fungsi buat ngirim action ke redux
import { useDispatch } from "react-redux";
// Import hook buat dapetin lokasi url saat ini
import { usePathname } from "next/navigation";
// Import action buat buka tutup sidebar
import { toggleSidebar } from "@/store/slices/uiSlice";
// Import hook buat manage tema aplikasi
import { useTheme } from "next-themes";
// Import konfigurasi grup menu dari folder konstan
import { menuGroups } from "@/constants/menuGroups";
// Import komponen gambar dari next buat optimasi
import Image from "next/image";
// Import komponen link buat pindah page
import Link from "next/link";

// Fungsi buat subscribe kosong supaya memori tetap anteng
const emptySubscribe = () => () => {};

// Fungsi komponen utama buat header bagian atas
export default function TopHeader() {
  // Ambil lokasi url yang lagi diakses
  const pathname = usePathname();

  // Inisialisasi pengirim action ke redux
  const dispatch = useDispatch();

  // Deteksi apa komponen udah jalan di sisi client
  const isClient = useSyncExternalStore(
    // Panggil fungsi subscribe dummy
    emptySubscribe,
    // Fungsi kalo jalan di browser
    () => true,
    // Fungsi kalo jalan di server
    () => false,
  );

  // Daftar nama grup menu yang mau dipasang di header
  const groups = ["EXECUTIVE VIEW", "ANALYTICS TOOLS"];
  // Olah menu groups jadi menu utama yang flat
  const mainTabs = menuGroups
    // Filter grup berdasarkan daftar yang udah disiapin
    .filter((menu) => groups.includes(menu.group))
    // Bongkar menu items biar rata jadi satu array
    .flatMap((menu) => menu.items);

  // Daftar menu tambahan buat akses database
  const toolTabs = [
    // Objek menu buat master data
    { name: "Master Data", href: "/master-program", icon: Database },
  ];

  // Render elemen header
  return (
    // Header dengan posisi sticky buat nge-fix di atas
    <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-lg border-b border-border/50 shadow-sm">
      {/* Kontainer tengah buat atur batas lebar header */}
      <div className="max-w-[1800px] mx-auto px-4 md:px-8 h-16 flex items-center justify-between gap-4">
        {/* Kontainer sisi kiri buat logo */}
        <div className="flex items-center gap-2">
          {/* Link buat balik ke dashboard utama */}
          <Link
            // Alamat root dashboard
            href="/"
            // Styling buat flex link logo
            className="flex items-center gap-1.5 text-xl text-foreground"
          >
            {/* Gambar logo metrotv */}
            <Image
              // Path logo
              src="/logo-metrotv.png"
              // Text alternatif
              alt="MTI Logo"
              // Lebar logo
              width={32}
              // Tinggi logo
              height={32}
              // Styling ukuran logo
              className="w-8 h-8 shrink-0 object-contain"
            />
            {/* Teks buat brand */}
            <span className="font-bold">Metrotv</span>
            {/* Teks executive buat keterangan page */}
            <span className="font-normal text-muted-foreground">Executive</span>
          </Link>
        </div>

        {/* Navigasi menu utama di tengah */}
        <nav className="hidden md:flex items-center gap-1 bg-muted/30 p-1 rounded-full border border-border/50">
          {/* Loop daftar menu buat render link */}
          {mainTabs.map((tab) => {
            // Cek apakah url ini lagi aktif
            const isActive = pathname === tab.href;
            // Kembalikan elemen link tiap menu
            return (
              <Link
                // Key unik dari href
                key={tab.href}
                // Link navigasi menu
                href={tab.href}
                // Styling dinamis buat tab
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                  // Logic warna kalo tab lagi aktif
                  isActive
                    ? "bg-background shadow-sm text-white"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                {/* Icon tiap menu dengan stroke tebal kalo aktif */}
                <tab.icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                {/* Label nama menu */}
                {tab.name}
              </Link>
            );
          })}
        </nav>

        {/* Kontainer sisi kanan buat tools */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Kontainer icon tool yang disembunyiin di mobile */}
          <div className="hidden lg:flex items-center gap-1 border-r border-border/50 pr-2 mr-1">
            {/* Loop render menu tools */}
            {toolTabs.map((tab) => (
              <Link
                // Key unik dari href
                key={tab.href}
                // Link navigasi tool
                href={tab.href}
                // Text hover buat judul master data
                title={`Master Data: ${tab.name}`}
                // Styling background kalo tool lagi aktif
                className={`p-2 rounded-full transition-colors ${
                  // Highlight kalo path cocok
                  pathname === tab.href
                    ? "bg-primary/10 text-white"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                {/* Icon tool */}
                <tab.icon size={20} />
              </Link>
            ))}
          </div>

          {/* Avatar user buat profil */}
          <div className="h-8 w-8 rounded-full bg-secondary border border-border flex items-center justify-center overflow-hidden cursor-pointer shadow-sm">
            M
          </div>
        </div>
      </div>

      {/* Navigasi mobile yang bisa digeser */}
     
    </header>
  );
}
