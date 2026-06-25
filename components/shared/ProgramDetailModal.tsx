"use client";

import React, {
  useEffect,
  useState,
  useMemo,
  useSyncExternalStore,
} from "react";
import { createPortal } from "react-dom";
import {
  X,
  Tv,
  DollarSign,
  TrendingUp,
  MonitorPlay,
  Wallet,
  Layers,
  Clock,
  Tag,
  FileText,
  Activity,
  CalendarRange,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import BaseChart from "@/components/shared/BaseChart";
import { formatBigNumber, formatNumberIndo } from "@/lib/formatters";
import { ChartData, ChartOptions } from "chart.js";
import { ProgramFormData } from "@/schemas/program";

interface ProgramDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  program: ProgramFormData | null;
}

const emptySubscribe = () => () => {};

export default function ProgramDetailModal({
  isOpen,
  onClose,
  program,
}: ProgramDetailModalProps) {
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  const [trendStartMonth, setTrendStartMonth] = useState<string>("");
  const [trendEndMonth, setTrendEndMonth] = useState<string>("");
  const [trendFilter, setTrendFilter] = useState<string>("all");

  // State nyimpen pilihan bulan spesifik dari user buat nampilin data card & bar chart
  const [selectedMonth, setSelectedMonth] = useState<string>("");

  const sortedPeriods = useMemo(() => {
    if (!program?.periods) return [];
    // Sort ascending buat chart trend historis
    return [...program.periods].sort((a, b) => a.month.localeCompare(b.month));
  }, [program]);

  // Otomatis set bulan ke periode terbaru pas modal baru dibuka
  useEffect(() => {
    if (sortedPeriods.length > 0) {
      setSelectedMonth(sortedPeriods[sortedPeriods.length - 1].month);
    }
  }, [sortedPeriods, isOpen]);

  const currentPeriodData = useMemo(() => {
    if (!program?.periods) return null;
    return (
      program.periods.find((p) => p.month === selectedMonth) ||
      sortedPeriods[sortedPeriods.length - 1]
    );
  }, [program, selectedMonth, sortedPeriods]);

  const periodDisplay = useMemo(() => {
    if (sortedPeriods.length === 0) return "-";
    if (sortedPeriods.length === 1) return sortedPeriods[0].month;
    return `${sortedPeriods[0].month} s/d ${sortedPeriods[sortedPeriods.length - 1].month}`;
  }, [sortedPeriods]);

  const filteredTrendPeriods = useMemo(() => {
    let result = sortedPeriods;
    if (trendFilter === "ytd") {
      const currentYear = new Date().getFullYear().toString();
      result = result.filter((p) => p.month.startsWith(currentYear));
    } else if (trendFilter === "mtd") {
      const currentMonth = new Date().toISOString().slice(0, 7);
      result = result.filter((p) => p.month === currentMonth);
    } else if (trendFilter === "custom") {
      if (trendStartMonth) {
        result = result.filter((p) => p.month >= trendStartMonth);
      }
      if (trendEndMonth) {
        result = result.filter((p) => p.month <= trendEndMonth);
      }
    }
    return result;
  }, [sortedPeriods, trendStartMonth, trendEndMonth, trendFilter]);

  // Helper kalkulasi tren buat mini cards
  const calculateTrend = (metricKey: string) => {
    if (filteredTrendPeriods.length === 0) return { val: 0, pct: 0, up: true };

    if (filteredTrendPeriods.length === 1) {
      const p = filteredTrendPeriods[0];
      return { val: getMetricValue(p, metricKey), pct: 0, up: true };
    }

    const last = getMetricValue(
      filteredTrendPeriods[filteredTrendPeriods.length - 1],
      metricKey,
    );

    const prev = getMetricValue(
      filteredTrendPeriods[filteredTrendPeriods.length - 2],
      metricKey,
    );

    const diff = last - prev;
    const pct = prev === 0 ? 100 : (diff / prev) * 100;

    return { val: last, pct: Math.abs(pct), up: diff >= 0 };
  };

  const getMetricValue = (p: ProgramFormData["periods"][0], metric: string) => {
    if (!p) return 0;
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

  // Setup multiple datasets buat satu grafik
  const trendLineChartData = useMemo<ChartData<"line"> | null>(() => {
    if (filteredTrendPeriods.length === 0) return null;
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
          hidden: true, // Default hide biar ga rame
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
          borderColor: "#8b5cf6", // Aksen ungu
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
          yAxisID: "y1", // Skala beda (kanan)
          tension: 0.4,
          hidden: false,
        },
        {
          label: "Share",
          data: filteredTrendPeriods.map((p) => p.performanceTV.actualShare),
          borderColor: "#06b6d4",
          backgroundColor: "#06b6d4",
          yAxisID: "y1", // Skala beda (kanan)
          tension: 0.4,
          hidden: false,
        },
      ],
    };
  }, [filteredTrendPeriods]);

  // Setup options line chart biar multi-axis jalannya mulus
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
          label: function (context) {
            let label = context.dataset.label || "";
            let val = context.parsed.y;
            if (label === "TVR" || label === "Share") {
              return `${label}: ${val}`;
            }
            return `${label}: Rp ${formatNumberIndo(val ?? 0)}`;
          },
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
          callback: (val) => formatBigNumber(Number(val)),
        },
      },
      y1: {
        type: "linear",
        display: true,
        position: "right",
        title: { display: true, text: "TVR / Share" },
        grid: { drawOnChartArea: false },
      },
    },
  };

  const tvChartData = useMemo<ChartData<"bar"> | null>(() => {
    if (!currentPeriodData) return null;
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

  const financeChartData = useMemo<ChartData<"bar"> | null>(() => {
    if (!currentPeriodData) return null;
    const pnl = currentPeriodData.financials?.pnl ?? 0;
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
          label: "Nominal (Rp)",
          data: [
            currentPeriodData.financials?.revenueTarget ?? 0,
            currentPeriodData.financials?.revenueActual ?? 0,
            currentPeriodData.financials?.costDirect ?? 0,
            currentPeriodData.performanceDigital?.revenue ?? 0,
            pnl,
          ],
          backgroundColor: [
            "#4bc0c0",
            "#1f77b4",
            "#ff7f0e",
            "#8b5cf6",
            pnl >= 0 ? "#16a34a" : "#d62728",
          ],
          minBarLength: 15,
        },
      ],
    };
  }, [currentPeriodData]);

  if (!isOpen || !program || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-2 sm:p-6">
      <div className="bg-background w-full max-w-6xl max-h-[95vh] rounded-[28px] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-border">
        {/* Kepala Modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 bg-card shrink-0">
          <div>
            <h2 className="text-xl font-bold text-foreground">
              {program.name}
            </h2>
            <div className="flex flex-wrap gap-2 mt-1">
              <span className="text-xs font-medium px-2 py-0.5 bg-primary/10 text-primary rounded-md flex items-center gap-1">
                <Clock size={12} /> Data Ditampilkan:{" "}
                {selectedMonth || periodDisplay}
              </span>
              <span className="text-xs font-medium px-2 py-0.5 bg-muted text-muted-foreground rounded-md flex items-center gap-1">
                <Tag size={12} /> Kategori {program.category}
              </span>
              <span className="text-xs font-medium px-2 py-0.5 bg-muted text-muted-foreground rounded-md flex items-center gap-1">
                <FileText size={12} /> {program.descriptionCategory}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-destructive/10 hover:text-destructive rounded-full cursor-pointer transition-colors focus:outline-none"
          >
            <X size={24} />
          </button>
        </div>

        {/* Badan Konten Rincian Data Lengkap */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
          {/* Dropdown Filter Periode */}
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
                .sort((a, b) => b.month.localeCompare(a.month)) // Tampil descending biar yang terbaru di atas
                .map((p) => (
                  <option key={p.id} value={p.month}>
                    {p.month} {p.status ? `(${p.status})` : ""}
                  </option>
                ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Blok Rating & Share TV */}
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

            {/* Blok Revenue Finansial */}
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

            {/* Blok Efisiensi & Hasil Akhir */}
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
                    {formatNumberIndo(currentPeriodData?.financials?.pnl ?? 0)}
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-card border border-border rounded-2xl shadow-sm p-2 flex flex-col">
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
              {financeChartData && (
                <BaseChart
                  type="bar"
                  title="Struktur Anggaran & Realisasi"
                  data={financeChartData}
                  height={320}
                  options={{
                    plugins: {
                      legend: { display: false },
                    },
                  }}
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Nilai Digital Media */}
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

            {/* Nilai Komersial Spot Iklan */}
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

            {/* Nilai Harga Pasar Rate Iklan */}
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
                  {formatNumberIndo(currentPeriodData?.inventory?.adRate ?? 0)}
                </div>
              </div>
            </div>
          </div>

          {/* Sektor Analisis Tren Historis */}
          {/* <div className="bg-card border border-border rounded-2xl shadow-sm p-5 flex flex-col gap-4 mt-2">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between border-b border-border pb-4 gap-4">
              <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Activity size={16} className="text-primary" /> Multi-Axis Trend
                Historis
              </h3>

              <div className="flex flex-wrap items-center gap-3">
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

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-3 grid grid-cols-2 lg:grid-cols-1 gap-3">
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
                  { id: "tvr", label: "TVR", stat: trendStats.tvr, prefix: "" },
                  {
                    id: "share",
                    label: "Share",
                    stat: trendStats.share,
                    prefix: "",
                  },
                ].map((item) => (
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

              <div className="lg:col-span-9 h-[360px] flex items-center justify-center bg-muted/10 rounded-xl border border-border/50 p-2">
                {trendLineChartData && (
                  <BaseChart
                    type="line"
                    title="Komparasi Matrik (Gunakan Legend untuk Tampil/Sembunyi)"
                    data={trendLineChartData}
                    height={360}
                    options={trendLineChartOptions}
                  />
                )}
              </div>
            </div>
          </div> */}
        </div>
      </div>
    </div>,
    document.body,
  );
}
