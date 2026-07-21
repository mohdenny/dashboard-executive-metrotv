import { ArrowDownRight, ArrowUpRight, LucideIcon } from "lucide-react";

// Baris deklarasi tipe objek card buat nampilin data statistik
type Card = {
  // Judul atau label nama statistik
  title: string;
  // Nilai statistik yang mau ditampilin
  value: string;
  // Status positif buat nentuin warna hijau atau merah
  isPositive: boolean;
  // Label keterangan tren statistik
  label: string;
  // Icon yang relevan dengan konteks data
  icon: LucideIcon;
  // Properti warna hex custom untuk icon
  color: string;
};

// Interface buat mendefinisikan tipe properti komponen stat card
interface StatCardProps {
  // Properti card yang berisi data statistik
  card: Card;
}

// Komponen utama stat card buat nampilin ringkasan angka
export default function StatCard({
  // Ambil objek card dari props
  card,
}: StatCardProps) {
  // Ekstrak komponen icon dari properti card
  const Icon = card.icon;

  // Balikin elemen jsx buat ngerender card statistik
  return (
    // Fragment pembungkus elemen jsx
    <>

      {/* Kontainer utama card baru dengan style hover yang bikin efek interaktif */}
      <div className="border border-border grid grid-cols-5 grid-rows-[auto_auto_1fr] gap-x-4 relative overflow-hidden h-full bg-card shadow-sm hover:shadow-md transition-all rounded-2xl p-6">
        {/* Disembunyikan menggunakan false condition agar komentar asli di dalamnya tidak perlu diubah/dihapus */}
        {false && (
          <>
            {/* Div buat animasi pulse indikator status */}
            <span className="absolute top-6 right-6 flex h-2.5 w-2.5">
              {/* Span ping buat efek animasi */}
              <span
                // Cek status positif buat nentuin warna bg
                className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${card.isPositive ? "bg-green-400" : "bg-red-400"}`}
              ></span>
              {/* Span titik buat indikator warna */}
              <span
                // Cek status positif buat nentuin warna dot
                className={`relative inline-flex h-2.5 w-2.5 rounded-full ${card.isPositive ? "bg-green-500" : "bg-red-500"}`}
              ></span>
            </span>
          </>
        )}

        {/* Icon Gede di Kiri dengan warna custom inline */}
        <div
          className="col-span-2 row-span-2 flex items-center justify-center rounded-xl p-2"
          style={{ backgroundColor: `${card.color}20`, color: card.color }} // Tambahan hex "20" buat transparansi 12%
        >
          <Icon size={36} strokeWidth={2.5} />
        </div>

        {/* Teks judul statistik */}
        <span className="col-span-3 col-start-3 row-start-1 flex items-end text-sm font-bold text-muted-foreground uppercase tracking-wider mb-1 truncate">
          {card.title}
        </span>

        {/* Teks nilai statistik utama */}
        <span className="col-span-3 col-start-3 row-start-2 self-start text-xl xl:text-2xl font-black text-foreground tracking-tight truncate">
          {card.value}
        </span>

        {/* Indikator Tren */}
        <div className="col-span-5 row-start-3 flex items-end justify-end mt-4">
          {/* Kontainer buat nampilin label tren naik atau turun */}
          <div
            // Cek status positif buat styling background dan warna teks
            className={`flex items-center gap-1 text-sm md:font-bold shrink-0 font-semibold px-1.5 py-0.5 rounded-sm w-fit ${card.isPositive ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"}`}
          >
            <span>{card.label}</span>
            {/* Kondisional icon arrow berdasarkan status positif */}
            {card.isPositive ? (
              <ArrowUpRight size={14} strokeWidth={2.5} />
            ) : (
              <ArrowDownRight size={14} strokeWidth={2.5} />
            )}
            {/* Teks label keterangan tren */}
          </div>
        </div>
      </div>
    </>
  );
}

      
/*

*/