"use client";

// Import react dari library react
import React from "react";
// Import komponen tabel pintar
import SmartTable from "@/components/shared/SmartTable";
// Import modal detail program
import ProgramDetailModal from "@/components/shared/ProgramDetailModal";
// Import hook detail program buat ambil data
import { useDetailProgram } from "@/hooks/useDetailProgram";
// Import kotak filter periode
import PeriodFilterBox from "@/components/shared/PeriodFilterBox";

// Komponen halaman detail program
export default function DetailProgramPage() {
  // Tarik data sama kolom tabel dari hook, ga butuh tvchart atau financechart di sini
  const {
    // List program hasil fetch
    programs,
    // Status loading data
    isLoading,
    // Data program yang lagi dipilih
    selectedProgram,
    // Fungsi buat ganti program terpilih
    setSelectedProgram,
    // Filter buat dropdown
    selectFilters,
    // Konfigurasi kolom tabel
    columns,
    // Periode yang lagi aktif dipilih
    selectedPeriod,
    // Fungsi buat ganti periode aktif
    setSelectedPeriod,
    // List opsi periode yang tersedia
    periodOptions,
  } = useDetailProgram();

  // Render konten halaman
  return (
    // Div kontainer utama dengan styling responsif
    <div className="p-4 md:px-8 md:py-6 space-y-6 max-w-[1800px] mx-auto animate-in fade-in duration-300">
      {/* Kondisional buat nampilin loading atau tabel */}
      {isLoading ? (
        // Teks loading kalo data masih ditarik
        <div className="p-12 text-center text-muted-foreground font-medium">
          Memuat data program...
        </div>
      ) : (
        // Div bungkus tabel pas data udah siap
        <div className="bg-card shadow-sm rounded-2xl p-4">
          {/* Komponen filter box periode */}
          <PeriodFilterBox
            // Kirim periode aktif
            selectedPeriod={selectedPeriod}
            // Kirim fungsi set periode
            setSelectedPeriod={setSelectedPeriod}
            // Kirim opsi periode
            periodOptions={periodOptions}
          />

          {/* Tabel pintar buat nampilin daftar program */}
          <SmartTable
            // Kirim data program
            data={programs}
            // Kirim konfigurasi kolom
            columns={columns}
            // Kirim filter dropdown
            selectFilters={selectFilters}
            // Aktifin filter rentang tanggal
            enableDateRange={true}
            // Fungsi buat ngambil key tanggal dari data
            dateKey={(item) => {
              // Cek periode aktif kalo ada
              if (selectedPeriod) {
                // Cari periode yang pas
                const found = item.periods?.find(
                  (p) => p.month === selectedPeriod,
                );
                // Balikin bulan kalo ketemu
                if (found) return found.month;
              }
              // Urutin periode kalo ga ketemu
              const sorted = [...(item.periods || [])].sort((a, b) =>
                b.month.localeCompare(a.month),
              );
              // Balikin bulan terbaru
              return sorted[0]?.month ?? "";
            }}
            // Placeholder buat input search
            searchPlaceholder="Cari nama program..."
          />
        </div>
      )}

      {/* Modal buat nampilin detail program kalo ada yang dipilih */}
      <ProgramDetailModal
        // Modal buka kalo selected program ada isinya
        isOpen={!!selectedProgram}
        // Fungsi buat tutup modal
        onClose={() => setSelectedProgram(null)}
        // Kirim data program
        program={selectedProgram}
      />
    </div>
  );
}
