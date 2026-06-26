"use client";

import React, { useState, useMemo } from "react";
import { FilterX, RefreshCcw, GitCompare } from "lucide-react";
import { useRouter } from "next/navigation";
import useDashboard from "@/hooks/useDashboard";
import {
  ChartEvent,
  ActiveElement,
  Chart as ChartJS,
  Scale,
  CoreScaleOptions,
} from "chart.js";
import { formatBigNumber } from "@/lib/formatters";
import StatCard from "@/components/shared/StatCard";
import ChartDetailModal from "@/components/shared/ChartDetailModal";
import ProgramDetailModal from "@/components/shared/ProgramDetailModal";
import CustomSelect from "@/components/shared/CustomSelect";
import ChartCard from "@/components/shared/ChartCard";

export default function ExecutiveDashboardPage() {
  const router = useRouter();

  const {
    allProgramData,
    filteredPrograms,
    detailProgramData,
    topPnlData,
    bottomPnlData,
    activeProgramId,
    selectedProgramId,
    setSelectedProgramId,
    selectedCategory,
    setSelectedCategory,
    startMonth,
    setStartMonth,
    endMonth,
    setEndMonth,
    totalKPI,
    topRevenueDigitalData,
    bottomRevenueDigitalData,
    topTvPerformanceDataTvr,
    topTvPerformanceDataShare,
    bottomTvPerformanceDataTvr,
    bottomTvPerformanceDataShare,
    programCategories,
    selectedPeriod,
    setSelectedPeriod,
    periodOptions,
    lastUpdated,
    displayedPeriodLabel,
    isChartDetailOpen,
    setIsChartDetailOpen,
    chartDetailType,
    setChartDetailType,
    chartDetailTitle,
    setChartDetailTitle,
  } = useDashboard();

  // Bikin state simpan nilai tab buat top tv
  const [topTvTab, setTopTvTab] = useState<"tvr" | "share">("tvr");
  // Bikin state simpan nilai tab buat bottom tv
  const [bottomTvTab, setBottomTvTab] = useState<"tvr" | "share">("tvr");

  // State lokal simpan status buka tutup modal detail program
  const [isProgramDetailOpen, setIsProgramDetailOpen] =
    useState<boolean>(false);

  // Cari data program aktif buat lempar ke modal detail
  const activeProgramForModal = useMemo(() => {
    return filteredPrograms.find((x) => x.id === activeProgramId) || null;
  }, [filteredPrograms, activeProgramId]);

  // Fungsi formatter kustom biar kependekan
  const axisYFormatter = {
    ticks: {
      callback: function (
        this: Scale<CoreScaleOptions>,
        tickValue: string | number,
      ) {
        return formatBigNumber(Number(tickValue));
      },
    },
  };

  return (
    <div className="p-4 md:px-8 md:py-6 space-y-6 max-w-[1800px] mx-auto animate-in fade-in duration-300">
      <div className="bg-card px-6 py-4 rounded-2xl flex lg:flex-row lg:items-center justify-between gap-4 shadow-sm">
        <div className="flex shrink-0 items-center gap-2">
          <p className="text-sm text-muted-foreground font-medium hidden sm:block">
            Pembaruan terakhir:
          </p>
          <span className="text-[11px] bg-muted px-2 py-0.5 rounded text-muted-foreground font-semibold flex items-center gap-1">
            <RefreshCcw size={10} /> {lastUpdated}
          </span>
        </div>

        <div className="w-full text-center">
          <span className="text-sm text-muted-foreground font-medium bg-muted/40 px-4 py-1.5 rounded-full border border-border">
            Data Ditampilkan:{" "}
            <span className="font-bold text-foreground">
              {displayedPeriodLabel}
            </span>
          </span>
        </div>

        <div className="flex items-center gap-4">
          <CustomSelect
            value={selectedCategory ?? ""}
            onChange={setSelectedCategory}
            options={programCategories.map((c) => ({ label: c, value: c }))}
            placeholder="Pilih Kategori"
            width="fit"
          />

          <div className="flex flex-row items-center gap-4">
            <CustomSelect
              value={selectedPeriod ?? ""}
              onChange={setSelectedPeriod}
              options={periodOptions.map((opt) => ({
                label: opt.label,
                value: opt.value,
              }))}
              className="w-full sm:w-auto"
              width="fit"
            />

            <div className="flex flex-wrap items-center gap-3">
              {selectedPeriod === "custom" && (
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <input
                    type="month"
                    value={startMonth}
                    onChange={(e) => setStartMonth(e.target.value)}
                    className="bg-muted/40 border border-border text-foreground rounded-full px-3 py-2 h-10 text-xs outline-none cursor-pointer"
                  />
                  <span className="text-muted-foreground text-xs">s/d</span>
                  <input
                    type="month"
                    value={endMonth}
                    onChange={(e) => setEndMonth(e.target.value)}
                    className="bg-muted/40 border border-border text-foreground rounded-full px-3 py-2 h-10 text-xs outline-none cursor-pointer"
                  />
                </div>
              )}
              {(startMonth ||
                endMonth ||
                selectedCategory ||
                (selectedPeriod && selectedPeriod !== "all")) && (
                <button
                  onClick={() => {
                    setStartMonth("");
                    setEndMonth("");
                    setSelectedCategory(null);
                    setSelectedPeriod("all");
                  }}
                  className="flex items-center gap-1.5 text-xs bg-destructive/10 text-destructive px-3 py-2 rounded-xl font-bold hover:bg-destructive/20 transition-colors cursor-pointer"
                >
                  <FilterX size={14} /> Reset Filter
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {totalKPI.cards.map((card, idx) => (
          <React.Fragment key={idx}>
            <StatCard card={card} />
          </React.Fragment>
        ))}
      </div>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tambah class bg-card sama p-4 biar setara sama bungkus chart donat */}
        <ChartCard
          type="bar"
          title="PNL Keseluruhan (Per Kategori)"
          data={allProgramData}
          height={360}
          className="bg-card shadow-sm rounded-2xl flex flex-col p-4"
          onExpand={() => {
            setChartDetailType("pnl");
            setChartDetailTitle("PNL Keseluruhan");
            setIsChartDetailOpen(true);
          }}
          options={{
            scales: { y: axisYFormatter },
            // Tangkap event pas area chart kena klik
            onClick: (
              event: ChartEvent,
              elements: ActiveElement[],
              chart: ChartJS,
            ) => {
              if (elements && elements.length > 0) {
                const index = elements[0].index;
                const categoryName = chart.data.labels?.[index] as string;
                // Simpan kategori baru ke dalem state buat filter data kalo beda
                setSelectedCategory((prev) =>
                  prev === categoryName ? null : categoryName,
                );
              } else {
                setSelectedCategory(null);
              }
            },
            // Ubah kursor jadi tangan pas hover bar chart
            onHover: (event: ChartEvent, chartElement: ActiveElement[]) => {
              const target = event.native?.target as HTMLElement;
              if (target)
                target.style.cursor = chartElement[0] ? "pointer" : "default";
            },
          }}
        />

        <div className="col-span-1 bg-card shadow-sm rounded-2xl flex flex-col p-2">
          <div className="grid grid-cols-1 sm:grid-cols-10 gap-4 flex-1">
            <div className="sm:col-span-7">
              <ChartCard
                type="doughnut"
                title="Struktur Performa Program"
                data={detailProgramData}
                height={360}
                className=""
                onExpand={() => setIsProgramDetailOpen(true)}
              />
            </div>

            <div className="sm:col-span-3 p-4 rounded-[20px] bg-muted gap-2 h-full flex flex-col justify-center">
              {(() => {
                const p = activeProgramForModal;
                if (!p) return null;

                const pnl = p.periods.reduce(
                  (s, per) => s + per.financials.pnl,
                  0,
                );
                const targetShare = p.periods.reduce(
                  (s, per) => s + per.performanceTV.targetShare,
                  0,
                );
                const capaianShare = p.periods.reduce(
                  (s, per) => s + per.performanceTV.actualShare,
                  0,
                );
                const status = p.periods[0]?.status || "-";

                return (
                  <>
                    <CustomSelect
                      value={activeProgramId ?? ""}
                      onChange={setSelectedProgramId}
                      // Kasih string kosong kalo id ga ada biar tipe data aman
                      options={filteredPrograms.map((prog) => ({
                        label: prog.name,
                        value: prog.id ?? "",
                      }))}
                      className="w-full"
                    />

                    <div className="text-sm space-y-4 rounded-full">
                      <div className="flex flex-col p-2">
                        <span className="text-muted-foreground text-lg font-medium mb-1">
                          Net PNL:
                        </span>
                        <span
                          className={`font-semibold text-xl ${pnl < 0 ? "text-destructive" : "text-primary"}`}
                        >
                          Rp {formatBigNumber(pnl)}
                        </span>
                      </div>
                      <div className="flex flex-col p-2">
                        <span className="text-muted-foreground text-lg font-medium">
                          Target Share:
                        </span>
                        <span className="font-semibold text-xl text-foreground">
                          {Math.round(capaianShare)}% / {targetShare}%
                        </span>
                      </div>
                      <div className="flex flex-col mb-2 p-2">
                        <span className="text-muted-foreground text-lg font-medium">
                          Status:
                        </span>
                        <span
                          className={`font-semibold text-xl ${pnl < 0 ? "text-destructive" : "text-primary"}`}
                        >
                          {status}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => router.push("/compare")}
                      className="flex items-center justify-center gap-2 w-full bg-card hover:bg-primary hover:text-primary-foreground text-foreground h-10 pl-4 pr-6 rounded-full text-sm font-medium transition-colors shadow-sm cursor-pointer"
                    >
                      <GitCompare size={18} /> Compare
                    </button>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-card shadow-sm rounded-2xl p-4 relative flex flex-col mt-6">
        <div className="absolute top-6 right-6 z-10">
          <button
            onClick={() => {
              setChartDetailType("pnl");
              setChartDetailTitle("Top & Bottom PNL Program");
              setIsChartDetailOpen(true);
            }}
            className="px-3 py-1.5 text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors cursor-pointer flex items-center justify-center bg-background/50 backdrop-blur border border-border"
          >
            Detail PNL
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-10">
          <ChartCard
            type="bar"
            title={
              selectedCategory
                ? `Top PNL (${selectedCategory})`
                : "Top 5 Program (PNL Tertinggi)"
            }
            data={topPnlData}
            options={{ indexAxis: "y", scales: { x: axisYFormatter } }}
            height={360}
          />
          <ChartCard
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
                x: { stacked: true, ...axisYFormatter.ticks },
                y: { stacked: true },
              },
            }}
            height={360}
          />
        </div>
      </section>

      <section className="bg-card shadow-sm rounded-2xl p-4 relative flex flex-col mt-6">
        <div className="absolute top-6 right-6 z-10">
          <button
            onClick={() => {
              setChartDetailType("digital");
              setChartDetailTitle("Digital Revenue & Views");
              setIsChartDetailOpen(true);
            }}
            className="px-3 py-1.5 text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors cursor-pointer flex items-center justify-center bg-background/50 backdrop-blur border border-border"
          >
            Detail Digital
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-10">
          <ChartCard
            type="bar"
            title={
              selectedCategory
                ? `Top Digital Revenue & Views (${selectedCategory})`
                : "Top 5 Digital (Revenue & Views Tertinggi)"
            }
            data={topRevenueDigitalData}
            options={{ indexAxis: "y", scales: { x: axisYFormatter } }}
            height={360}
          />
          <ChartCard
            type="bar"
            title={
              selectedCategory
                ? `Bottom Digital Revenue & Views (${selectedCategory})`
                : "Bottom 5 Digital (Revenue & Views Terendah)"
            }
            data={bottomRevenueDigitalData}
            options={{ indexAxis: "y", scales: { x: axisYFormatter } }}
            height={360}
          />
        </div>
      </section>

      <section className="bg-card shadow-sm rounded-2xl p-4 relative flex flex-col mt-6">
        <div className="absolute top-6 right-6 flex gap-2 z-10 bg-background/50 backdrop-blur px-2 py-1 rounded-xl border border-border">
          <button
            onClick={() => {
              setChartDetailType("tv");
              setChartDetailTitle("Top & Bottom Performa TV");
              setIsChartDetailOpen(true);
            }}
            className="px-3 py-1 text-xs font-bold rounded-xl transition-colors cursor-pointer text-muted-foreground hover:bg-muted mr-2 border-r border-border pr-4"
          >
            Detail TV
          </button>
          <button
            onClick={() => {
              setTopTvTab("tvr");
              setBottomTvTab("tvr");
            }}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${topTvTab === "tvr" ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted"}`}
          >
            TVR
          </button>
          <button
            onClick={() => {
              setTopTvTab("share");
              setBottomTvTab("share");
            }}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${topTvTab === "share" ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted"}`}
          >
            Share
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-14">
          <ChartCard
            type="bar"
            title={
              selectedCategory
                ? `Top 5 Performa TV - ${selectedCategory}`
                : "Top 5 Performa TV"
            }
            data={
              topTvTab === "tvr"
                ? topTvPerformanceDataTvr
                : topTvPerformanceDataShare
            }
            options={{ indexAxis: "y" }}
            height={400}
          />
          <ChartCard
            type="bar"
            title={
              selectedCategory
                ? `Bottom 5 Performa TV - ${selectedCategory}`
                : "Bottom 5 Performa TV"
            }
            data={
              bottomTvTab === "tvr"
                ? bottomTvPerformanceDataTvr
                : bottomTvPerformanceDataShare
            }
            options={{ indexAxis: "y" }}
            height={400}
          />
        </div>
      </section>

      <ChartDetailModal
        isOpen={isChartDetailOpen}
        onClose={() => setIsChartDetailOpen(false)}
        title={chartDetailTitle}
        metricType={chartDetailType}
        programCategories={programCategories}
      />

      <ProgramDetailModal
        isOpen={isProgramDetailOpen}
        onClose={() => setIsProgramDetailOpen(false)}
        program={activeProgramForModal}
      />
    </div>
  );
}
