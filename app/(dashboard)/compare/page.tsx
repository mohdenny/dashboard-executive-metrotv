"use client";

import React, { useMemo } from "react";
import {
  GitCompare,
  RefreshCcw,
  ArrowRightLeft,
  TrendingUp,
  Wallet,
  DollarSign,
  Percent,
  Clock,
  Tags,
  Award,
  Tv,
  MonitorPlay,
} from "lucide-react";
import BaseChart from "@/components/shared/BaseChart";
import { useCompare } from "@/hooks/useCompare";
import { formatBigNumber } from "@/lib/formatters";

export default function CompareProgramPage() {
  // Tarik state sama helper dari hook
  const {
    programs,
    isLoading,
    progAId,
    setProgAId,
    progBId,
    setProgBId,
    progA,
    progB,
    roiA,
    roiB,
    handleSwap,
    getCardStyle,
    getWinnerTextColor,
    comparisonData,
  } = useCompare();

  // Setup config mapping buat tabel
  const tableRows = useMemo(() => {
    if (!progA || !progB) return [];

    return [
      {
        id: "kategori",
        icon: Tags,
        label: "Kategori & Jam",
        valA: `Kategori ${progA.category} (${progA.broadcastTime})`,
        valB: `Kategori ${progB.category} (${progB.broadcastTime})`,
        analysis: (
          <span className="text-muted-foreground text-center block">-</span>
        ),
        isHighlight: false,
      },
      {
        id: "performa_tv",
        icon: Tv,
        label: "Performa TV (TVR / Share)",
        valA: `TVR: ${progA.capaianTVR} (Target: ${progA.targetTVR}) | Share: ${progA.capaianShare} (Target: ${progA.targetShare})`,
        valB: `TVR: ${progB.capaianTVR} (Target: ${progB.targetTVR}) | Share: ${progB.capaianShare} (Target: ${progB.targetShare})`,
        analysis: (
          <div className="text-justify">
            {progA.capaianShare > progB.capaianShare ? (
              <span className="text-[#1f77b4] font-medium">
                {progA.name} penonton TV-nya lebih banyak
              </span>
            ) : progB.capaianShare > progA.capaianShare ? (
              <span className="text-[#ff7f0e] font-medium">
                {progB.name} penonton TV-nya lebih banyak
              </span>
            ) : (
              "Penonton TV sama banyak"
            )}
          </div>
        ),
        isHighlight: false,
      },
      {
        id: "performa_digital",
        icon: MonitorPlay,
        label: "Performa Digital",
        valA: `${formatBigNumber(progA.digitalViews || 0)} Views | Rp ${formatBigNumber(progA.digitalRevenue || 0)}`,
        valB: `${formatBigNumber(progB.digitalViews || 0)} Views | Rp ${formatBigNumber(progB.digitalRevenue || 0)}`,
        analysis: (
          <div className="text-justify">
            {(progA.digitalViews || 0) > (progB.digitalViews || 0) ? (
              <span className="text-[#1f77b4] font-medium">
                {progA.name} penonton sosmed-nya lebih rame
              </span>
            ) : (progB.digitalViews || 0) > (progA.digitalViews || 0) ? (
              <span className="text-[#ff7f0e] font-medium">
                {progB.name} penonton sosmed-nya lebih rame
              </span>
            ) : (
              "Penonton sosmed sama rame"
            )}
          </div>
        ),
        isHighlight: false,
      },
      {
        id: "inventory",
        icon: Clock,
        label: "Inventory Spot",
        valA: `${progA.inventorySpot} Slot @ Rp ${formatBigNumber(progA.rateIklan)}`,
        valB: `${progB.inventorySpot} Slot @ Rp ${formatBigNumber(progB.rateIklan)}`,
        analysis: (
          <div className="text-justify">
            {progA.inventorySpot > progB.inventorySpot ? (
              <span className="text-[#1f77b4] font-medium">
                {progA.name} slot iklannya lebih banyak
              </span>
            ) : progB.inventorySpot > progA.inventorySpot ? (
              <span className="text-[#ff7f0e] font-medium">
                {progB.name} slot iklannya lebih banyak
              </span>
            ) : (
              "Slot iklan sama banyak"
            )}
          </div>
        ),
        isHighlight: false,
      },
      {
        id: "cost",
        icon: Wallet,
        label: "Cost Direct (Modal)",
        valA: `Rp ${formatBigNumber(progA.costDirect)}`,
        valB: `Rp ${formatBigNumber(progB.costDirect)}`,
        // Cost makin kecil makin bagus
        analysis: (
          <div className="text-justify">
            {progA.costDirect < progB.costDirect ? (
              <span className="text-[#1f77b4] font-medium">
                {progA.name} modalnya lebih murah
              </span>
            ) : progB.costDirect < progA.costDirect ? (
              <span className="text-[#ff7f0e] font-medium">
                {progB.name} modalnya lebih murah
              </span>
            ) : (
              "Modalnya sama aja"
            )}
          </div>
        ),
        isHighlight: false,
      },
      {
        id: "revenue",
        icon: DollarSign,
        label: "Revenue Aktual",
        valA: `Rp ${formatBigNumber(progA.revenueCapaian)}`,
        valB: `Rp ${formatBigNumber(progB.revenueCapaian)}`,
        analysis: (
          <div className="text-justify">
            {progA.revenueCapaian > progB.revenueCapaian ? (
              <span className="text-[#1f77b4] font-medium">
                {progA.name} dapet duit lebih gede
              </span>
            ) : progB.revenueCapaian > progA.revenueCapaian ? (
              <span className="text-[#ff7f0e] font-medium">
                {progB.name} dapet duit lebih gede
              </span>
            ) : (
              "Pemasukannya sama"
            )}
          </div>
        ),
        isHighlight: false,
      },
      {
        id: "roi",
        icon: Percent,
        label: "ROI (Efisiensi Modal)",
        valA: <span className="font-medium">{roiA.toFixed(1)}%</span>,
        valB: <span className="font-medium">{roiB.toFixed(1)}%</span>,
        analysis: (
          <div className="text-justify">
            {roiA > roiB ? (
              <span className="text-[#1f77b4] font-medium">
                {progA.name} persentase untungnya lebih gede
              </span>
            ) : roiB > roiA ? (
              <span className="text-[#ff7f0e] font-medium">
                {progB.name} persentase untungnya lebih gede
              </span>
            ) : (
              "Untungnya seimbang"
            )}
          </div>
        ),
        isHighlight: false,
      },
      {
        id: "pnl",
        icon: GitCompare,
        label: "Net Profit Margin",
        valA: (
          <span
            className={`text-lg font-medium ${progA.pnl >= 0 ? "text-green-600" : "text-destructive"}`}
          >
            Rp {formatBigNumber(progA.pnl)}
          </span>
        ),
        valB: (
          <span
            className={`text-lg font-medium ${progB.pnl >= 0 ? "text-green-600" : "text-destructive"}`}
          >
            Rp {formatBigNumber(progB.pnl)}
          </span>
        ),
        analysis: (
          <div className="text-justify text-lg font-medium">
            {progA.pnl > progB.pnl ? (
              <span className="text-[#1f77b4]">
                {progA.pnl < 0
                  ? `${progA.name} ruginya lebih dikit`
                  : `${progA.name} Paling Cuan!`}
              </span>
            ) : progB.pnl > progA.pnl ? (
              <span className="text-[#ff7f0e]">
                {progB.pnl < 0
                  ? `${progB.name} ruginya lebih dikit`
                  : `${progB.name} Paling Cuan!`}
              </span>
            ) : progA.pnl < 0 ? (
              "Sama-sama rugi"
            ) : (
              "Cuannya Seri"
            )}
          </div>
        ),
        // Highlight row ini
        isHighlight: true,
      },
    ];
  }, [progA, progB, roiA, roiB]);

  // Loading state
  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center h-[60vh]">
        <RefreshCcw className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    // Bungkus
    <div className="p-4 pb-8 pt-4 md:pt-8 md:px-8 space-y-6 max-w-[1800px] mx-auto animate-in fade-in duration-300">
      {/* Title page */}
      {/* <div className="flex items-center gap-4 border-b border-border/50 pb-6 border-2 border-slate-300">
        <div className="p-3 bg-secondary text-secondary-foreground rounded-2xl">
          <GitCompare size={28} />
        </div>
        <div>
          <h1 className="text-2xl font-normal tracking-tight text-foreground">
            Head-to-Head Comparison
          </h1>
          <p className="text-sm text-muted-foreground font-medium">
            Komparasi finansial dan performa dua program secara langsung.
          </p>
        </div>
      </div> */}

      {/* Filter Selector */}
      <div className="bg-card p-6 rounded-2xl shadow-sm flex flex-col md: flex-row md:flex-row items-end gap-3 md:gap-6 justify-between">
        {/* Dropdown 1 */}
        <div className="w-full flex-1">
          <label className="text-sm font-medium text-muted-foreground mb-1.5 block">
            Pilih Program
          </label>
          <div className="relative inline-block w-full">  
            <select
              value={progAId}
              onChange={(e) => setProgAId(e.target.value)}
              className="appearance-none bg-card text-foreground text-sm font-medium rounded-2xl md:rounded-full focus:ring-2 focus:ring-primary truncate focus:outline-none block pl-4 pr-10 py-0 h-10 cursor-pointer border border-border w-full"
            >
              <option value="">-- Pilih Program Pertama --</option>
              {programs.map((p) => (
                <option key={`A-${p.id}`} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-foreground/70">
              <svg
                xmlns="http://w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Tombol Swap */}
        <button
          onClick={handleSwap}
          title="Tukar Posisi"
          className="h-10 w-10 shrink-0 bg-muted hover:bg-primary/20 hover:text-primary transition-colors rounded-full text-muted-foreground cursor-pointer shadow-sm active:scale-95 flex items-center justify-center mb-0 md:mb-0"
        >
          <ArrowRightLeft size={18} />
        </button>

        {/* Dropdown 2 */}
        <div className="w-full flex-1">
          <label className="text-sm font-medium text-muted-foreground mb-1.5 block">
            Pilih Program
          </label>
          <div className="relative inline-block w-full">
            <select
              value={progBId}
              onChange={(e) => setProgBId(e.target.value)}
              className="appearance-none bg-card text-foreground text-sm font-medium rounded-2xl md:rounded-full focus:ring-2 focus:ring-primary truncate focus:outline-none block pl-4 pr-10 py-0 h-10 cursor-pointer border border-border w-full"
            >
              <option value="">-- Pilih Program Kedua --</option>
              {programs.map((p) => (
                <option key={`B-${p.id}`} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-foreground/70">
              <svg
                xmlns="http://w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* State kosong (belum milih 2 program) */}
      {!progA || !progB ? (
        <div className="text-center py-24 md:py-20 text-base md:text-xs font-medium text-muted-foreground bg-card rounded-2xl p-3 border border-dashed border-border">
          Silakan pilih kedua program di atas untuk melihat komparasi.
        </div>
      ) : (
        // Main content
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Chart bar komparasi */}
          <div className="lg:col-span-9 bg-card shadow-sm rounded-2xl flex flex-col p-2 min-h-[400px]">
            <BaseChart
              type="bar"
              title={`Komparasi Finansial: ${progA.name} vs ${progB.name}`}
              data={comparisonData}
              height={300}
            />
          </div>

          {/* Area KPI */}
          <div className="lg:col-span-3 bg-card shadow-sm rounded-2xl flex flex-col p-4 gap-4">
            {/* KPI 1, Winner PNL */}
            <div
              className={`flex-1 p-5 rounded-2xl border-2 flex flex-col justify-center transition-colors duration-300 ${getCardStyle(progA.pnl, progB.pnl)}`}
            >
              {/* <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Wallet size={14} /> Pemenang Net PNL
              </span> */}

              <span className="text-sm md:text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Wallet className="md:size-[14] size-[20]" /> Pemenang Net PNL
              </span>

              <span
                className={`text-2xl font-bold ${getWinnerTextColor(progA.pnl, progB.pnl)}`}
              >
                {progA.pnl > progB.pnl
                  ? progA.name
                  : progB.pnl > progA.pnl
                    ? progB.name
                    : "Seimbang"}
              </span>
              <span className="text-sm font-normal mt-1">
                Selisih: Rp {formatBigNumber(Math.abs(progA.pnl - progB.pnl))}
              </span>
            </div>

            {/* KPI 2, Winner Performa */}
            <div
              className={`flex-1 p-5 rounded-2xl border-2 flex flex-col justify-center transition-colors duration-300 ${getCardStyle(progA.capaianShare || 0, progB.capaianShare || 0)}`}
            >
              {/* <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <TrendingUp size={14} /> Pemenang Share TV
              </span> */}

              <span className="text-sm md:text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <TrendingUp className="md:size-[14] size-[20]" /> Pemenang Share TV
              </span>

              <span
                className={`text-2xl font-semibold ${getWinnerTextColor(progA.capaianShare || 0, progB.capaianShare || 0)}`}
              >
                {(progA.capaianShare || 0) > (progB.capaianShare || 0)
                  ? progA.name
                  : (progB.capaianShare || 0) > (progA.capaianShare || 0)
                    ? progB.name
                    : "Seimbang"}
              </span>
              <span className="text-sm font-normal mt-1">
                Share Maks:{" "}
                {Math.max(progA.capaianShare || 0, progB.capaianShare || 0)}
              </span>
            </div>

            {/* KPI 3, Winner Digital */}
            <div
              className={`flex-1 p-5 rounded-2xl border-2 flex flex-col justify-center transition-colors duration-300 ${getCardStyle(progA.digitalViews || 0, progB.digitalViews || 0)}`}
            >
              {/* <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <MonitorPlay size={14} /> Pemenang Digital
              </span>
               */}
              <span className="text-sm md:text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <MonitorPlay className="md:size-[14] size-[20]" /> Pemenang Digital
              </span>
              
              <span
                className={`text-2xl font-semibold ${getWinnerTextColor(progA.digitalViews || 0, progB.digitalViews || 0)}`}
              >
                {(progA.digitalViews || 0) > (progB.digitalViews || 0)
                  ? progA.name
                  : (progB.digitalViews || 0) > (progA.digitalViews || 0)
                    ? progB.name
                    : "Seimbang"}
              </span>
              <span className="text-sm font-normal mt-1">
                Views Maks:{" "}
                {formatBigNumber(
                  Math.max(progA.digitalViews || 0, progB.digitalViews || 0),
                )}
              </span>
            </div>
          </div>

          {/* Detail tabel */}
          <div className="lg:col-span-12 bg-card shadow-sm rounded-2xl border border-border overflow-hidden mt-2">
            <div className="p-4 border-b border-border bg-muted/20">
              <h3 className="text-xl font-medium flex items-center gap-2">
                <Award className="size-[20]" /> Detail Komparasi Metrik Parameter
              </h3>
            </div>

            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-muted/50 border-b border-border text-muted-foreground">
                  <tr>
                    <th className="px-6 py-4 font-medium uppercase tracking-wider text-sm">
                      Parameter Spesifik
                    </th>
                    <th className="px-6 py-4 font-medium uppercase tracking-wider text-sm text-[#82bfe9]">
                      {progA.name}
                    </th>
                    <th className="px-6 py-4 font-medium uppercase tracking-wider text-sm text-[#ffa85b]">
                      {progB.name}
                    </th>
                    <th className="px-6 py-4 font-medium uppercase tracking-wider text-sm text-center">
                      Analisis
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {tableRows.map((row) => (
                    <tr
                      key={row.id}
                      className={`transition-colors ${row.isHighlight ? "bg-muted/30" : "hover:bg-muted/30"}`}
                    >
                      <td className="px-6 py-4 font-medium flex items-center gap-2">
                        <row.icon
                          size={16}
                          className={
                            row.isHighlight
                              ? "text-primary"
                              : "text-muted-foreground"
                          }
                        />
                        {row.label}
                      </td>
                      <td className="px-6 py-4">{row.valA}</td>
                      <td className="px-6 py-4">{row.valB}</td>
                      <td className="px-6 py-4">{row.analysis}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
