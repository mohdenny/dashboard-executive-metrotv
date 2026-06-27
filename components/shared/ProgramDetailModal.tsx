"use client";

// Import React buat bikin komponen
import React, {
  // Import hook useEffect buat jalanin side effect
  useEffect,
  // Import hook useState buat simpen state internal
  useState,
  // Import hook useMemo buat optimalisasi hitungan
  useMemo,
  // Import hook useSyncExternalStore buat handle data eksternal
  useSyncExternalStore,
} from "react";
// Import createPortal buat ngerender modal di level root dom
import { createPortal } from "react-dom";
// Import koleksi ikon dari lucide react
import {
  X,
  Tv,
  DollarSign,
  TrendingUp,
  MonitorPlay,
  Wallet,
  Layers,
  Tag,
  FileText,
  Activity,
  CalendarRange,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
} from "lucide-react";
// Import komponen BaseChart buat nampilin grafik
import BaseChart from "@/components/shared/BaseChart";
// Import fungsi helper format angka biar enak dibaca
import { formatBigNumber, formatNumberIndo } from "@/lib/formatters";
// Import tipe data chart js
import { ChartData, ChartOptions, TooltipItem } from "chart.js";
// Import skema tipe data buat form program
import { ProgramFormData } from "@/schemas/program";

// Interface buat mendefinisikan tipe properti yang masuk ke modal ini
interface ProgramDetailModalProps {
  // Status buat buka atau tutup modal
  isOpen: boolean;
  // Fungsi callback buat nutup modal
  onClose: () => void;
  // Data program yang mau ditampilin detailnya
  program: ProgramFormData | null;
}

// Fungsi dummy buat bantu sinkronisasi store eksternal
const emptySubscribe = () => () => {};

