"use client";

import React from "react";
// Import kumpulan icon dari lucide react
import { BarChart3, Download } from "lucide-react";
// Import komponen tabel
import SmartTable from "@/components/shared/SmartTable";
// Import modal detail program
import ProgramDetailModal from "@/components/shared/ProgramDetailModal";
// Import hook detail program buat ambil data
import { useDetailProgram } from "@/hooks/useDetailProgram";
// Import fungsi helper format angka besar biar enak dibaca
import { formatBigNumber } from "@/lib/formatters";
// Import komponen judul page
import PageHeader from "@/components/shared/PageHeader";
// Import kang excel buat export
import * as XLSX from "xlsx";

// Komponen page detail program
export default function DetailsContent() {
  // Tarik data sama kolom tabel dari hook
  const {
    programs,
    isLoading,
    selectedProgram,
    setSelectedProgram,
    selectFilters,
    columns,
    selectedPeriod,
    setSelectedPeriod,
    periodOptions,
    programSummary,
  } = useDetailProgram();

  // Fungsi helper buat nyari periode aktif pas export
  const getActivePeriodForExport = (item: any, targetPeriod: string) => {
    if (!item || !item.periods || item.periods.length === 0) return null;
    if (targetPeriod) {
      const found = item.periods.find((p: any) => p.month === targetPeriod);
      if (found) return found;
    }
    const sorted = [...item.periods].sort((a: any, b: any) =>
      b.month.localeCompare(a.month),
    );
    return sorted[0];
  };

  // Fungsi sakti buat nge-export data tabel ke excel sesuai schema
  const handleExportExcel = () => {
    if (!programs || programs.length === 0) return;

    // Rakit data mentah jadi barisan flat sesuai struktur schema
    const exportData = programs.map((prog) => {
      // Intip data bulan aktifnya
      const activePeriod = getActivePeriodForExport(prog, selectedPeriod);

      // Balikin wujud flat object buat tiap baris excel
      return {
        "Nama Program": prog.name || "-",
        Kategori: prog.category || "-",
        "Jam Tayang": prog.broadcastTime || "-",
        Periode: activePeriod?.month || "-",
        "Target TVR": activePeriod?.performanceTV?.targetTVR || 0,
        "Actual TVR": activePeriod?.performanceTV?.actualTVR || 0,
        "Target Share": activePeriod?.performanceTV?.targetShare || 0,
        "Actual Share": activePeriod?.performanceTV?.actualShare || 0,
        "Digital Views": activePeriod?.performanceDigital?.views || 0,
        "Digital Revenue": activePeriod?.performanceDigital?.revenue || 0,
        "Cost Direct": activePeriod?.financials?.costDirect || 0,
        "Revenue Target": activePeriod?.financials?.revenueTarget || 0,
        "Revenue Actual": activePeriod?.financials?.revenueActual || 0,
        "Net PNL": activePeriod?.financials?.pnl || 0,
        "Inventory Spot": activePeriod?.inventory?.spot || 0,
        "Ad Rate": activePeriod?.inventory?.adRate || 0,
        Status: activePeriod?.status || "-",
      };
    });

    // Sulap array of object jadi lembaran worksheet
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    // Bikin buku kerja excel baru
    const workbook = XLSX.utils.book_new();
    // Tempelin lembaran ke buku
    XLSX.utils.book_append_sheet(workbook, worksheet, "Detail_Program");
    // Perintah unduh filenya
    XLSX.writeFile(
      workbook,
      `Report_Detail_Program_${selectedPeriod || "All"}.xlsx`,
    );
  };

  return (
    <div className="p-4 md:px-8 md:py-6 space-y-6 max-w-[1800px] mx-auto animate-in fade-in duration-300">
      {/* Header container pake komponen reusable */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 border-b border-border/50 pb-6">
        <PageHeader
          icon={BarChart3}
          title="Detail Performa Program"
          description="Evaluasi target, capaian revenue, dan profitabilitas"
          rightContent={
            <button
              onClick={handleExportExcel}
              disabled={isLoading || programs.length === 0}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-full text-sm font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm w-full sm:w-auto justify-center"
            >
              <Download size={16} /> Export Excel
            </button>
          }
        />

        {/* Tutup dulu sementara gais ringkasan pnl nya
          Biar rapih dan ga menuh-menuhin layar sesuai request
        */}
        {/*
        <div className="flex flex-col items-start lg:items-end gap-2 w-full lg:w-auto">
          <div className="flex flex-col items-start lg:items-end">
            <span className="text-[11px] font-bold text-muted-foreground tracking-widest uppercase">
              Ringkasan PNL Program (
              {selectedPeriod || periodOptions[0] || "-"})
            </span>
          </div>
          <div className="flex w-full lg:w-auto bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
            <div className="flex flex-col flex-1 lg:flex-none p-3 px-5 border-r border-border min-w-[170px] bg-green-500/5 hover:bg-green-500/10 transition-colors">
              <span className="text-[11px] font-bold text-muted-foreground flex items-center gap-1 mb-1">
                {programSummary.profitCount} Program Profit{" "}
                <ArrowUpRight size={14} className="text-green-600" />
              </span>
              <span className="text-base font-bold text-green-600 tracking-tight">
                + Rp {formatBigNumber(programSummary.profitSum)}
              </span>
            </div>
            <div className="flex flex-col flex-1 lg:flex-none p-3 px-5 min-w-[170px] bg-destructive/5 hover:bg-destructive/10 transition-colors">
              <span className="text-[11px] font-bold text-muted-foreground flex items-center gap-1 mb-1">
                {programSummary.lossCount} Program Rugi{" "}
                <ArrowDownRight size={14} className="text-destructive" />
              </span>
              <span className="text-base font-bold text-destructive tracking-tight">
                - Rp {formatBigNumber(Math.abs(programSummary.lossSum))}
              </span>
            </div>
          </div>
        </div>
        */}
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-muted-foreground font-medium">
          Memuat data program...
        </div>
      ) : (
        <div className="border border-border bg-card shadow-sm rounded-2xl p-4">
          <SmartTable
            data={programs}
            columns={columns}
            selectFilters={selectFilters}
            // Tembak array opsi periode biar sejajar
            periodOptions={periodOptions}
            // Tembak state periode aktif
            selectedPeriod={selectedPeriod}
            // Tembak fungsi ubah periode
            onPeriodChange={setSelectedPeriod}
            enableDateRange={false}
            hidePagination={true}
            dateKey={(item) => {
              if (selectedPeriod) {
                const found = item.periods?.find(
                  (p) => p.month === selectedPeriod,
                );
                if (found) return found.month;
              }
              const sorted = [...(item.periods || [])].sort((a, b) =>
                b.month.localeCompare(a.month),
              );
              return sorted[0]?.month ?? "";
            }}
            searchPlaceholder="Cari nama program..."
          />
        </div>
      )}

      <ProgramDetailModal
        isOpen={!!selectedProgram}
        onClose={() => setSelectedProgram(null)}
        program={selectedProgram}
        initialPeriod={selectedPeriod}
      />
    </div>
  );
}
