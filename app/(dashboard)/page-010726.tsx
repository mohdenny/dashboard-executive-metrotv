"use client";

import React, {
  // Import hook buat atur state lokal
  useState,
  // Import hook buat optimalisasi
  useMemo,
} from "react";
// Import icon filter x buat reset
import { FilterX, RefreshCcw, GitCompare } from "lucide-react";
// Import hook router dari next navigation
import { useRouter } from "next/navigation";
// Import hook dashboard custom buat logic
import useDashboard from "@/hooks/useDashboard";
// Import modul chart js buat interaksi chart
import {
  ChartEvent,
  ActiveElement,
  Chart as ChartJS,
  Scale,
  CoreScaleOptions,
  Legend,
} from "chart.js";
// Import formatter big number biar angkanya ringkas
import { formatBigNumber } from "@/lib/formatters";
// Import komponen stat card buat ringkasan angka
import StatCard from "@/components/shared/StatCard";
// Import modal buat detail chart
import ChartDetailModal from "@/components/shared/ChartDetailModal";
// Import modal buat detail program
import ProgramDetailModal from "@/components/shared/ProgramDetailModal";
// Import komponen select custom
import CustomSelect from "@/components/shared/CustomSelect";
// Import komponen card pembungkus chart
import ChartCard from "@/components/shared/ChartCard";
import { size } from "lodash";

