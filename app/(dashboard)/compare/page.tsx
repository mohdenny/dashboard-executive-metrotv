"use client";

import React, { useMemo } from "react";
import {
  GitCompare,
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
  RefreshCcw,
} from "lucide-react";
import BaseChart from "@/components/shared/BaseChart";
import { useCompare } from "@/hooks/useCompare";
import { formatBigNumber } from "@/lib/formatters";
import { ProgramFormData } from "@/schemas/program";

export default function CompareProgramPage() {
  const {
    programs,
    isLoading,
    progAId,
    setProgAId,
    progBId,
    setProgBId,
    progA,
    progB,
    pA,
    pB,
    roiA,
    roiB,
    selectedPeriodA,
    setSelectedPeriodA,
    selectedPeriodB,
    setSelectedPeriodB,
    periodOptions,
    handleSwap,
    getCardStyle,
    getWinnerTextColor,
    comparisonData,
  } = useCompare();

  const tableRows = useMemo(() => {
    if (!progA || !progB) return [];

    const capaianShareA = pA?.performanceTV?.actualShare ?? 0;
    const capaianShareB = pB?.performanceTV?.actualShare ?? 0;

    const digitalViewsA = pA?.performanceDigital?.views ?? 0;
    const digitalViewsB = pB?.performanceDigital?.views ?? 0;

    const inventorySpotA = pA?.inventory?.spot ?? 0;
    const inventorySpotB = pB?.inventory?.spot ?? 0;

    const costDirectA = pA?.financials?.costDirect ?? 0;
    const costDirectB = pB?.financials?.costDirect ?? 0;

    const revenueCapaianA = pA?.financials?.revenueActual ?? 0;
    const revenueCapaianB = pB?.financials?.revenueActual ?? 0;

    const pnlA = pA?.financials?.pnl ?? 0;
    const pnlB = pB?.financials?.pnl ?? 0;

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
        valA: `TVR: ${pA?.performanceTV?.actualTVR ?? 0} (Target: ${pA?.performanceTV?.targetTVR ?? 0}) | Share: ${capaianShareA} (Target: ${pA?.performanceTV?.targetShare ?? 0})`,
        valB: `TVR: ${pB?.performanceTV?.actualTVR ?? 0} (Target: ${pB?.performanceTV?.targetTVR ?? 0}) | Share: ${capaianShareB} (Target: ${pB?.performanceTV?.targetShare ?? 0})`,
        analysis: (
          <div className="text-center">
            {capaianShareA > capaianShareB ? (
              <span className="text-[#1f77b4] font-bold">
                {progA.name} penonton TV-nya lebih banyak
              </span>
            ) : capaianShareB > capaianShareA ? (
              <span className="text-[#ff7f0e] font-bold">
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
        valA: `${formatBigNumber(digitalViewsA)} Views | Rp ${formatBigNumber(pA?.performanceDigital?.revenue ?? 0)}`,
        valB: `${formatBigNumber(digitalViewsB)} Views | Rp ${formatBigNumber(pB?.performanceDigital?.revenue ?? 0)}`,
        analysis: (
          <div className="text-center">
            {digitalViewsA > digitalViewsB ? (
              <span className="text-[#1f77b4] font-bold">
                {progA.name} penonton sosmed-nya lebih rame
              </span>
            ) : digitalViewsB > digitalViewsA ? (
              <span className="text-[#ff7f0e] font-bold">
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
        valA: `${inventorySpotA} Slot @ Rp ${formatBigNumber(pA?.inventory?.adRate ?? 0)}`,
        valB: `${inventorySpotB} Slot @ Rp ${formatBigNumber(pB?.inventory?.adRate ?? 0)}`,
        analysis: (
          <div className="text-center">
            {inventorySpotA > inventorySpotB ? (
              <span className="text-[#1f77b4] font-bold">
                {progA.name} slot iklannya lebih banyak
              </span>
            ) : inventorySpotB > inventorySpotA ? (
              <span className="text-[#ff7f0e] font-bold">
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
        valA: `Rp ${formatBigNumber(costDirectA)}`,
        valB: `Rp ${formatBigNumber(costDirectB)}`,
        analysis: (
          <div className="text-center">
            {costDirectA < costDirectB ? (
              <span className="text-[#1f77b4] font-bold">
                {progA.name} modalnya lebih murah
              </span>
            ) : costDirectB < costDirectA ? (
              <span className="text-[#ff7f0e] font-bold">
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
        valA: `Rp ${formatBigNumber(revenueCapaianA)}`,
        valB: `Rp ${formatBigNumber(revenueCapaianB)}`,
        analysis: (
          <div className="text-center">
            {revenueCapaianA > revenueCapaianB ? (
              <span className="text-[#1f77b4] font-bold">
                {progA.name} dapet duit lebih gede
              </span>
            ) : revenueCapaianB > revenueCapaianA ? (
              <span className="text-[#ff7f0e] font-bold">
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
        valA: <span className="font-bold">{roiA.toFixed(1)}%</span>,
        valB: <span className="font-bold">{roiB.toFixed(1)}%</span>,
        analysis: (
          <div className="text-center">
            {roiA > roiB ? (
              <span className="text-[#1f77b4] font-bold">
                {progA.name} persentase untungnya lebih gede
              </span>
            ) : roiB > roiA ? (
              <span className="text-[#ff7f0e] font-bold">
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
            className={`text-lg font-bold ${pnlA >= 0 ? "text-green-600" : "text-destructive"}`}
          >
            Rp {formatBigNumber(pnlA)}
          </span>
        ),
        valB: (
          <span
            className={`text-lg font-bold ${pnlB >= 0 ? "text-green-600" : "text-destructive"}`}
          >
            Rp {formatBigNumber(pnlB)}
          </span>
        ),
        analysis: (
          <div className="text-center text-lg font-bold">
            {pnlA > pnlB ? (
              <span className="text-[#1f77b4]">
                {pnlA < 0
                  ? `${progA.name} ruginya lebih dikit`
                  : `${progA.name} Paling Cuan!`}
              </span>
            ) : pnlB > pnlA ? (
              <span className="text-[#ff7f0e]">
                {pnlB < 0
                  ? `${progB.name} ruginya lebih dikit`
                  : `${progB.name} Paling Cuan!`}
              </span>
            ) : pnlA < 0 ? (
              "Sama-sama rugi"
            ) : (
              "Cuannya Seri"
            )}
          </div>
        ),
        isHighlight: true,
      },
    ];
  }, [progA, progB, pA, pB, roiA, roiB]);

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center h-[60vh]">
        <RefreshCcw className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="p-4 md:px-8 md:py-6 space-y-6 max-w-[1800px] mx-auto animate-in fade-in duration-300">
      <div className="bg-card p-6 rounded-2xl shadow-sm flex flex-col md:flex-row items-end gap-6 justify-between">
        <div className="w-full flex-1 flex flex-col gap-2">
          <label className="text-sm font-medium text-muted-foreground block">
            Pilih Program A
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative inline-block w-full">
              <select
                value={progAId}
                onChange={(e) => setProgAId(e.target.value)}
                className="appearance-none bg-card text-foreground text-sm font-medium rounded-full focus:ring-2 focus:ring-primary truncate focus:outline-none block pl-4 pr-10 py-0 h-10 cursor-pointer border border-border w-full"
              >
                <option value="">-- Program Pertama --</option>
                {programs.map((p: ProgramFormData) => (
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

            <div className="relative inline-block w-full sm:w-1/2">
              <select
                value={selectedPeriodA}
                onChange={(e) => setSelectedPeriodA(e.target.value)}
                className="appearance-none bg-card text-foreground text-sm font-medium rounded-full focus:ring-2 focus:ring-primary truncate focus:outline-none block pl-4 pr-10 py-0 h-10 cursor-pointer border border-border w-full"
              >
                <option value="">Periode Terbaru</option>
                {periodOptions.map((opt) => (
                  <option key={`A-per-${opt}`} value={opt}>
                    {opt}
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

        <button
          onClick={handleSwap}
          title="Tukar Posisi"
          className="h-10 w-10 shrink-0 bg-muted hover:bg-primary/20 hover:text-primary transition-colors rounded-full text-muted-foreground cursor-pointer shadow-sm active:scale-95 flex items-center justify-center mb-0 md:mb-0"
        >
          <ArrowRightLeft size={18} />
        </button>

        <div className="w-full flex-1 flex flex-col gap-2">
          <label className="text-sm font-medium text-muted-foreground block">
            Pilih Program B
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative inline-block w-full">
              <select
                value={progBId}
                onChange={(e) => setProgBId(e.target.value)}
                className="appearance-none bg-card text-foreground text-sm font-medium rounded-full focus:ring-2 focus:ring-primary truncate focus:outline-none block pl-4 pr-10 py-0 h-10 cursor-pointer border border-border w-full"
              >
                <option value="">-- Program Kedua --</option>
                {programs.map((p: ProgramFormData) => (
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

            <div className="relative inline-block w-full sm:w-1/2">
              <select
                value={selectedPeriodB}
                onChange={(e) => setSelectedPeriodB(e.target.value)}
                className="appearance-none bg-card text-foreground text-sm font-medium rounded-full focus:ring-2 focus:ring-primary truncate focus:outline-none block pl-4 pr-10 py-0 h-10 cursor-pointer border border-border w-full"
              >
                <option value="">Periode Terbaru</option>
                {periodOptions.map((opt) => (
                  <option key={`B-per-${opt}`} value={opt}>
                    {opt}
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
      </div>

      <div className="w-full text-center">
        <span className="text-sm text-muted-foreground font-medium bg-muted/30 px-4 py-1.5 rounded-full border border-border">
          Komparasi Periode:{" "}
          <span className="font-bold text-foreground">
            {pA?.month || selectedPeriodA || "Terbaru"}
          </span>{" "}
          vs{" "}
          <span className="font-bold text-foreground">
            {pB?.month || selectedPeriodB || "Terbaru"}
          </span>
        </span>
      </div>

      {!progA || !progB ? (
        <div className="text-center py-20 text-sm font-medium text-muted-foreground bg-card rounded-2xl border border-dashed border-border">
          Silakan pilih kedua program di atas untuk melihat komparasi.
        </div>
      ) : (
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-9 bg-card shadow-sm rounded-2xl flex flex-col p-2 min-h-[400px]">
            <BaseChart
              type="bar"
              title={`Komparasi Finansial: ${progA.name} vs ${progB.name}`}
              data={comparisonData}
              height={300}
            />
          </div>

          <div className="lg:col-span-3 bg-card shadow-sm rounded-2xl flex flex-col p-4 gap-4">
            <div
              className={`flex-1 p-5 rounded-2xl border-2 flex flex-col justify-center transition-colors duration-300 ${getCardStyle(pA?.financials?.pnl ?? 0, pB?.financials?.pnl ?? 0)}`}
            >
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Wallet size={14} /> Pemenang Net PNL
              </span>
              <span
                className={`text-2xl font-bold ${getWinnerTextColor(pA?.financials?.pnl ?? 0, pB?.financials?.pnl ?? 0)}`}
              >
                {(pA?.financials?.pnl ?? 0) > (pB?.financials?.pnl ?? 0)
                  ? progA.name
                  : (pB?.financials?.pnl ?? 0) > (pA?.financials?.pnl ?? 0)
                    ? progB.name
                    : "Seimbang"}
              </span>
              <span className="text-sm font-medium mt-1">
                Selisih: Rp{" "}
                {formatBigNumber(
                  Math.abs(
                    (pA?.financials?.pnl ?? 0) - (pB?.financials?.pnl ?? 0),
                  ),
                )}
              </span>
            </div>

            <div
              className={`flex-1 p-5 rounded-2xl border-2 flex flex-col justify-center transition-colors duration-300 ${getCardStyle(pA?.performanceTV?.actualShare ?? 0, pB?.performanceTV?.actualShare ?? 0)}`}
            >
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <TrendingUp size={14} /> Pemenang Share TV
              </span>
              <span
                className={`text-2xl font-bold ${getWinnerTextColor(pA?.performanceTV?.actualShare ?? 0, pB?.performanceTV?.actualShare ?? 0)}`}
              >
                {(pA?.performanceTV?.actualShare ?? 0) >
                (pB?.performanceTV?.actualShare ?? 0)
                  ? progA.name
                  : (pB?.performanceTV?.actualShare ?? 0) >
                      (pA?.performanceTV?.actualShare ?? 0)
                    ? progB.name
                    : "Seimbang"}
              </span>
              <span className="text-sm font-medium mt-1">
                Share Maks:{" "}
                {Math.max(
                  pA?.performanceTV?.actualShare ?? 0,
                  pB?.performanceTV?.actualShare ?? 0,
                )}
              </span>
            </div>

            <div
              className={`flex-1 p-5 rounded-2xl border-2 flex flex-col justify-center transition-colors duration-300 ${getCardStyle(pA?.performanceDigital?.views ?? 0, pB?.performanceDigital?.views ?? 0)}`}
            >
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <MonitorPlay size={14} /> Pemenang Digital
              </span>
              <span
                className={`text-2xl font-bold ${getWinnerTextColor(pA?.performanceDigital?.views ?? 0, pB?.performanceDigital?.views ?? 0)}`}
              >
                {(pA?.performanceDigital?.views ?? 0) >
                (pB?.performanceDigital?.views ?? 0)
                  ? progA.name
                  : (pB?.performanceDigital?.views ?? 0) >
                      (pA?.performanceDigital?.views ?? 0)
                    ? progB.name
                    : "Seimbang"}
              </span>
              <span className="text-sm font-medium mt-1">
                Views Maks:{" "}
                {formatBigNumber(
                  Math.max(
                    pA?.performanceDigital?.views ?? 0,
                    pB?.performanceDigital?.views ?? 0,
                  ),
                )}
              </span>
            </div>
          </div>

          <div className="lg:col-span-12 bg-card shadow-sm rounded-2xl border border-border overflow-hidden mt-2">
            <div className="p-4 border-b border-border bg-muted/20">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <Award size={18} /> Detail Komparasi Metrik Parameter
              </h3>
            </div>

            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-muted/50 border-b border-border text-muted-foreground">
                  <tr>
                    <th className="px-6 py-4 font-bold uppercase tracking-wider text-[11px]">
                      Parameter Spesifik
                    </th>
                    <th className="px-6 py-4 font-bold uppercase tracking-wider text-[11px] text-[#1f77b4]">
                      {progA.name}
                    </th>
                    <th className="px-6 py-4 font-bold uppercase tracking-wider text-[11px] text-[#ff7f0e]">
                      {progB.name}
                    </th>
                    <th className="px-6 py-4 font-bold uppercase tracking-wider text-[11px] text-center">
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
