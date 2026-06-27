"use client";

// Import ikon ellipsis dan x dari lucide
import { Ellipsis, X } from "lucide-react";
// Import komponen link next buat navigasi
import Link from "next/link";
// Import hook buat akses url path
import { usePathname } from "next/navigation";
// Import fungsi bantu buat judul halaman
import { getTitleFromMenu, MenuGroup } from "@/lib/pageTitle";
// Import hook redux buat state management
import { useDispatch, useSelector } from "react-redux";
// Import tipe data buat root state redux
import { RootState } from "@/store/store";
// Import aksi buat set buka atau tutup sidebar
import { setSidebarOpen, toggleSidebar } from "@/store/slices/uiSlice";
// Import data menu groups dari folder konstan
import { menuGroups } from "@/constants/menuGroups";
// Import komponen image next buat logo
import Image from "next/image";

// Fungsi komponen utama buat sidebar navigasi
export default function Sidebar(): React.JSX.Element {
  // Ambil url path yang lagi diakses user
  const pathname = usePathname() || "/";
  // Inisialisasi dispatch redux
  const dispatch = useDispatch();
  // Ambil status sidebar buka atau tutup dari redux state
  const isOpen = useSelector((state: RootState) => state.ui.isSidebarOpen);

  // Render elemen sidebar
  return (
    // Fragment pembungkus
    <>
      {/* Kondisional buat tampilin overlay di mobile pas sidebar buka */}
      {isOpen && (
        <div
          // Styling overlay transparan dengan efek blur
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden transition-opacity"
          // Fungsi buat tutup sidebar pas overlay diklik
          onClick={() => dispatch(setSidebarOpen(false))}
        />
      )}
      {/* Container utama sidebar */}
      <aside
        // Styling sidebar dengan border dan transisi
        className={`border-2 border-cyan-600 fixed inset-y-0 left-0 w-[280px] bg-background md:border-r-0 border-r border-border p-4 flex flex-col justify-between z-50 transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Div buat konten utama sidebar */}
        <div className="border-2 border-red-600 flex flex-col flex-1 overflow-y-auto custom-scrollbar">
          {/* Logo brand */}
          <div className="border-2 border-yellow-600 flex items-center justify-between px-4 h-14 mb-6 shrink-0">
            {/* Kontainer logo */}
            <div className="border-2 border-cyan-600 flex items-center gap-1.5 text-xl text-foreground">
              {/* Gambar logo metrotv */}
              <Image
                // Path logo
                src="/logo-metrotv.png"
                // Alt logo
                alt="MTI Logo"
                // Lebar logo
                width={32}
                // Tinggi logo
                height={32}
                // Styling ukuran logo
                className="w-8 h-8 shrink-0 object-contain"
              />
              {/* Teks logo MTV */}
              <span className="font-bold">MTV</span>
              {/* Teks logo executive */}
              <span className="font-normal text-muted-foreground">
                Executive
              </span>
            </div>
            {/* Tombol tutup buat mobile */}
            <button
              // Aksi tutup sidebar
              onClick={() => dispatch(setSidebarOpen(false))}
              // Styling tombol close
              className="p-2 text-muted-foreground hover:bg-muted rounded-full md:hidden"
            >
              {/* Ikon x */}
              <X size={20} />
            </button>
          </div>

          {/* Navigasi menu groups */}
          <div className="space-y-6 flex-1">
            {/* Mapping menu groups */}
            {menuGroups.map((group, idx) => (
              <div key={idx} className="space-y-1">
                {/* Judul grup menu */}
                <h4 className="px-5 text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                  {group.group}
                </h4>
                {/* List item navigasi */}
                <nav className="space-y-1">
                  {/* Mapping item menu tiap grup */}
                  {group.items.map((item) => {
                    // Cek menu aktif
                    const isActive = pathname === item.href;
                    // Render link navigasi
                    return (
                      <Link
                        // Key unik href
                        key={item.href}
                        // Link tujuan
                        href={item.href}
                        // Aksi tutup sidebar pas menu diklik
                        onClick={() => dispatch(setSidebarOpen(false))}
                        // Styling link item navigasi
                        className={`flex items-center gap-4 px-4 h-14 rounded-full text-sm transition-all ${
                          // Kondisi warna aktif
                          isActive
                            ? "font-bold text-secondary-foreground"
                            : "text-muted-foreground font-medium hover:bg-secondary hover:text-foreground"
                        }`}
                      >
                        {/* Ikon menu item */}
                        <item.icon
                          size={24}
                          strokeWidth={2}
                          fill={isActive ? "currentColor" : "none"}
                        />
                        {/* Nama menu item */}
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>
            ))}
          </div>

          {/* Area profil user */}
          <div className="mt-auto pt-4 border-t border-border/50 border-2 border-cyan-700">
            {/* Tombol profil user */}
            <button
              // Aksi klik user
              onClick={() => {}}
              // Styling tombol profil
              className="border w-full flex items-center gap-2 px-4 h-14 rounded-full text-sm font-medium hover:bg-secondary hover:text-foreground cursor-pointer group transition-all"
            >
              {/* Avatar user */}
              <div className="h-10 w-10 rounded-full bg-secondary text-secondary-foreground border border-border flex items-center justify-center font-bold shadow-md ">
                M
              </div>
              {/* Kontainer detail user */}
              <div className="border border-b-blue-700 h-full flex flex-col justify-center">
                {/* Nama user */}
                <p className="border border-b-blue-700 truncate">
                  Mohammad Denny
                </p>
                {/* Id user */}
                <p className="border border-b-blue-700 truncate">1163353</p>
              </div>
              {/* Ikon ellipsis buat setting tambahan */}
              <Ellipsis
                size={24}
                className="border border-b-blue-700 text-muted-foreground group-hover:text-foreground hidden lg:block"
              />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