// Komponen page dashboard eksekutif buat pantau data
export default function ExecutiveDashboardPage() {
  // Inisialisasi router next buat pindah page
  const router = useRouter();

  // Ambil semua state dan data dari hook dashboard
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
    topProgramsDoughnutData,
  } = useDashboard();

  // Wadah state buat nilai tab top tv
  const [topTvTab, setTopTvTab] = useState<"tvr" | "share">("tvr");
  // Wadah state buat nilai tab bottom tv
  const [bottomTvTab, setBottomTvTab] = useState<"tvr" | "share">("tvr");

  // Wadah state buat buka tutup modal detail program
  const [isProgramDetailOpen, setIsProgramDetailOpen] =
    useState<boolean>(false);

  // Cari data program buat modal detail
  const activeProgramForModal = useMemo(() => {
    // Cari program yang idnya sama dengan aktif program
    return filteredPrograms.find((x) => x.id === activeProgramId) || null;
  }, [filteredPrograms, activeProgramId]);

  // Objek formatter axis y
  const axisYFormatter = {
    // Atur tick sumbu y
    ticks: {
      // Panggil formatter big number buat sumbu y
      callback: function (
        this: Scale<CoreScaleOptions>,
        tickValue: string | number,
      ) {
        // Balikin nilai format angka
        return formatBigNumber(Number(tickValue));
      },
    },
  };
  // Render isi page
  return (
    // Div pembungkus utama
    <div className="p-4 md:px-8 md:py-6 space-y-6 max-w-[1800px] mx-auto animate-in fade-in duration-300">
      {/* Box filter utama */}
      <div className="border border-border bg-card px-6 py-4 rounded-2xl flex lg:flex-row lg:items-center justify-between gap-4 shadow-sm">
        {/* Kontainer info update terakhir */}
        <div className="flex shrink-0 items-center gap-2">
          {/* Teks label update */}
          <p className="text-sm text-muted-foreground font-medium hidden sm:block">
            Pembaruan terakhir:
          </p>
          {/* Badge waktu update */}
          <span className="text-[11px] bg-muted px-2 py-0.5 rounded text-muted-foreground font-semibold flex items-center gap-1">
            {/* Icon refresh */}
            <RefreshCcw size={10} /> {lastUpdated}
          </span>
        </div>

        {/* Kontainer label periode */}
        <div className="w-full text-center">
          {/* Badge label periode aktif */}
          <span className="text-xs text-muted-foreground font-medium bg-muted/40 px-4 py-1.5 rounded-full border border-border">
            {/* Teks data ditampilkan */}
            Data Ditampilkan: {/* Nilai periode aktif */}
            <span className="font-bold text-foreground">
              {displayedPeriodLabel}
            </span>
          </span>
        </div>

        {/* Kontainer filter kategori dan periode */}
        <div className="flex items-center gap-4">
          {/* Select buat filter kategori */}
          <CustomSelect
            // Nilai filter aktif
            value={selectedCategory ?? ""}
            // Update state kategori
            onChange={setSelectedCategory}
            // List opsi kategori
            options={programCategories.map((c) => ({ label: c, value: c }))}
            // Teks placeholder
            placeholder="Pilih Kategori"
            // Atur lebar fit
            width="fit"
          />

          {/* Kontainer filter periode */}
          <div className="flex flex-row items-center gap-4">
            {/* Select buat filter periode */}
            <CustomSelect
              // Nilai periode aktif
              value={selectedPeriod ?? ""}
              // Update state periode
              onChange={setSelectedPeriod}
              // List opsi periode
              options={periodOptions.map((opt) => ({
                label: opt.label,
                value: opt.value,
              }))}
              // Style css
              className="w-full sm:w-auto"
              // Atur lebar fit
              width="fit"
            />

            {/* Kontainer tanggal custom */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Cek kalo periode custom aktif */}
              {selectedPeriod === "custom" && (
                // Kontainer input tanggal
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {/* Input bulan awal */}
                  <input
                    // Tipe input bulan
                    type="month"
                    // Nilai state awal
                    value={startMonth}
                    // Update state awal
                    onChange={(e) => setStartMonth(e.target.value)}
                    // Styling input
                    className="bg-muted/40 border border-border text-foreground rounded-full px-3 py-2 h-10 text-xs outline-none cursor-pointer"
                  />
                  {/* Teks s/d */}
                  <span className="text-muted-foreground text-xs">s/d</span>
                  {/* Input bulan akhir */}
                  <input
                    // Tipe input bulan
                    type="month"
                    // Nilai state akhir
                    value={endMonth}
                    // Update state akhir
                    onChange={(e) => setEndMonth(e.target.value)}
                    // Styling input
                    className="bg-muted/40 border border-border text-foreground rounded-full px-3 py-2 h-10 text-xs outline-none cursor-pointer"
                  />
                </div>
              )}
              {/* Kondisional buat tampilin tombol reset filter */}
              {(startMonth ||
                endMonth ||
                selectedCategory ||
                (selectedPeriod && selectedPeriod !== "all")) && (
                // Tombol reset filter
                <button
                  // Fungsi buat kosongin semua state filter
                  onClick={() => {
                    setStartMonth("");
                    setEndMonth("");
                    setSelectedCategory(null);
                    setSelectedPeriod("all");
                  }}
                  // Styling tombol reset
                  className="flex items-center gap-1.5 text-xs bg-destructive/10 text-destructive px-3 py-2 rounded-xl font-bold hover:bg-destructive/20 transition-colors cursor-pointer"
                >
                  {/* Icon filter x */}
                  <FilterX size={14} /> Reset
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Grid buat card statistik */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Mapping data kpi jadi card statistik */}
        {totalKPI.cards.map((card, idx) => (
          // Fragment buat bungkus komponen
          <React.Fragment key={idx}>
            {/* Panggil komponen stat card */}
            <StatCard card={card} />
          </React.Fragment>
        ))}
      </div>

      {/* Bagian chart */}
      <section className="grid grid-cols-1 lg:grid-cols-8 gap-6">
        {/* Panggil card chart buat pnl */}
        <ChartCard
          // Tipe bar
          type="bar"
          // Judul chart
          title="P&L (Per Kategori)"
          // Data chart pnl
          data={allProgramData}
          // Tinggi chart
          height={360}
          // Style container
          className="border border-border bg-card col-span-2 shadow-sm rounded-2xl flex flex-col p-4"
          // Fungsi buka modal detail chart
          // onExpand={() => {
          //   setChartDetailType("pnl");
          //   setChartDetailTitle("PNL Keseluruhan");
          //   setIsChartDetailOpen(true);
          // }}
          // Konfigurasi chart
          options={{
            // Nonaktifkan legend, display false
            plugins: {
              legend: {
                display: false,
              },
            },
            // Formatter sumbu y
            scales: { y: axisYFormatter },
            // Event klik bar
            onClick: (
              // Event chart
              event: ChartEvent,
              // Elemen yang diklik
              elements: ActiveElement[],
              // Instance chart
              chart: ChartJS,
            ) => {
              // Cek apa ada elemen yang kena klik
              if (elements && elements.length > 0) {
                // Ambil index bar
                const index = elements[0].index;
                // Ambil label kategori
                const categoryName = chart.data.labels?.[index] as string;
                // Set kategori aktif
                setSelectedCategory((prev) =>
                  prev === categoryName ? null : categoryName,
                );
              } else {
                // Reset kategori
                setSelectedCategory(null);
              }
            },
            // Ubah pointer pas hover
            onHover: (event: ChartEvent, chartElement: ActiveElement[]) => {
              // Ambil target html
              const target = event.native?.target as HTMLElement;
              // Kalo elemen ada ubah kursor
              if (target)
                target.style.cursor = chartElement[0] ? "pointer" : "default";
            },
          }}
        />

        {/* Pnl donat */}
        <div className="border border-red-500 col-span-6 bg-card shadow-sm rounded-2xl flex flex-col p-2">
          {/* Kolom donat chart */}
          <ChartCard
            // Tentukan tipe jenis visualisasi diagram grafik berbentuk doughnut
            type="doughnut"
            // Set isi string teks buat judul komponen card grafik donat
            title={
              selectedCategory
                ? `Kontribusi P&L (${selectedCategory})`
                : "Kontribusi P&L Seluruh Program"
            }
            // Masukin properti data chart donat dari variabel hasil hook tadi
            data={topProgramsDoughnutData}
            // Atur besaran ukuran tinggi card area grafik dalam piksel
            height={400}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              layout: {
                padding: selectedCategory
                  ? 0
                  : { left: 0, right: 0, top: 0, bottom: 0 },
              },
              onResize: (chart, size) => {
                // Kalo lebar canvas di bawah 500px (ukuran mobile), pindahin legend ke bawah
                if (size.width < 1024) {
                  chart.options.plugins!.legend!.position = "bottom";
                } else {
                  // Kalo layar balik ke lebar, balikin legend ke sisi kanan
                  chart.options.plugins!.legend!.position = "right";
                }
                // Wajib panggil update biar chart ngedesin ulang posisinya
                chart.update();
              },
              plugins: {
                legend: {
                  display: true,
                  position: "right",
                  align: "center",
                  labels: {
                    boxWidth: 20,
                    font: {
                      size: selectedCategory ? 16 : 16,
                      weight: selectedCategory ? "bold" : "normal",
                    },
                  },
                },
              },
              radius: selectedCategory ? "100%" : "80%",
              // cutout: selectedCategory ? "65%" : "50%",
            }}
          />
        </div>
      </section>

      {/* Bagian detail pnl top bottom */}
      <section className="border border-border bg-card shadow-sm rounded-2xl p-4 relative flex flex-col mt-6">
        {/* Tombol buka modal pnl */}
        <div className="absolute top-6 right-6 z-10">
          <button
            // Klik buat buka detail modal
            onClick={() => {
              setChartDetailType("pnl");
              setChartDetailTitle("Top & Bottom P&L Program");
              setIsChartDetailOpen(true);
            }}
            // Style tombol
            className="px-3 py-1.5 text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors cursor-pointer flex items-center justify-center bg-background/50 backdrop-blur border border-border"
          >
            Detail PNL
          </button>
        </div>

        {/* Grid chart pnl */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-10">
          {/* Chart top pnl */}
          <ChartCard
            type="bar"
            title={
              selectedCategory
                ? `Top P&L (${selectedCategory})`
                : "Top 5 Program (P&L Tertinggi)"
            }
            data={topPnlData}
            options={{ indexAxis: "y", scales: { x: axisYFormatter } }}
            height={360}
          />
          {/* Chart bottom pnl */}
          <ChartCard
            type="bar"
            title={
              selectedCategory
                ? `Bottom P&L (${selectedCategory})`
                : "Bottom 5 Program (P&L Terendah)"
            }
            data={bottomPnlData}
            options={{
              indexAxis: "y",
              scales: {
                x: { stacked: true, ...axisYFormatter },
                y: { stacked: true },
              },
            }}
            height={360}
          />
        </div>
      </section>

      {/* Bagian detail digital top bottom */}
      <section className="border border-border bg-card shadow-sm rounded-2xl p-4 relative flex flex-col mt-6">
        {/* Tombol buka modal digital */}
        <div className="absolute top-6 right-6 z-10">
          <button
            // Klik buat buka detail modal
            onClick={() => {
              setChartDetailType("digital");
              setChartDetailTitle("Digital Revenue & Views");
              setIsChartDetailOpen(true);
            }}
            // Style tombol
            className="px-3 py-1.5 text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors cursor-pointer flex items-center justify-center bg-background/50 backdrop-blur border border-border"
          >
            Detail Digital
          </button>
        </div>

        {/* Grid chart digital */}
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

      {/* Bagian detail tv top bottom */}
      <section className="border border-border bg-card shadow-sm rounded-2xl p-4 relative flex flex-col mt-6">
        {/* Kontainer kontrol tv */}
        <div className="absolute top-6 right-6 flex gap-2 z-10 bg-background/50 backdrop-blur px-2 py-1 rounded-xl border border-border">
          <button
            //Action buka modal detail
            onClick={() => {
              setChartDetailType("tv");
              setChartDetailTitle("Top & Bottom Performa TV");
              setIsChartDetailOpen(true);
            }}
            // Style tombol detail
            className="px-3 py-1 text-xs font-bold rounded-xl transition-colors cursor-pointer text-muted-foreground hover:bg-muted mr-2 border-r border-border pr-4"
          >
            Detail TV
          </button>
          {/* Tombol tab tvr */}
          <button
            onClick={() => {
              setTopTvTab("tvr");
              setBottomTvTab("tvr");
            }}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${topTvTab === "tvr" ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted"}`}
          >
            TVR
          </button>
          {/* Tombol tab share */}
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

        {/* Grid chart tv */}
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

      {/* Modal detail chart */}
      <ChartDetailModal
        isOpen={isChartDetailOpen}
        onClose={() => setIsChartDetailOpen(false)}
        title={chartDetailTitle}
        metricType={chartDetailType}
        programCategories={programCategories}
      />

      {/* Modal detail program */}
      <ProgramDetailModal
        isOpen={isProgramDetailOpen}
        onClose={() => setIsProgramDetailOpen(false)}
        program={activeProgramForModal}
      />
    </div>
  );
}
