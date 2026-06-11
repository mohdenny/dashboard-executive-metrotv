"use client";

import React from "react";
import { FilterX, LayoutDashboard } from "lucide-react";
import useDashboard from "@/hooks/useDashboard";
import { MOCK_PROGRAMS } from "@/constants/programMockData";
import BaseChart from "@/components/shared/BaseChart";
import { elements } from "chart.js";

export default function ExecutiveDashboardPage() {
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
  } = useDashboard();

  return (
    <div className="p-4 md:px-8 space-y-8 max-w-[1800px] mx-auto animate-in fade-in duration-300">
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

      {/* Chart */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 border-2 border-cyan-700">
        {/* All program data chart */}
        <div className="col-span-1 bg-card shadow-sm rounded-2xl border-2 border-red-500 flex flex-col p-2 relative">
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
              // Event click pas area chartnya diklik user
              // Kasih parameter elements biar bisa akses properti element si chart
              // Chart biar bisa akses properti chart bar, bukan area kosong
              onClick: (event, elements, chart) => {
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
              onHover: (event, chartElement) => {
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
        <div className="col-span-1 bg-card shadow-sm rounded-2xl border-2 border-blue-500 flex flex-col p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h3 className="text-base font-semibold text-foreground">
              Struktur Performa Program
            </h3>

            <select
              value={activeProgramId}
              onChange={(e) => setSelectedProgramId(e.target.value)}
              className="bg-muted text-foreground text-sm font-medium rounded-xl focus:ring-2 focus:ring-primary focus:outline-none block px-4 py-2.5 cursor-pointer min-w-[200px] border-none"
            >
              {filteredPrograms.map((prog) => (
                <option key={prog.id} value={prog.id}>
                  {prog.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-6 items-center flex-1">
            <div className="sm:col-span-3 min-h-[220px]">
              <BaseChart
                type="doughnut"
                data={detailProgramData}
                height={220}
              />
            </div>

            <div className="sm:col-span-2 p-5 bg-muted rounded-[20px] h-full flex flex-col justify-center border-2 border-purple-500">
              {(() => {
                const p = MOCK_PROGRAMS.find((x) => x.id === activeProgramId);
                if (!p) return null;
                return (
                  <div className="text-sm space-y-4">
                    <div className="flex flex-col border-b border-border/50 pb-3">
                      <span className="text-muted-foreground font-medium mb-1">
                        PNL Bersih
                      </span>
                      <span
                        className={`font-medium text-xl ${p.pnl < 0 ? "text-destructive" : "text-primary"}`}
                      >
                        Rp {p.pnl.toLocaleString("id-ID")}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-muted-foreground font-medium">
                        Target Capaian
                      </span>
                      <span className="font-semibold text-foreground">
                        {p.performaCapaian}% / {p.performaTarget}%
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-muted-foreground font-medium">
                        Status Analisis
                      </span>
                      <span className="font-semibold text-foreground">
                        {p.keterangan}
                      </span>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>

        {/* Top PNL Data Chart */}
        <div className="col-span-1 bg-card shadow-sm rounded-2xl border-2 border-green-500 flex flex-col p-2">
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
        <div className="col-span-1 bg-card shadow-sm rounded-2xl border-2 border-yellow-500 flex flex-col p-2">
          <BaseChart
            type="bar"
            title={
              selectedCategory
                ? `Bottom PNL (${selectedCategory})`
                : "Bottom 5 Program (PNL Terendah)"
            }
            data={bottomPnlData}
            options={{ indexAxis: "y" }}
            height={360}
          />
        </div>
      </section>

      <section className="bg-card shadow-sm rounded-2xl border-2 border-teal-500 p-2 overflow-x-auto custom-scrollbar">
        <div className="min-w-[800px]">
          <BaseChart
            type="bar"
            title={
              selectedCategory
                ? `Realisasi Target vs Aktual - ${selectedCategory}`
                : "Realisasi Target vs Aktual (Semua Kategori)"
            }
            data={comboTargetActualData}
            height={400}
          />
        </div>
      </section>
    </div>
  );
}
