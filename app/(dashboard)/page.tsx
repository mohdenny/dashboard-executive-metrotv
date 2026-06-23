"use client";

import React from "react";
import {
  FilterX,
  LayoutDashboard,
  GitCompare,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { useRouter } from "next/navigation";
import useDashboard from "@/hooks/useDashboard";
import { MOCK_PROGRAMS } from "@/constants/programMockData";
import BaseChart from "@/components/shared/BaseChart";
import { ChartEvent, ActiveElement, Chart as ChartJS } from "chart.js";
import { formatBigNumber } from "@/lib/formatters";
import StatCard from "@/components/shared/StatCard";

export default function ExecutiveDashboardPage() {
  const router = useRouter();

  const {
    allProgramData,
    filteredPrograms,
    comboTargetActualData,
    detailProgramData,
    topPnlData,
    bottomPnlData,
    activeProgramId,
    selectedProgramId,
    setSelectedProgramId,
    selectedCategory,
    setSelectedCategory,
    totalKPI,
    topRevenueDigitalData,
    bottomRevenueDigitalData,
    tvPerformanceData,
  } = useDashboard();

  return (
    <div className="p-4 md:px-8 md:py-6 space-y-6 max-w-[1800px] mx-auto animate-in fade-in duration-300">
      {/* Title Page & Control */}
      {/* <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 border-b border-border/50 pb-6 border-2 border-slate-300">
        <div className="flex items-center gap-4 border-2 border-b-blue-700">
          <div className="p-3 bg-secondary text-secondary-foreground rounded-2xl">
            <LayoutDashboard size={28} />
          </div>
          <div>
            <div className="flex items-center gap-3 border-2 border-emerald-600">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                PNL Program
              </h1>
              {selectedCategory && (
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="flex items-center gap-1 text-xs bg-destructive/10"
                >
                  <FilterX size={14} /> Clear Filter
                </button>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-sm text-muted-foreground font-medium hidden sm:block">
                Evaluasi target, capaian revenue, dan profitabilitas
              </p>
            </div>
          </div>
        </div>
      </div> */}

      {/* Card */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {totalKPI.cards.map((card, idx) => (
          <StatCard key={idx} card={card} />
        ))}
      </div>

      {/* Chart */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* All program data chart */}
        <div className="col-span-1 bg-card shadow-sm rounded-2xl flex flex-col p-2 relative">
          {selectedCategory ? (
            <button
              onClick={() => setSelectedCategory(null)}
              className="absolute top-4 right-6 text-[10px] bg-destructive/10 text-destructive px-2 py-1 rounded-full font-bold uppercase tracking-wider z-10 hover:bg-destructive/20 cursor-pointer transition-colors flex items-center gap-1"
            >
              <FilterX size={14} />
              <span>Clear Filter</span>
            </button>
          ) : (
            <span className="absolute top-3 md:top-4 right-6 text-[10px] bg-secondary text-secondary-foreground px-2 py-1 rounded-full font-bold uppercase tracking-wider z-10 transition-colors">
              Click to Filter
            </span>
          )}

          <BaseChart
            // Jenis chartnya "bar"
            type="bar"
            // Judul chartnya
            title="PNL Keseluruhan (Per Kategori)"
            // Sumber data chart
            data={allProgramData}
            // Tinggi canvas chartnya, pake satuan pixel
            height={360}
            options={{
              plugins: {
                // Biar legend ga muncul
                legend: {
                  display: false,
                },
              },
              // Event click pas area chartnya diklik user
              // Kasih parameter elements biar bisa akses properti element si chart
              // Chart biar bisa akses properti chart bar, bukan area kosong
              onClick: (
                event: ChartEvent,
                elements: ActiveElement[],
                chart: ChartJS,
              ) => {
                // Cek kalo user ngelick salah satu chart bar
                if (elements && elements.length > 0) {
                  console.log(elements, "chart diklik");
                  console.log(chart.data, "akses data chart");

                  // Ambil index chart yang lagi diklik
                  const index = elements[0].index;
                  // Ambil label data chart yang lagi diklik berdasarkan index diatas
                  const categoryName = chart.data.labels?.[index] as string;

                  // Biar chart barnya kaya toggle
                  // Kalo kategori awal diklik atau nilai statenya beda, simpen kategori baru ke dalem state buat filter data
                  // Kalo kategorinya udah diklik terus diklik lagi, aapus filter (set null)
                  // Parameter prev itu buat pembanding nilai state sebelumnya sama yang lagi dklik baru
                  setSelectedCategory((prev) =>
                    prev === categoryName ? null : categoryName,
                  );
                } else {
                  setSelectedCategory(null);
                }
              },
              // Event hover pas cursor mouse di atas area chart
              onHover: (event: ChartEvent, chartElement: ActiveElement[]) => {
                // Ambil target elemen html canvas tempat chart dirender
                const target = event.native?.target as HTMLElement;
                if (target)
                  // Kalo cursor di atas bar chart, chartElement[0] = true, ubah cursor jadi tangan pointer
                  // Kalo cursor keluar dari bar chart, balik ke bentuk panah standar
                  target.style.cursor = chartElement[0] ? "pointer" : "default";
              },
            }}
          />
        </div>

        {/* Detail program data chart */}
        <div className="col-span-1 bg-card shadow-sm rounded-2xl flex flex-col">
          {/* <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h3 className="text-base font-semibold text-foreground">
              Struktur Performa Program
            </h3>
          </div> */}

          <div className="grid grid-cols-1 sm:grid-cols-10 gap-4 flex-1">
            <div className="sm:col-span-7">
              <BaseChart
                type="doughnut"
                title="Struktur Performa Program"
                data={detailProgramData}
                height={360}
              />
            </div>

            <div className="sm:col-span-3 p-4 rounded-[20px] bg-muted gap-2 h-full flex flex-col justify-center">
              {(() => {
                const p = MOCK_PROGRAMS.find((x) => x.id === activeProgramId);
                if (!p) return null;
                return (
                  <>
                    <div className="relative inline-block">
                      <select
                        value={activeProgramId}
                        onChange={(e) => setSelectedProgramId(e.target.value)}
                        className="appearance-none bg-card text-foreground text-sm font-medium rounded-full focus:ring-2 focus:ring-primary truncate focus:outline-none block pl-4 pr-10 py-0 h-10 cursor-pointer border-none w-full"
                      >
                        {filteredPrograms.map((prog) => (
                          <option key={prog.id} value={prog.id}>
                            {prog.name}
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

                    <div className="text-sm space-y-4 rounded-full">
                      <div className="flex flex-col p-2">
                        <span className="text-muted-foreground text-lg font-medium mb-1">
                          Net PNL
                        </span>
                        <span
                          className={`font-semibold text-xl ${p.pnl < 0 ? "text-destructive" : "text-primary"}`}
                        >
                          Rp {formatBigNumber(p.pnl)}
                        </span>
                      </div>
                      <div className="flex flex-col p-2">
                        <span className="text-muted-foreground text-lg font-medium">
                          Target Share
                        </span>
                        <span className="font-semibold text-xl text-foreground">
                          {p.capaianShare}% / {p.targetShare}%
                        </span>
                      </div>
                      <div className="flex flex-col mb-2 p-2">
                        <span className="text-muted-foreground text-lg font-medium">
                          Status
                        </span>
                        <span
                          className={`font-semibold text-xl ${p.pnl < 0 ? "text-destructive" : "text-primary"}`}
                        >
                          {p.keterangan}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => router.push("/compare")}
                      className="flex items-center justify-center gap-2 w-full bg-card hover:bg-primary hover:text-primary-foreground border border-border text-foreground h-10 pl-4 pr-6 rounded-full text-sm font-medium transition-colors shadow-sm cursor-pointer"
                    >
                      <GitCompare size={18} /> Compare
                    </button>
                  </>
                );
              })()}
            </div>
          </div>
        </div>

        {/* Top PNL Data Chart */}
        <div className="col-span-1 bg-card shadow-sm rounded-2xl flex flex-col p-2">
          <BaseChart
            type="bar"
            title={
              selectedCategory
                ? `Top PNL (${selectedCategory})`
                : "Top 5 Program (PNL Tertinggi)"
            }
            data={topPnlData}
            options={{ indexAxis: "y" }}
            height={360}
          />
        </div>

        {/* Bottom PNL Data Chart */}
        <div className="col-span-1 bg-card shadow-sm rounded-2xl flex flex-col p-2">
          <BaseChart
            type="bar"
            title={
              selectedCategory
                ? `Bottom PNL (${selectedCategory})`
                : "Bottom 5 Program (PNL Terendah)"
            }
            data={bottomPnlData}
            options={{
              indexAxis: "y",
              scales: {
                x: { stacked: true },
                y: { stacked: true },
              },
            }}
            height={360}
          />
        </div>

        {/* Top Digital Revenue Data Chart */}
        <div className="col-span-1 bg-card shadow-sm rounded-2xl flex flex-col p-2">
          <BaseChart
            type="bar"
            title={
              selectedCategory
                ? `Top Digital Revenue & Views (${selectedCategory})`
                : "Top 5 Digital (Revenue & Views Tertinggi)"
            }
            data={topRevenueDigitalData}
            options={{ indexAxis: "y" }}
            height={360}
          />
        </div>

        {/* Bottom Digital Revenue Data Chart */}
        <div className="col-span-1 bg-card shadow-sm rounded-2xl flex flex-col p-2">
          <BaseChart
            type="bar"
            title={
              selectedCategory
                ? `Bottom Digital Revenue & Views (${selectedCategory})`
                : "Bottom 5 Digital (Revenue & Views Terendah)"
            }
            data={bottomRevenueDigitalData}
            options={{
              indexAxis: "y",
            }}
            height={360}
          />
        </div>
      </section>

      {/* Grafik Target vs Aktual Revenue */}
      <section className="bg-card shadow-sm rounded-2xl p-2 overflow-x-auto custom-scrollbar">
        {/* Pake inline style untuk kalkulasi lebar area canvas berdasarkan total data program */}
        {/* Set minimal lebar area 800px, per program dialokasikan ruang sekitar 60px */}
        <div
          style={{
            minWidth: `${Math.max(800, filteredPrograms.length * 60)}px`,
          }}
        >
          <BaseChart
            type="bar"
            title={
              selectedCategory
                ? `Target vs Aktual Revenue - ${selectedCategory}`
                : "Target vs Aktual Revenue (Semua Kategori)"
            }
            data={comboTargetActualData}
            height={400}
          />
        </div>
      </section>

      {/* Grafik Performa TV */}
      <section className="bg-card shadow-sm rounded-2xl p-2 overflow-x-auto custom-scrollbar">
        {/* Pake inline style untuk kalkulasi lebar area canvas berdasarkan total data program */}
        {/* Set minimal lebar area 800px, per program dialokasikan ruang sekitar 60px */}
        <div
          style={{
            minWidth: `${Math.max(800, filteredPrograms.length * 60)}px`,
          }}
        >
          <BaseChart
            type="bar"
            title={
              selectedCategory
                ? `Performa TV (TVR & Share) - ${selectedCategory}`
                : "Performa TV (Target vs Aktual)"
            }
            data={tvPerformanceData}
            height={400}
          />
        </div>
      </section>
    </div>
  );
}
