"use client";

import React, { useState } from "react";
// Import createPortal buat ngerender modal di level root dom
import { createPortal } from "react-dom";
// Import koleksi icon dari lucide react
import {
  X,
  Tv,
  TrendingUp,
  MonitorPlay,
  Wallet,
  Layers,
  Tag,
  FileText,
  Activity,
  CalendarRange,
  Clock,
  Banknote,
} from "lucide-react";
// Import komponen ChartCard
import ChartCard from "@/components/shared/ChartCard";
// Import komponen reusable card statistik kecil yang udah dirombak boss
import AdvancedStatCard from "@/components/shared/AdvancedStatCard";
import TargetComparisonCard from "@/components/shared/TargetComparisonCard";
// Import fungsi helper format angka biar enak dibaca
import { formatNumberIndo } from "@/lib/formatters";
// Import skema tipe data buat form program
import { ProgramFormData } from "@/schemas/program";
// Import hook khusus penopang logika modal
import { useProgramDetailModal } from "@/hooks/useProgramDetailModal";

// Interface buat mendefinisikan tipe properti yang masuk ke modal ini
interface ProgramDetailModalProps {
  // Status buat buka atau tutup modal
  isOpen: boolean;
  // Fungsi callback buat nutup modal
  onClose: () => void;
  // Data program yang mau ditampilin detailnya
  program: ProgramFormData | null;
  // Periode default tarikan page utama
  initialPeriod?: string;
}

