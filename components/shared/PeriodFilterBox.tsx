// file: components/shared/PeriodFilterBox.tsx
import React from "react";
// Import helper cn buat ngegabungin classname biar dinamis
import { cn } from "@/lib/utils";

// Interface buat mendefinisikan tipe properti yang masuk ke komponen ini
interface PeriodFilterBoxProps {
  // Nilai periode yang lagi dipilih user
  selectedPeriod: string;
  // Fungsi callback buat update periode
  setSelectedPeriod: (val: string) => void;
  // Array string buat daftar opsi periode
  periodOptions: string[];
  // Classname tambahan biar bisa dimodif dari luar
  className?: string;
}

// Komponen filter box buat milih periode tabel biar gampang dipanggil
export default function PeriodFilterBox({
  // Ambil nilai periode dari props
  selectedPeriod,
  // Ambil fungsi update periode dari props
  setSelectedPeriod,
  // Ambil daftar opsi periode dari props
  periodOptions,
  // Ambil classname dari props
  className,
}: PeriodFilterBoxProps) {
  // Ngembaliin elemen jsx buat ngerender box filter
  return (
    // Div utama pembungkus filter pake cn biar prop classname bisa nimpa style
    <div className={cn("flex items-center gap-4 px-2 w-full", className)}>
      {/* Label buat kasih tau user ini filter apa */}
      <label className="text-sm font-bold text-foreground flex items-center gap-2 whitespace-nowrap">
        Pilih Periode:
      </label>
      {/* Select dropdown buat milih periode */}
      <select
        // Nilai select diiket ke state selectedperiod atau fallback ke opsi pertama
        value={
          selectedPeriod || (periodOptions.length > 0 ? periodOptions[0] : "")
        }
        // Pas berubah panggil fungsi setter buat update state
        onChange={(e) => setSelectedPeriod(e.target.value)}
        // Style manual biar tampilannya rapi dan konsisten
        className="bg-muted border border-border rounded-xl px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer w-full shadow-sm"
      >
        {/* Mapping daftar opsi periode jadi elemen option */}
        {periodOptions.map((p) => (
          // Opsi buat tiap item periode
          <option key={p} value={p}>
            {p}
          </option>
        ))}
      </select>
      {/* Tampilan teks buat nunjukin data periode yang lagi aktif muncul di tabel */}
      <span className="text-xs text-muted-foreground font-medium bg-muted/50 px-3 py-1.5 rounded-full border border-border shrink-0 whitespace-nowrap">
        Data Ditampilkan:{" "}
        {/* Tampilkan nilai periode yang aktif atau default ke opsi pertama */}
        <span className="font-bold text-foreground">
          {selectedPeriod || periodOptions[0] || "-"}
        </span>
      </span>
    </div>
  );
}
