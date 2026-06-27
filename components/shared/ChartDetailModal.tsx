import React, { useState, useMemo, useSyncExternalStore } from "react";
// Import createPortal buat ngerender modal di luar hirarki dom utama
import { createPortal } from "react-dom";
// Import ikon X sama filterx dari lucide react buat tombol tutup
import { X, FilterX } from "lucide-react";
// Import komponen BaseChart buat nampilin grafik di dalem modal
import BaseChart from "@/components/shared/BaseChart";
// Import data mock program buat kebutuhan testing
import { MOCK_PROGRAMS } from "@/constants/programMockData";
// Import tipe data buat chart js
import { ChartData } from "chart.js";
// Import fungsi helper buat format angka jadi lebih enak dibaca
import { formatBigNumber } from "@/lib/formatters";

// Fungsi kosong buat sinkronisasi external store biar ga error pas rendering
const emptySubscribe = () => () => {};

// Interface buat properti modal chart detail
interface ChartDetailModalProps {
  // Status modal buka atau tutup
  isOpen: boolean;
  // Fungsi callback buat nutup modal
  onClose: () => void;
  // Judul yang bakal muncul di header modal
  title: string;
  // Tipe metrik yang lagi dipake buat analisis
  metricType: string;
  // Array daftar kategori program yang disediain
  programCategories: string[];
}

// Komponen modal buat nampilin detail chart secara penuh
export default function ChartDetailModal({
  // Ambil status buka
  isOpen,
  // Ambil fungsi close
  onClose,
  // Ambil judul
  title,
  // Ambil jenis metrik
  metricType,
  // Ambil kategori program
  programCategories,
}: ChartDetailModalProps) {
  // Cek apakah komponen udah ke-mount di dom pake hooks sync external store
  const mounted = useSyncExternalStore(
    // Pake fungsi subscribe kosong
    emptySubscribe,
    // Kalo di client balikin true
    () => true,
    // Kalo di server balikin false
    () => false,
  );

  // State buat nyimpen kategori yang lagi dipilih user
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  // State buat nyimpen periode waktu yang lagi aktif
  const [selectedPeriod, setSelectedPeriod] = useState<string>("all");
  // State buat nyimpen bulan mulai filter
  const [startMonth, setStartMonth] = useState<string>("");
  // State buat nyimpen bulan akhir filter
  const [endMonth, setEndMonth] = useState<string>("");
  // State buat nyimpen urutan sort data (asc atau desc)
  const [sortOrder, setSortOrder] = useState<string>("desc");
  // State buat ganti tab metrik tv (tvr atau share)
  const [tvTab, setTvTab] = useState<string>("tvr");

  // Kalo belum ke-mount, jangan tampilin apa-apa
  if (!mounted) return null;

  // Kalo modal lagi ketutup, balikin null biar ga ngerender
  if (!isOpen) return null;

  // Ngembaliin portal buat ngerender modal di atas body
  return createPortal(
    // Overlay transparan biar user fokus ke modal
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      {/* Container utama modal dengan style card */}
      <div className="bg-card w-full max-w-4xl rounded-2xl border border-border p-6 shadow-xl">
        {/* Header modal yang isinya judul sama tombol tutup */}
        <div className="flex items-center justify-between mb-6">
          {/* Judul modal */}
          <h2 className="text-xl font-bold text-foreground">{title}</h2>
          {/* Tombol tutup modal */}
          <button
            // Pas diklik panggil fungsi onclose
            onClick={onClose}
            // Style buat tombol biar hover-nya cantik
            className="p-2 hover:bg-muted rounded-full transition-colors"
          >
            {/* Ikon X buat tutup */}
            <X size={20} />
          </button>
        </div>
        {/* Konten utama modal */}
        <div className="flex flex-col gap-6">
          {/* Baris kontrol filter */}
          <div className="flex items-center gap-4">
            {/* Select buat milih kategori */}
            <select
              // Value kategori terpilih
              value={selectedCategory}
              // Update state pas berubah
              onChange={(e) => setSelectedCategory(e.target.value)}
              // Style biar kayak custom component
              className="px-4 py-2 bg-background border border-border rounded-lg text-sm"
            >
              {/* Opsi kosong */}
              <option value="">Semua Kategori</option>
              {/* Mapping kategori dari props */}
              {programCategories.map((cat) => (
                // Opsi per kategori
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          {/* Area grafik */}
          <div className="h-[400px] w-full">
            {/* Panggil BaseChart dengan setting custom */}
            <BaseChart
              // Tipe chart disesuaiin
              type="bar"
              // Data mock program
              data={MOCK_PROGRAMS as unknown as ChartData<"bar">}
              // Opsi konfigurasi chart
              options={{
                // Matiin aspek rasio biar bisa ngikutin container
                maintainAspectRatio: false,
                // Pengaturan plugin buat zoom dan pan
                plugins: {
                  // Konfigurasi zoom
                  zoom: {
                    // Zoom mode xy biar bisa ke segala arah
                    zoom: {
                      mode: "xy",
                    },
                    // Pan mode xy biar bisa geser grafik
                    pan: {
                      enabled: true,
                      mode: "xy",
                    },
                  },
                },
                // Pengaturan sumbu grafik
                scales: {
                  // Sumbu x
                  x: {
                    // Konfigurasi label
                    ticks: {
                      // Pake format big number biar angka gede jadi gampang dibaca
                      callback: (val: string | number) =>
                        formatBigNumber(Number(val)),
                    },
                  },
                },
              }}
            />
          </div>
        </div>
      </div>
    </div>,
    // Target portal di body dokumen
    document.body,
  );
}