// Komponen utama buat nampilin detail program dalam bentuk modal
export default function ProgramDetailModal({
  // Ambil state open
  isOpen,
  // Ambil fungsi onClose
  onClose,
  // Ambil data program
  program,
}: ProgramDetailModalProps) {
  // Hook buat mastiin komponen cuma render di browser biar ga error
  const mounted = useSyncExternalStore(
    // Pake fungsi kosong
    emptySubscribe,
    // Kalo di client balikin true
    () => true,
    // Kalo di server balikin false
    () => false,
  );

  // State buat simpen input bulan mulai filter tren
  const [trendStartMonth, setTrendStartMonth] = useState<string>("");
  // State buat simpen input bulan akhir filter tren
  const [trendEndMonth, setTrendEndMonth] = useState<string>("");
  // State buat simpen pilihan filter tren
  const [trendFilter, setTrendFilter] = useState<string>("all");
  // State buat simpen bulan yang lagi aktif dipilih
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  // State buat ganti tab antara overview atau tren
  const [activeTab, setActiveTab] = useState<"overview" | "trend">("overview");

  // Memo buat urutin data periode biar pas tampil udah rapi
  const sortedPeriods = useMemo(() => {
    // Kalo data periode kosong balikin array kosong
    if (!program?.periods) return [];
    // Sortir data berdasarkan bulan biar urut
    return [...program.periods].sort((a, b) => a.month.localeCompare(b.month));
  }, [program]);

  // Efek buat set bulan terpilih ke periode paling baru pas modal buka
  useEffect(() => {
    // Kalo ada data periode, set ke bulan terakhir
    if (sortedPeriods.length > 0) {
      setSelectedMonth(sortedPeriods[sortedPeriods.length - 1].month);
    }
  }, [sortedPeriods, isOpen]);

  // Memo buat dapetin data periode spesifik yang lagi dipilih
  const currentPeriodData = useMemo(() => {
    // Kalo ga ada data balikin null
    if (!program?.periods) return null;
    // Cari periode yang bulan-nya cocok sama pilihan user
    return (
      program.periods.find((p) => p.month === selectedMonth) ||
      sortedPeriods[sortedPeriods.length - 1]
    );
  }, [program, selectedMonth, sortedPeriods]);

  // Memo buat bikin string display periode yang lagi aktif
  const periodDisplay = useMemo(() => {
    // Kalo datanya kosong kasih tanda strip
    if (sortedPeriods.length === 0) return "-";
    // Kalo cuma satu periode, tampilin bulan itu aja
    if (sortedPeriods.length === 1) return sortedPeriods[0].month;
    // Kalo lebih, tampilin range bulan awal sampe bulan akhir
    return `${sortedPeriods[0].month} s/d ${sortedPeriods[sortedPeriods.length - 1].month}`;
  }, [sortedPeriods]);

  // Memo buat nyaring data buat chart tren sesuai filter yang dipasang
  const filteredTrendPeriods = useMemo(() => {
    // Awalnya ambil data periode yang udah urut
    let result = sortedPeriods;
    // Kalo filter YTD, saring data cuma buat tahun ini
    if (trendFilter === "ytd") {
      const currentYear = new Date().getFullYear().toString();
      result = result.filter((p) => p.month.startsWith(currentYear));
    } else if (trendFilter === "mtd") {
      // Kalo MTD, saring data buat bulan ini aja
      const currentMonth = new Date().toISOString().slice(0, 7);
      result = result.filter((p) => p.month === currentMonth);
    } else if (trendFilter === "custom") {
      // Kalo custom, saring berdasarkan input user
      if (trendStartMonth) {
        result = result.filter((p) => p.month >= trendStartMonth);
      }
      if (trendEndMonth) {
        result = result.filter((p) => p.month <= trendEndMonth);
      }
    }
    // Balikin hasil saringan
    return result;
  }, [sortedPeriods, trendStartMonth, trendEndMonth, trendFilter]);

  // Fungsi buat hitung statistik tren kenaikan atau penurunan
  const calculateTrend = (metricKey: string) => {
    // Kalo data kosong balikin nilai awal default
    if (filteredTrendPeriods.length === 0) return { val: 0, pct: 0, up: true };
    // Kalo cuma ada satu data ga bisa bandingin
    if (filteredTrendPeriods.length === 1) {
      const p = filteredTrendPeriods[0];
      return { val: getMetricValue(p, metricKey), pct: 0, up: true };
    }
    // Ambil nilai periode terakhir
    const last = getMetricValue(
      filteredTrendPeriods[filteredTrendPeriods.length - 1],
      metricKey,
    );
    // Ambil nilai periode sebelumnya
    const prev = getMetricValue(
      filteredTrendPeriods[filteredTrendPeriods.length - 2],
      metricKey,
    );
    // Hitung selisihnya
    const diff = last - prev;
    // Hitung persentase kenaikan
    const pct = prev === 0 ? 100 : (diff / prev) * 100;
    // Balikin status tren naik atau turun
    return { val: last, pct: Math.abs(pct), up: diff >= 0 };
  };

  // Fungsi bantu buat ngambil nilai metrik dari objek periode
  const getMetricValue = (p: ProgramFormData["periods"][0], metric: string) => {
    // Kalo objek periode ga ada balikin nol
    if (!p) return 0;
    // Cek key metrik terus balikin nilainya sesuai tipe
    switch (metric) {
      case "rev":
        return p.financials.revenueActual;
      case "pnl":
        return p.financials.pnl;
      case "cost":
        return p.financials.costDirect;
      case "tvr":
        return p.performanceTV.actualTVR;
      case "share":
        return p.performanceTV.actualShare;
      case "views":
        return p.performanceDigital.views;
      default:
        return 0;
    }
  };

  // Memo buat nyimpen hasil hitungan statistik tren buat semua metrik
  const trendStats = useMemo(
    () => ({
      rev: calculateTrend("rev"),
      pnl: calculateTrend("pnl"),
      cost: calculateTrend("cost"),
      tvr: calculateTrend("tvr"),
      share: calculateTrend("share"),
      views: calculateTrend("views"),
    }),
    [filteredTrendPeriods],
  );

  // Memo buat susun struktur data grafik garis tren
  const trendLineChartData = useMemo<ChartData<"line"> | null>(() => {
    // Kalo ga ada data, balikin null
    if (filteredTrendPeriods.length === 0) return null;
    // Balikin objek data chart line
    return {
      labels: filteredTrendPeriods.map((p) => p.month),
      datasets: [
        {
          label: "Net PNL",
          data: filteredTrendPeriods.map((p) => p.financials.pnl),
          borderColor: "#16a34a",
          backgroundColor: "#16a34a",
          yAxisID: "y",
          tension: 0.4,
          hidden: false,
        },
        {
          label: "Revenue Aktual",
          data: filteredTrendPeriods.map((p) => p.financials.revenueActual),
          borderColor: "#1f77b4",
          backgroundColor: "#1f77b4",
          yAxisID: "y",
          tension: 0.4,
          hidden: true,
        },
        {
          label: "Cost Direct",
          data: filteredTrendPeriods.map((p) => p.financials.costDirect),
          borderColor: "#ff7f0e",
          backgroundColor: "#ff7f0e",
          yAxisID: "y",
          tension: 0.4,
          hidden: true,
        },
        {
          label: "Digital Views",
          data: filteredTrendPeriods.map((p) => p.performanceDigital.views),
          borderColor: "#8b5cf6",
          backgroundColor: "#8b5cf6",
          yAxisID: "y",
          tension: 0.4,
          hidden: true,
        },
        {
          label: "TVR",
          data: filteredTrendPeriods.map((p) => p.performanceTV.actualTVR),
          borderColor: "#ec4899",
          backgroundColor: "#ec4899",
          yAxisID: "y1",
          tension: 0.4,
          hidden: false,
        },
        {
          label: "Share",
          data: filteredTrendPeriods.map((p) => p.performanceTV.actualShare),
          borderColor: "#06b6d4",
          backgroundColor: "#06b6d4",
          yAxisID: "y1",
          tension: 0.4,
          hidden: false,
        },
      ],
    };
  }, [filteredTrendPeriods]);

  // Konfigurasi opsi chart line biar interaktif
  const trendLineChartOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index",
      intersect: false,
    },
    plugins: {
      legend: {
        display: true,
        position: "bottom",
        labels: { usePointStyle: true, boxWidth: 8 },
      },
      tooltip: {
        callbacks: {
          label: function (context: TooltipItem<"line">) {
            let label = context.dataset.label || "";
            let val = context.parsed.y;
            // Kalo tv atau share, ga pake embel2 rupiah
            if (label === "TVR" || label === "Share") {
              return `${label}: ${val}`;
            }
            // Sisanya pake format rupiah
            return `${label}: Rp ${formatNumberIndo(val ?? 0)}`;
          },
        },
      },
      zoom: {
        zoom: {
          mode: "xy",
        },
        pan: {
          enabled: true,
          mode: "xy",
        },
      },
    },
    scales: {
      x: { grid: { display: false } },
      y: {
        type: "linear",
        display: true,
        position: "left",
        title: { display: true, text: "Rupiah / Views" },
        ticks: {
          // Format angka gede biar ga kepanjangan
          callback: function (value: string | number) {
            return formatBigNumber(Number(value));
          },
        },
      },
      y1: {
        type: "linear",
        display: true,
        position: "right",
        title: { display: true, text: "TVR / Share" },
        grid: { drawOnChartArea: false },
        ticks: {
          // Format angka biasa buat tvr share
          callback: function (value: string | number) {
            return Number(value).toLocaleString("id-ID");
          },
        },
      },
    },
  };

  // Memo data grafik bar performa tv
  const tvChartData = useMemo<ChartData<"bar"> | null>(() => {
    // Kalo ga ada data periode balikin null
    if (!currentPeriodData) return null;
    // Balikin objek data bar
    return {
      labels: ["TVR", "Share"],
      datasets: [
        {
          label: "Target",
          data: [
            currentPeriodData.performanceTV?.targetTVR ?? 0,
            currentPeriodData.performanceTV?.targetShare ?? 0,
          ],
          backgroundColor: "#4bc0c0",
          minBarLength: 10,
        },
        {
          label: "Aktual",
          data: [
            currentPeriodData.performanceTV?.actualTVR ?? 0,
            currentPeriodData.performanceTV?.actualShare ?? 0,
          ],
          backgroundColor: "#1f77b4",
          minBarLength: 10,
        },
      ],
    };
  }, [currentPeriodData]);

  // Memo data grafik donat finansial
  const financeDoughnutChartData = useMemo<ChartData<"doughnut"> | null>(() => {
    // Kalo ga ada data periode balikin null
    if (!currentPeriodData) return null;
    const pnl = currentPeriodData.financials?.pnl ?? 0;
    // Balikin data donat
    return {
      labels: [
        "Target Rev",
        "Aktual Rev",
        "Cost Direct",
        "Digital Rev",
        "Net PNL",
      ],
      datasets: [
        {
          data: [
            currentPeriodData.financials?.revenueTarget ?? 0,
            currentPeriodData.financials?.revenueActual ?? 0,
            currentPeriodData.financials?.costDirect ?? 0,
            currentPeriodData.performanceDigital?.revenue ?? 0,
            Math.abs(pnl),
          ],
          backgroundColor: [
            "#4bc0c0",
            "#1f77b4",
            "#ff7f0e",
            "#8b5cf6",
            pnl >= 0 ? "#16a34a" : "#d62728",
          ],
        },
      ],
    };
  }, [currentPeriodData]);

  // Memo konfigurasi tooltip donat
  const financeDoughnutChartOptions: ChartOptions<"doughnut"> = useMemo(
    () => ({
      plugins: {
        tooltip: {
          callbacks: {
            label: function (context: TooltipItem<"doughnut">) {
              const label = context.label || "";
              const value = context.parsed || 0;
              const pnl = currentPeriodData?.financials?.pnl ?? 0;
              // Kalo net pnl minus, kasih tanda minus
              if (label === "Net PNL" && pnl < 0) {
                return `${label}: Rp -${formatNumberIndo(value)}`;
              }
              // Format normal rupiah
              return `${label}: Rp ${formatNumberIndo(value)}`;
            },
          },
        },
      },
    }),
    [currentPeriodData],
  );

  // Kalo kondisi render belum terpenuhi balikin null
  if (!isOpen || !program || !mounted) return null;

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
            <h2 className="text-xl font-bold text-foreground">
              {program.name}
            </h2>
            {/* Box badge filter */}
            <div className="flex flex-wrap gap-2 mt-1">
              {/* Cek tab yang lagi aktif */}
              {activeTab === "overview" ? (
                // Badge periode buat tab overview
                <span className="text-xs font-medium px-2 py-0.5 bg-primary/10 text-primary rounded-md flex items-center gap-1">
                  <Clock size={12} /> Data Ditampilkan:{" "}
                  {selectedMonth || periodDisplay}
                </span>
              ) : (
                // Badge info buat tab tren
                <span className="text-xs font-medium px-2 py-0.5 bg-primary/10 text-primary rounded-md flex items-center gap-1">
                  <Activity size={12} /> Rentang Tren:{" "}
                  {trendFilter === "all"
                    ? "All Time"
                    : trendFilter === "ytd"
                      ? "YTD"
                      : trendFilter === "mtd"
                        ? "MTD"
                        : `${trendStartMonth || "Awal"} s/d ${trendEndMonth || "Akhir"}`}
                </span>
              )}
              {/* Badge kategori */}
              <span className="text-xs font-medium px-2 py-0.5 bg-muted text-muted-foreground rounded-md flex items-center gap-1">
                <Tag size={12} /> Kategori {program.category}
              </span>
              {/* Badge jenis deskripsi */}
              <span className="text-xs font-medium px-2 py-0.5 bg-muted text-muted-foreground rounded-md flex items-center gap-1">
                <FileText size={12} /> {program.descriptionCategory}
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

        {/* Konten scrollable */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
          {/* Kondisi render tab overview */}
          {activeTab === "overview" && (
            // Fragment isi overview
            <>
              {/* Baris pilihan periode */}
              <div className="flex items-center gap-3 bg-muted/30 p-4 rounded-2xl border border-border">
                <label className="text-sm font-bold text-foreground flex items-center gap-2">
                  <CalendarRange size={16} className="text-primary" />
                  Pilih Periode Detail:
                </label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="bg-card border border-border rounded-xl px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer w-48 shadow-sm"
                >
                  {[...(program.periods || [])]
                    .sort((a, b) => b.month.localeCompare(a.month))
                    .map((p) => (
                      <option key={p.id} value={p.month}>
                        {p.month} {p.status ? `(${p.status})` : ""}
                      </option>
                    ))}
                </select>
              </div>

              {/* Grid 3 kartu statistik */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Kartu performa tv */}
                <div className="bg-card border border-border p-5 rounded-2xl shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 border-b border-border pb-2">
                    <Tv size={16} /> Performa Layar TV
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs text-muted-foreground block">
                        Target TVR
                      </span>
                      <span className="text-xl font-bold text-foreground">
                        {currentPeriodData?.performanceTV?.targetTVR ?? 0}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground block">
                        Capaian TVR
                      </span>
                      <span className="text-xl font-bold text-primary">
                        {currentPeriodData?.performanceTV?.actualTVR ?? 0}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground block">
                        Target Share
                      </span>
                      <span className="text-xl font-bold text-foreground">
                        {currentPeriodData?.performanceTV?.targetShare ?? 0}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground block">
                        Capaian Share
                      </span>
                      <span
                        className={`text-xl font-bold ${(currentPeriodData?.performanceTV?.actualShare ?? 0) >= (currentPeriodData?.performanceTV?.targetShare ?? 0) ? "text-green-600" : "text-destructive"}`}
                      >
                        {currentPeriodData?.performanceTV?.actualShare ?? 0}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Kartu revenue */}
                <div className="bg-card border border-border p-5 rounded-2xl shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 border-b border-border pb-2">
                    <DollarSign size={16} /> Revenue Finansial
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <span className="text-xs text-muted-foreground block">
                        Target Revenue
                      </span>
                      <span className="text-lg font-bold text-foreground">
                        Rp{" "}
                        {formatNumberIndo(
                          currentPeriodData?.financials?.revenueTarget ?? 0,
                        )}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground block">
                        Capaian Revenue
                      </span>
                      <span className="text-base font-bold text-primary">
                        Rp{" "}
                        {formatNumberIndo(
                          currentPeriodData?.financials?.revenueActual ?? 0,
                        )}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground block">
                        Digital Revenue
                      </span>
                      <span className="text-base font-bold text-yellow-600">
                        Rp{" "}
                        {formatNumberIndo(
                          currentPeriodData?.performanceDigital?.revenue ?? 0,
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Kartu profitabilitas */}
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
                        className={`text-base font-bold ${(currentPeriodData?.financials?.pnl ?? 0) >= 0 ? "text-green-600" : "text-destructive"}`}
                      >
                        Rp{" "}
                        {formatNumberIndo(
                          currentPeriodData?.financials?.pnl ?? 0,
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between items-center border-t border-border pt-2">
                      <span className="text-xs text-muted-foreground">
                        Status / Evaluasi:
                      </span>
                      <span
                        className={`text-sm font-bold ${(currentPeriodData?.financials?.pnl ?? 0) >= 0 ? "text-green-600" : "text-destructive"}`}
                      >
                        {currentPeriodData?.status ?? "Normal"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Grid 2 grafik */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-card border border-border rounded-2xl shadow-sm p-2 flex flex-col">
                  {/* Cek data tv chart ada baru render */}
                  {tvChartData && (
                    <BaseChart
                      type="bar"
                      title="Performa TV (Target vs Aktual)"
                      data={tvChartData}
                      height={320}
                    />
                  )}
                </div>

                <div className="bg-card border border-border rounded-2xl shadow-sm p-2 flex flex-col">
                  {/* Cek data finance chart ada baru render */}
                  {financeDoughnutChartData && (
                    <BaseChart
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
                      Total Views Konten:
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
            <div className="bg-card border border-border rounded-2xl shadow-sm p-5 flex flex-col gap-4 mt-2">
              {/* Header kontrol tren */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between border-b border-border pb-4 gap-4">
                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Activity size={16} className="text-primary" /> Multi-Axis
                  Trend Historis
                </h3>

                <div className="flex flex-wrap items-center gap-3">
                  {/* Select filter tren */}
                  <select
                    value={trendFilter}
                    onChange={(e) => setTrendFilter(e.target.value)}
                    className="bg-muted border border-border rounded-xl px-4 py-1.5 text-xs outline-none focus:ring-1 focus:ring-primary cursor-pointer shadow-sm"
                  >
                    <option value="all">All Time</option>
                    <option value="ytd">YTD</option>
                    <option value="mtd">MTD</option>
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
                <div className="lg:col-span-12 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  {/* Mapping data statistik tren */}
                  {[
                    {
                      id: "pnl",
                      label: "Net PNL",
                      stat: trendStats.pnl,
                      prefix: "Rp",
                    },
                    {
                      id: "rev",
                      label: "Rev Aktual",
                      stat: trendStats.rev,
                      prefix: "Rp",
                    },
                    {
                      id: "cost",
                      label: "Cost Direct",
                      stat: trendStats.cost,
                      prefix: "Rp",
                    },
                    {
                      id: "views",
                      label: "Views",
                      stat: trendStats.views,
                      prefix: "",
                    },
                    {
                      id: "tvr",
                      label: "TVR",
                      stat: trendStats.tvr,
                      prefix: "",
                    },
                    {
                      id: "share",
                      label: "Share",
                      stat: trendStats.share,
                      prefix: "",
                    },
                  ].map((item) => (
                    // Kartu statistik tren per item
                    <div
                      key={item.id}
                      className="flex flex-col p-3 bg-muted/20 rounded-xl border border-border/50"
                    >
                      <span className="text-[11px] font-medium text-muted-foreground">
                        {item.label}
                      </span>
                      <span className="text-sm font-bold text-foreground">
                        {item.prefix && `${item.prefix} `}
                        {formatBigNumber(item.stat.val)}
                      </span>
                      {/* Badge persentase */}
                      <div
                        className={`flex items-center gap-1 font-bold text-[10px] mt-1 ${item.stat.up ? "text-green-600" : "text-destructive"}`}
                      >
                        {item.stat.up ? (
                          <ArrowUpRight size={12} />
                        ) : (
                          <ArrowDownRight size={12} />
                        )}
                        {item.stat.pct.toFixed(1)}%
                      </div>
                    </div>
                  ))}
                </div>

                {/* Grafik line tren */}
                <div className="lg:col-span-12 h-[400px] bg-muted/10 rounded-xl border border-border/50 p-2">
                  {/* Render chart line kalo ada data */}
                  {trendLineChartData && (
                    <BaseChart
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
        </div>
      </div>
    </div>,
    // Target render portal
    document.body,
  );
}