// Komponen utama buat nampilin detail program dalam bentuk modal
export default function ProgramDetailModal({
  // Ambil state open
  isOpen,
  // Ambil fungsi onClose
  onClose,
  // Ambil data program
  program,
  // Ambil periode awal
  initialPeriod,
}: ProgramDetailModalProps) {
  // Tancap hook pengolah data
  const {
    mounted,
    trendStartMonth,
    setTrendStartMonth,
    trendEndMonth,
    setTrendEndMonth,
    trendFilter,
    setTrendFilter,
    selectedMonth,
    setSelectedMonth,
    activeTab,
    setActiveTab,
    currentPeriodData,
    effectiveSelectedMonth,
    trendStats,
    trendLineChartData,
    trendLineChartOptions,
    tvChartData,
    financeDoughnutChartData,
    financeDoughnutChartOptions,
  } = useProgramDetailModal(program, initialPeriod);

  // State buat mode komparasi target
  const [compareMode, setCompareMode] = useState("prev");

  // Kalo kondisi render belum terpenuhi balikin null
  if (!isOpen || !program || !mounted) return null;

  const sortedPeriodsForOverview = [...(program.periods || [])].sort((a, b) =>
    a.month.localeCompare(b.month),
  );

  const currentMonthStr = effectiveSelectedMonth || selectedMonth;
  const currentOverviewIndex = sortedPeriodsForOverview.findIndex(
    (p) => p.month === currentMonthStr,
  );

  // Logika buat nentuin data pembanding berdasarkan mode
  let referenceData = null;
  let periodLabel = "vs Sebelumnya";

  if (compareMode === "prev") {
    // Ambil data bulan kemaren
    referenceData =
      currentOverviewIndex > 0
        ? sortedPeriodsForOverview[currentOverviewIndex - 1]
        : null;
    periodLabel = "Bulan Lalu (MoM)";
  } else if (compareMode === "qoq") {
    // Ambil data kuartal kemaren (mundur 3 bulan)
    if (currentMonthStr) {
      const [yearStr, monthStr] = currentMonthStr.split("-");
      let year = parseInt(yearStr);
      let month = parseInt(monthStr);

      // Mundurin 3 bulan
      month -= 3;
      // Cek kalo bulannya minus atau nol, berarti mundur tahun
      if (month <= 0) {
        month += 12;
        year -= 1;
      }

      // Susun lagi jadi format string YYYY-MM
      const qoqMonthStr = `${year}-${month.toString().padStart(2, "0")}`;
      // Cari data yang bulannya pas
      referenceData =
        sortedPeriodsForOverview.find((p) => p.month === qoqMonthStr) || null;
    }
    periodLabel = "Kuartal Lalu (QoQ)";
  } else if (compareMode === "yoy") {
    // Ambil data tahun kemaren
    if (currentMonthStr) {
      const [year, month] = currentMonthStr.split("-");
      const yoyMonthStr = `${parseInt(year) - 1}-${month}`;
      // Cari data yang tahunnya pas
      referenceData =
        sortedPeriodsForOverview.find((p) => p.month === yoyMonthStr) || null;
    }
    periodLabel = "Tahun Lalu (YoY)";
  }

  // Kalkulasi instan buat tab overview & komparasi (Capaian vs Target)
  const targetTVR = currentPeriodData?.performanceTV?.targetTVR ?? 0;
  const actualTVR = currentPeriodData?.performanceTV?.actualTVR ?? 0;

  const targetShare = currentPeriodData?.performanceTV?.targetShare ?? 0;
  const actualShare = currentPeriodData?.performanceTV?.actualShare ?? 0;

  const targetRev = currentPeriodData?.financials?.revenueTarget ?? 0;
  const actualRev = currentPeriodData?.financials?.revenueActual ?? 0;
  const digiRev = currentPeriodData?.performanceDigital?.revenue ?? 0;
  const totalActualRev = actualRev + digiRev;
  const selisihRev = totalActualRev - targetRev;
  const pctRev = targetRev > 0 ? (totalActualRev / targetRev) * 100 : 0;

  const pnlAkhir = currentPeriodData?.financials?.pnl ?? 0;
  const costDirect = currentPeriodData?.financials?.costDirect ?? 0;
  const roi = costDirect > 0 ? (pnlAkhir / costDirect) * 100 : 0;
  const npm = totalActualRev > 0 ? (pnlAkhir / totalActualRev) * 100 : 0;

  // Hitung prev values spesifik persentase buat dilempar ke card komparasi
  const prevTargetRev = referenceData?.financials?.revenueTarget ?? 0;
  const prevActualRev = referenceData?.financials?.revenueActual ?? 0;
  const prevDigiRev = referenceData?.performanceDigital?.revenue ?? 0;
  const prevTotalRev = prevActualRev + prevDigiRev;
  const prevPctRev =
    prevTargetRev > 0 ? (prevTotalRev / prevTargetRev) * 100 : 0;

  const prevPnlAkhir = referenceData?.financials?.pnl ?? 0;
  const prevCostDirect = referenceData?.financials?.costDirect ?? 0;
  const prevRoi =
    prevCostDirect > 0 ? (prevPnlAkhir / prevCostDirect) * 100 : 0;
  const prevNpm = prevTotalRev > 0 ? (prevPnlAkhir / prevTotalRev) * 100 : 0;

  // Render modal pake createportal buat nempel di body
  return createPortal(
    // Container overlay
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-2 sm:p-6">
      {/* Box modal utama */}
      <div className="bg-background w-full max-w-6xl max-h-[95vh] rounded-[28px] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-border">
        {/* Header modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 bg-card shrink-0">
          {/* Info judul program */}
          <div>
            <h2 className="text-4xl mb-3 font-bold text-foreground">
              {/*Detail: */} {program.name}
            </h2>
            {/* Box badge filter */}
            <div className="flex flex-wrap gap-2 mt-1">
              {/* Cek tab yang lagi aktif */}
              {activeTab === "overview" || activeTab === "komparasi" ? (
                // Badge periode buat tab overview
                <span className="text-sm font-medium px-2 py-0.5 bg-primary/10 text-primary rounded-md flex items-center gap-1">
                  <Clock size={14} /> Data Ditampilkan:{" "}
                  {effectiveSelectedMonth || "-"}
                </span>
              ) : (
                // Badge info buat tab tren
                <span className="text-sm font-medium px-2 py-0.5 bg-primary/10 text-primary rounded-md flex items-center gap-1">
                  <Activity size={12} /> Rentang Tren:{" "}
                  {trendFilter === "ytd"
                    ? "YTD"
                    : trendFilter === "all"
                      ? "All Time"
                      : trendFilter === "mtd"
                        ? "MTD"
                        : `${trendStartMonth || "Awal"} s/d ${trendEndMonth || "Akhir"}`}
                </span>
              )}
              {/* Badge kategori */}
              <span className="text-sm font-medium px-2 py-0.5 bg-muted text-muted-foreground rounded-md flex items-center gap-1">
                <Tag size={14} /> Kategori {program.category}
              </span>
              {/* Badge jenis deskripsi */}
              <span className="text-sm font-medium px-2 py-0.5 bg-muted text-muted-foreground rounded-md flex items-center gap-1">
                <FileText size={14} /> {program.descriptionCategory}
              </span>
            </div>
          </div>
          {/* Tombol buat nutup modal */}
          <button
            onClick={onClose}
            className="p-2 hover:bg-destructive/10 hover:text-destructive rounded-full cursor-pointer transition-colors focus:outline-none"
          >
            <X size={24} />
          </button>
        </div>

        {/* Tab navigasi buat switch grafik di header bodi */}
        <div className="flex bg-muted/20 border-b border-border">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-5 py-3 font-bold text-base transition-colors ${
              activeTab === "overview"
                ? "bg-background border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:bg-muted/50"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("komparasi")}
            className={`px-5 py-3 font-bold text-base transition-colors ${
              activeTab === "komparasi"
                ? "bg-background border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:bg-muted/50"
            }`}
          >
            Comparison
          </button>
        </div>

        {/* Konten scrollable */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6 bg-muted/10">
          {/* Kondisi render tab overview */}
          {activeTab === "overview" && (
            // Fragment isi overview
            <>
              {/* Baris pilihan periode */}
              <div className="flex items-center gap-3 bg-background p-4 rounded-2xl border border-border">
                <label className="text-sm font-bold text-foreground flex items-center gap-2">
                  Pilih Periode:
                </label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="bg-card border border-border rounded-xl px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer w-fit shadow-sm"
                >
                  {[...(program.periods || [])]
                    .sort((a, b) => b.month.localeCompare(a.month))
                    .map((p) => (
                      <option key={p.id} value={p.month}>
                        {p.month}
                      </option>
                    ))}
                </select>
              </div>
              {/* Grid 3 card statistik */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Card performa tv */}
                <div className="bg-card border border-border p-5 rounded-2xl shadow-sm space-y-4">
                  <h3 className="text-base font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 border-b border-border pb-2">
                    <Tv size={16} /> Performa Layar TV
                  </h3>
                  {/* Render TargetComparisonCard dengan bentuk flex col */}
                  <div className="flex flex-col gap-2">
                    <TargetComparisonCard
                      label="Capaian TVR"
                      actual={actualTVR}
                      target={targetTVR}
                    />
                    <TargetComparisonCard
                      label="Capaian Share"
                      actual={actualShare}
                      target={targetShare}
                    />
                  </div>
                </div>

                

                {/* Card profitabilitas */}
                <div className="bg-card border border-border p-5 rounded-2xl shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 border-b border-border pb-2">
                    <TrendingUp size={16} /> Profitabilitas & Anggaran
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-base font-semibold text-muted-foreground">
                        Cost Direct (Modal):
                      </span>
                      <span className="text-base font-bold text-foreground">
                        Rp{" "}
                        {formatNumberIndo(
                          currentPeriodData?.financials?.costDirect ?? 0,
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between items-center border-t border-border pt-2">
                      <span className="text-base font-semibold text-muted-foreground">
                        Net PNL Akhir:
                      </span>
                      <span
                        className={`text-base font-bold ${pnlAkhir >= 0 ? "text-green-500" : "text-destructive"}`}
                      >
                        Rp {formatNumberIndo(pnlAkhir)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center border-t border-border pt-2">
                      <span className="text-base font-semibold text-muted-foreground">
                        Return on Investment (ROI):
                      </span>
                      <span
                        className={`text-base font-bold ${roi >= 0 ? "text-green-500" : "text-destructive"}`}
                      >
                        {roi.toFixed(1)}%
                      </span>
                    </div>
                    {/* Baris Net Profit Margin */}
                    <div className="flex justify-between items-center border-t border-border pt-2">
                      <span className="text-base font-semibold text-muted-foreground">
                        Net Profit Margin (NPM):
                      </span>
                      <span
                        className={`text-base font-bold ${npm >= 0 ? "text-green-500" : "text-destructive"}`}
                      >
                        {npm.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center border-t border-border pt-2">
                      <span className="text-base font-semibold text-muted-foreground">
                        Status:
                      </span>
                      <span
                        className={`text-base font-bold ${pnlAkhir >= 0 ? "text-green-500" : "text-destructive"}`}
                      >
                        {currentPeriodData?.status ?? "Normal"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>


              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                <div className="bg-card border border-border p-5 rounded-2xl shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 border-b border-border pb-2">
                    <Banknote size={16} /> Capaian Revenue
                  </h3>
                  
                  <div className="flex flex-row gap-24">
                    {/* Capaian TV */}
                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <span className="text-lg font-semibold text-muted-foreground block">
                        Capaian TV
                      </span>
                      <span className="text-2xl font-semibold text-primary">
                        Rp {formatNumberIndo(actualRev)}
                      </span>
                    </div>
                    {/* Capaian Digital */}
                    <div>
                      <span className="text-lg font-semibold text-muted-foreground block">
                        Capaian Digital
                      </span>
                      <span className="text-2xl font-semibold text-yellow-500">
                        Rp {formatNumberIndo(digiRev)}
                      </span>
                    </div>
                  </div>
                  {/* Target Capaian TV */}
                    <div className="col-span-2">
                      <span className="text-lg font-semibold text-muted-foreground block">
                        Target Capaian
                      </span>
                      <span className="text-2xl font-bold text-foreground">
                        Rp {formatNumberIndo(targetRev)}
                      </span>
                    </div>
                  </div>
                  
                  
                </div>

                <div className="bg-card border border-border p-5 rounded-2xl shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 border-b border-border pb-2">
                    <Banknote size={16} /> Revenue Finansial
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                  
                    {/* Ringkasan gabungan revenue */}
                    <div className="col-span-2">
                      <div className="flex flex-col justify-between">
                        <span className="text-lg font-semibold text-muted-foreground">
                          Total (TV + Digital)
                        </span>
                        <span
                          className={`text-2xl font-semibold ${totalActualRev >= targetRev ? "text-green-500" : "text-destructive"}`}
                        >
                          Rp {formatNumberIndo(totalActualRev)}
                        </span>
                      </div>
                      <div className="flex flex-col justify-between mt-4">
                        <span className="text-lg text-muted-foreground">
                          Persentase & Selisih
                        </span>
                        <span
                          className={`text-2xl font-semibold ${totalActualRev >= targetRev ? "text-green-500" : "text-destructive"}`}
                        >
                          {pctRev.toFixed(1)}% (
                          {selisihRev >= 0 ? "+Rp " : "-Rp "}
                          {formatNumberIndo(Math.abs(selisihRev))})
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card profitabilitas */}
                <div className="bg-card border border-border p-5 rounded-2xl shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 border-b border-border pb-2">
                    <TrendingUp size={16} /> Profitabilitas & Anggaran
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">
                        Cost Direct (Modal):
                      </span>
                      <span className="text-sm font-bold text-foreground">
                        Rp{" "}
                        {formatNumberIndo(
                          currentPeriodData?.financials?.costDirect ?? 0,
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between items-center border-t border-border pt-2">
                      <span className="text-xs text-muted-foreground">
                        Net PNL Akhir:
                      </span>
                      <span
                        className={`text-base font-bold ${pnlAkhir >= 0 ? "text-green-600" : "text-destructive"}`}
                      >
                        Rp {formatNumberIndo(pnlAkhir)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center border-t border-border pt-2">
                      <span className="text-xs text-muted-foreground">
                        Return on Investment (ROI):
                      </span>
                      <span
                        className={`text-sm font-bold ${roi >= 0 ? "text-green-600" : "text-destructive"}`}
                      >
                        {roi.toFixed(1)}%
                      </span>
                    </div>
                    {/* Baris Net Profit Margin */}
                    <div className="flex justify-between items-center border-t border-border pt-2">
                      <span className="text-xs text-muted-foreground">
                        Net Profit Margin (NPM):
                      </span>
                      <span
                        className={`text-sm font-bold ${npm >= 0 ? "text-green-600" : "text-destructive"}`}
                      >
                        {npm.toFixed(1)}%
                      </span>
                    </div>
                    {/* <div className="flex justify-between items-center border-t border-border pt-2">
                      <span className="text-xs text-muted-foreground">
                        Status:
                      </span>
                      <span
                        className={`text-sm font-bold ${pnlAkhir >= 0 ? "text-green-600" : "text-destructive"}`}
                      >
                        {currentPeriodData?.status ?? "Normal"}
                      </span>
                    </div> */}
                  </div>
                </div>
              </div>

              {/* Grid 2 grafik */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-card border border-border rounded-2xl shadow-sm flex flex-col overflow-hidden">
                  {/* Cek data tv chart ada baru render pake ChartCard */}
                  {tvChartData && (
                    <ChartCard
                      type="bar"
                      title="Performa TV (Target vs Capaian)"
                      data={tvChartData}
                      height={320}
                    />
                  )}
                </div>

                <div className="bg-card border border-border rounded-2xl shadow-sm flex flex-col overflow-hidden">
                  {/* Cek data finance chart ada baru render pake ChartCard */}
                  {financeDoughnutChartData && (
                    <ChartCard
                      type="doughnut"
                      title="Struktur Anggaran & Realisasi"
                      data={financeDoughnutChartData}
                      height={320}
                      options={financeDoughnutChartOptions}
                    />
                  )}
                </div>
              </div>

              {/* Grid 3 info ekstra */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-card border border-border p-5 rounded-2xl shadow-sm flex flex-col justify-between">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <MonitorPlay size={14} /> Distribusi Digital
                  </span>
                  <div className="space-y-1">
                    <div className="text-sm font-medium text-muted-foreground">
                      Total Views Konten
                    </div>
                    <div className="text-xl font-bold text-foreground">
                      {formatNumberIndo(
                        currentPeriodData?.performanceDigital?.views ?? 0,
                      )}{" "}
                      Views 
                    </div>
                  </div>
                </div>

                <div className="bg-card border border-border p-5 rounded-2xl shadow-sm flex flex-col justify-between">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Layers size={14} /> Kapasitas Komersial
                  </span>
                  <div className="space-y-1">
                    <div className="text-sm font-medium text-muted-foreground">
                      Inventory Spot Iklan:
                    </div>
                    <div className="text-xl font-bold text-foreground">
                      {currentPeriodData?.inventory?.spot ?? 0} Slot Tersedia
                    </div>
                  </div>
                </div>

                <div className="bg-card border border-border p-5 rounded-2xl shadow-sm flex flex-col justify-between">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Wallet size={14} /> Nilai Jual Produk
                  </span>
                  <div className="space-y-1">
                    <div className="text-sm font-medium text-muted-foreground">
                      Rate Card per Spot:
                    </div>
                    <div className="text-xl font-bold text-foreground">
                      Rp{" "}
                      {formatNumberIndo(
                        currentPeriodData?.inventory?.adRate ?? 0,
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Kondisi render tab tren */}
          {activeTab === "trend" && (
            // Fragment isi tren
            <div className="bg-background border border-border rounded-2xl shadow-sm p-5 flex flex-col gap-4 mt-2">
              {/* Header kontrol tren */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between border-b border-border pb-4 gap-4">
                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Activity size={16} className="text-primary" />
                  Trend Historis
                </h3>

                <div className="flex flex-wrap items-center gap-3">
                  {/* Select filter tren */}
                  <select
                    value={trendFilter}
                    onChange={(e) => setTrendFilter(e.target.value)}
                    className="bg-muted border border-border rounded-xl px-4 py-1.5 text-xs outline-none focus:ring-1 focus:ring-primary cursor-pointer shadow-sm"
                  >
                    <option value="ytd">YTD</option>
                    <option value="mtd">MTD</option>
                    <option value="all">All Time</option>
                    <option value="custom">Custom</option>
                  </select>

                  {/* Input bulan custom */}
                  {trendFilter === "custom" && (
                    <div className="flex items-center gap-2 bg-muted/40 px-3 py-1.5 rounded-xl border border-border">
                      <CalendarRange
                        size={14}
                        className="text-muted-foreground"
                      />
                      <input
                        type="month"
                        value={trendStartMonth}
                        onChange={(e) => setTrendStartMonth(e.target.value)}
                        className="bg-transparent text-xs outline-none cursor-pointer text-foreground"
                      />
                      <span className="text-xs text-muted-foreground">s/d</span>
                      <input
                        type="month"
                        value={trendEndMonth}
                        onChange={(e) => setTrendEndMonth(e.target.value)}
                        className="bg-transparent text-xs outline-none cursor-pointer text-foreground"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Grid angka summary tren */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Grafik line tren pake ChartCard */}
                <div className="lg:col-span-12 bg-muted/10 rounded-xl border border-border/50 overflow-hidden">
                  {/* Render chart line kalo ada data */}
                  {trendLineChartData && (
                    <ChartCard
                      type="line"
                      title="Komparasi Matrik (Gunakan Legend untuk Tampil/Sembunyi)"
                      data={trendLineChartData}
                      height={360}
                      showZoomControls={true}
                      options={trendLineChartOptions}
                    />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Kondisi render tab komparasi */}
          {activeTab === "komparasi" && (
            <div className="flex flex-col gap-6">
              {/* Baris pilihan periode & select perbandingan */}
              <div className="flex flex-wrap items-center gap-6 bg-background p-4 rounded-2xl border border-border">
                {/* Pilihan periode detail */}
                <div className="flex items-center gap-3">
                  <label className="text-sm font-bold text-foreground flex items-center gap-2">
                    Pilih Periode:
                  </label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="bg-card border border-border rounded-xl px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer w-fit shadow-sm"
                  >
                    {[...(program.periods || [])]
                      .sort((a, b) => b.month.localeCompare(a.month))
                      .map((p) => (
                        <option key={p.id} value={p.month}>
                          {p.month}
                        </option>
                      ))}
                  </select>
                </div>

                {/* Select opsi komparasi */}
                <div className="flex flex-col md:flex-row items-center gap-3">
                  
                  <div className="flex items-center gap-3"> 
                    <label className="text-sm font-bold text-foreground flex items-center gap-2">
                      Bandingkan:
                    </label>
                    <select
                      value={compareMode}
                      onChange={(e) => setCompareMode(e.target.value)}
                      className="bg-card border border-border rounded-xl px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer w-fit shadow-sm"
                    >
                      <option value="prev">MoM</option>
                      <option value="yoy">YoY</option>
                    </select>
                  </div>
                 
                  {/* Teks info penanda periode yang lagi dibandingin */}
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground  md:border-l border-border md:pl-3">
                    <span className="text-foreground font-bold bg-muted/50 px-2 py-1 rounded-md">
                      {currentMonthStr || "-"}
                    </span>
                    vs
                    <span className="text-foreground font-bold bg-muted/50 px-2 py-1 rounded-md">
                      {referenceData?.month || "-"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Grid dirubah dikit biar card Head to Head dapet space napas yang enak */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-card border border-border p-5 rounded-2xl shadow-sm space-y-4">
                  <h3 className="text-xl font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 border-b border-border pb-2">
                    <Tv size={18} /> Performa Layar TV
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    <AdvancedStatCard
                      label="Capaian TVR"
                      value={actualTVR}
                      periodLabel={periodLabel}
                      referenceValue={referenceData?.performanceTV?.actualTVR}
                    />
                    <AdvancedStatCard
                      label="Capaian Share"
                      value={actualShare}
                      periodLabel={periodLabel}
                      referenceValue={referenceData?.performanceTV?.actualShare}
                    />
                  </div>
                </div>

                <div className="bg-card border border-border p-5 rounded-2xl shadow-sm space-y-4">
                  <h3 className="text-xl font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 border-b border-border pb-2">
                    <Banknote size={18} /> Revenue Finansial
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    <AdvancedStatCard
                      label="Total Revenue (TV + Digital)"
                      value={totalActualRev}
                      prefix="Rp"
                      periodLabel={periodLabel}
                      referenceValue={prevTotalRev}
                    />
                    <AdvancedStatCard
                      label="Capaian Target Revenue"
                      value={pctRev}
                      suffix="%"
                      periodLabel={periodLabel}
                      referenceValue={prevPctRev}
                    />
                    <AdvancedStatCard
                      label="Digital Revenue"
                      value={digiRev}
                      prefix="Rp"
                      periodLabel={periodLabel}
                      referenceValue={
                        referenceData?.performanceDigital?.revenue
                      }
                    />
                  </div>
                </div>

                <div className="bg-card border border-border p-5 rounded-2xl shadow-sm space-y-4 flex flex-col lg:col-span-2">
                  <h3 className="text-xl font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 border-b border-border pb-2">
                    <TrendingUp size={18} /> Profitabilitas & Anggaran
                  </h3>
                  <div className="grid grid-cols-1 flex-1">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <AdvancedStatCard
                        label="Net PNL Akhir"
                        value={pnlAkhir}
                        prefix="Rp"
                        periodLabel={periodLabel}
                        referenceValue={referenceData?.financials?.pnl}
                      />
                      <AdvancedStatCard
                        label="Cost Direct"
                        value={costDirect}
                        prefix="Rp"
                        inverse={true}
                        periodLabel={periodLabel}
                        referenceValue={referenceData?.financials?.costDirect}
                      />
                      <AdvancedStatCard
                        label="ROI"
                        value={roi}
                        suffix="%"
                        periodLabel={periodLabel}
                        referenceValue={prevRoi}
                      />
                      <AdvancedStatCard
                        label="Net Profit Margin"
                        value={npm}
                        suffix="%"
                        periodLabel={periodLabel}
                        referenceValue={prevNpm}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="bg-card border border-border p-5 rounded-2xl shadow-sm space-y-4">
                  <span className="text-xl font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5 border-b border-border pb-2">
                    <MonitorPlay size={16} /> Distribusi Digital
                  </span>
                  <AdvancedStatCard
                    label="Total Views Konten"
                    value={currentPeriodData?.performanceDigital?.views ?? 0}
                    periodLabel={periodLabel}
                    referenceValue={referenceData?.performanceDigital?.views}
                  />
                </div>

                <div className="bg-card border border-border p-5 rounded-2xl shadow-sm space-y-4">
                  <span className="text-xl font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5 border-b border-border pb-2">
                    <Layers size={16} /> Kapasitas Komersial
                  </span>
                  <AdvancedStatCard
                    label="Inventory Spot Iklan"
                    value={currentPeriodData?.inventory?.spot ?? 0}
                    suffix=" Slot"
                    periodLabel={periodLabel}
                    referenceValue={referenceData?.inventory?.spot}
                  />
                </div>

                <div className="bg-card border border-border p-5 rounded-2xl shadow-sm space-y-4">
                  <span className="text-xl font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5 border-b border-border pb-2">
                    <Wallet size={16} /> Nilai Jual Produk
                  </span>
                  <AdvancedStatCard
                    label="Rate Card per Spot"
                    value={currentPeriodData?.inventory?.adRate ?? 0}
                    prefix="Rp"
                    periodLabel={periodLabel}
                    referenceValue={referenceData?.inventory?.adRate}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    // Target render portal
    document.body,
  );
}
