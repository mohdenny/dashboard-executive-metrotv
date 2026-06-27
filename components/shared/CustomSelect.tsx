import React from "react";
// Import helper cn buat ngegabungin classname biar gampang
import { cn } from "@/lib/utils";

// Interface buat properti yang dipake di komponen custom select ini
interface CustomSelectProps {
  // Nilai terpilih saat ini yang bentuknya string
  value: string;
  // Fungsi callback pas nilai di dalem select berubah
  onChange: (val: string) => void;
  // Array objek yang ngumpulin semua pilihan opsi di dropdown
  options: { label: string; value: string }[];
  // Teks buat nunjukin placeholder kalo belom ada pilihan
  placeholder?: string;
  // Tambahan classname biar bisa dimodif dari luar komponen
  className?: string;
  // Lebar dropdown, bisa set fit atau full sesuai kebutuhan
  width?: string;
}

// Komponen dropdown custom biar kodingan lebih dry dan konsisten
export default function CustomSelect({
  // Ambil nilai dari props
  value,
  // Ambil fungsi pengubah nilai dari props
  onChange,
  // Ambil daftar opsi dari props
  options,
  // Ambil placeholder dari props
  placeholder,
  // Ambil classname tambahan dari props
  className,
  // Ambil lebar dari props
  width,
}: CustomSelectProps) {
  // Ngembaliin struktur jsx buat dropdown
  return (
    // Div pembungkus utama, pake cn biar prop classname bisa nimpah class bawaan biar fleksibel
    <div className={cn("relative inline-block", className)}>
      {/* Elemen select bawaan html buat milih data */}
      <select
        // Masukin nilai dari state
        value={value}
        // Pas nilai berubah, panggil fungsi onchange
        onChange={(e) => onChange(e.target.value)}
        // Bikin style manual biar rapi, pake conditional buat lebar
        className={`appearance-none bg-card border border-border text-foreground text-sm font-medium rounded-full focus:ring-2 focus:ring-primary truncate focus:outline-none block pl-4 pr-10 py-0 h-10 cursor-pointer ${width === "fit" ? "w-fit" : "w-full"}`}
      >
        {/* Cek kalo ada placeholder, baru ngerender opsi placeholder */}
        {placeholder && (
          // Opsi placeholder disembunyiin biar ga bisa dipilih ulang
          <option value="" className="bg-card text-foreground" disabled hidden>
            {placeholder}
          </option>
        )}
        {/* Mapping tiap data opsi jadi elemen option */}
        {options.map((opt, idx) => (
          // Tiap option butuh key unik biar react ga pusing
          <option
            key={idx}
            // Nilai asli yang bakal disimpen
            value={opt.value}
            // Kasih warna background biar kontras pas ganti tema
            className="bg-card text-foreground"
          >
            {/* Teks label yang muncul di layar */}
            {opt.label}
          </option>
        ))}
      </select>
      {/* Div pembungkus ikon anak panah buat nunjukin ini dropdown */}
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-foreground/70">
        {/* Gambar svg buat ikon panah bawah */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-4 h-4"
        >
          {/* Path buat ngebentuk ikon panah */}
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 8.25l-7.5 7.5-7.5-7.5"
          />
        </svg>
      </div>
    </div>
  );
}
