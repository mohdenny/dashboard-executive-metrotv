"use client";

import React, {
  // Import hook referensi buat akses dom
  useRef,
  // Import hook buat simpen state
  useState,
} from "react";
// Import fungsi merge dari lodash buat gabungin objek opsi chart
import merge from "lodash/merge";
// Import icon buat kontrol zoom
import { Maximize2, ZoomIn, ZoomOut, RefreshCcw } from "lucide-react";
// Import modul chart js buat bikin grafik
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartType,
  ChartData,
  ChartOptions,
  DefaultDataPoint,
  BarController,
  LineController,
  PieController,
  DoughnutController,
  PolarAreaController,
  RadarController,
  Scale,
  CoreScaleOptions,
} from "chart.js";
// Import komponen chart dari react-chartjs-2
import { Chart } from "react-chartjs-2";
// Import helper format angka buat grafik
import { formatBigNumber, formatTooltipLabel } from "@/lib/formatters";
// Import palet warna untuk chart
import { T60_COLORS } from "@/constants/colorsChart";

// Daftarin semua scale sama plugin ke core chart js biar fitur aktif
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler,
  BarController,
  LineController,
  PieController,
  DoughnutController,
  PolarAreaController,
  RadarController,
);

// Daftarin plugin zoom lewat dynamic import di client biar ga error window not defined
if (typeof window !== "undefined") {
  // Panggil plugin zoom
  import("chartjs-plugin-zoom").then((plugin) => {
    // Daftarin plugin zoom
    ChartJS.register(plugin.default);
  });
}

// Struktur interface buat properti komponen grafik
interface BaseChartProps<T extends ChartType> {
  // Tipe grafik (bar, line, dsb)
  type: T;
  // Data grafik yang mau ditampilin
  data: ChartData<T, DefaultDataPoint<T>, unknown>;
  // Opsi konfigurasi tambahan
  options?: ChartOptions<T>;
  // Judul grafik
  title?: string;
  // Tinggi area grafik
  height?: number;
  // Fungsi buat expand grafik ke modal
  onExpand?: () => void;
  // Status buat tampil kontrol zoom
  showZoomControls?: boolean;
}

// Komponen grafik dasar buat aplikasi
export default function BaseChart<T extends ChartType>({
  type,
  data,
  options,
  title,
  height = 300,
  onExpand,
  showZoomControls,
}: BaseChartProps<T>) {
  // Buat referensi chart
  const chartRef = useRef<ChartJS<T, DefaultDataPoint<T>, unknown> | null>(
    null,
  );

  // State buat simpen nilai persen zoom
  const [zoomPercent, setZoomPercent] = useState<number>(100);

  // Fungsi buat nambah zoom
  const handleZoomIn = () => {
    // Batas maksimal zoom 500%
    if (zoomPercent >= 500) return;
    // Tambah 25% setiap klik/set zoom
    setZoomPercent((prev) => Math.min(500, prev + 25));
  };

  // Fungsi buat ngurangin zoom
  const handleZoomOut = () => {
    // Batas maksimal zoom25%
    if (zoomPercent <= 25) return;
    // Kuran 25%
    setZoomPercent((prev) => Math.max(25, prev - 25));
  };

  // Fungsi buat balikin zoom ke awal
  const handleResetZoom = () => {
    // Reset state ke 100%
    setZoomPercent(100);
  };

  // Bikin data yang udah dipoles warnanya biar cakep
  const styledData: ChartData<T, DefaultDataPoint<T>, unknown> = {
    // Salin data dari props
    ...data,
    // Map tiap dataset buat nambahin style
    datasets: data.datasets.map((dataset, index) => {
      // Cek apakah tipenya grafik bulet
      const isPieOrDoughnut =
        type === "pie" || type === "doughnut" || type === "polarArea";

      // Ambil warna default dari palet
      let defaultColor = T60_COLORS[index % T60_COLORS.length];

      // Ganti warna jadi merah kalo labelnya bottom pnl/minus
      if (dataset.label?.includes("Bottom") || dataset.label?.includes("Minus"))
        defaultColor = "#d62728";

      // Ganti warna jadi hijau kalo labelnya top pnl/positif
      if (dataset.label?.includes("Top") || dataset.label?.includes("Positif"))
        defaultColor = "#2ca02c";

      // Ganti warna kalo labelnya Target
      const color =
        dataset.label === "Target" || dataset.label === "Taget KPI"
          ? "#5A6B7C"
          : (dataset.backgroundColor as string) || defaultColor;

      // Definisi tipe data buat dataset biar bisa modif properti chart
      type FlexibleDataset = typeof dataset & {
        borderRadius?: number;
        tension?: number;
        pointBackgroundColor?: string;
      };

      // Cast dataset ke tipe flexible
      const flexData = dataset as FlexibleDataset;
      // Balikin dataset yang udah di-style
      return {
        // Salin dataset fleksibel
        ...flexData,
        // Set warna background
        backgroundColor:
          flexData.backgroundColor || (isPieOrDoughnut ? T60_COLORS : color),
        // Set warna border
        borderColor:
          flexData.borderColor || (type === "line" ? color : "#1d1b20"),
        // Set ketebalan border
        borderWidth:
          flexData.borderWidth ?? (type === "line" || isPieOrDoughnut ? 4 : 0),
        // Set radius sudut kalo bar
        ...(type === "bar" && { borderRadius: flexData.borderRadius ?? 6 }),
        // Set radius sudut kalo bulet
        ...(isPieOrDoughnut && { borderRadius: flexData.borderRadius ?? 6 }),
        // Set style buat grafik garis
        ...(type === "line" && {
          // Set kelengkungan garis
          tension: flexData.tension ?? 0.3,
          // Set warna titik data
          pointBackgroundColor: flexData.pointBackgroundColor || color,
        }),
      };
    }) as ChartData<T, DefaultDataPoint<T>, unknown>["datasets"],
  };

  // Konfigurasi dasar buat tampilan chart
  const defaultOptions: ChartOptions<T> = {
    // Biar responsif
    responsive: true,
    // Matiin aspek rasio biar tinggi bebas
    maintainAspectRatio: false,
    // Plugin chart js
    plugins: {
      legend: {
        // Posisi legend di bawah
        position: "bottom",
        // Tampilkan legend
        display: true,
        // Styling teks legend
        labels: {
          // Icon box
          usePointStyle: false,
          // Jarak antar item
          padding: 20,
          // Font legend
          font: { family: "'Inter', sans-serif", size: 16, weight: 500 },
          // Warna teks legend
          color: "#FFFFFF",
          // Lebar box
          boxWidth: 15,
          // Tinggi box
          boxHeight: 15,
        },
      },
      tooltip: {
        // Background tooltip
        backgroundColor: "rgba(28, 27, 31, 0.9)",
        // Font judul
        titleFont: { size: 16 },
        // Font isi
        bodyFont: { size: 16 },
        // Jarak dalam
        padding: 12,
        // Lengkung sudut
        cornerRadius: 8,
        // Tampil warna dataset
        displayColors: true,
        // Format teks tooltip
        callbacks: {
          label: formatTooltipLabel,
        },
      },
    },
    // Konfigurasi sumbu buat tipe non-bulet
    scales: ["pie", "doughnut", "polarArea", "radar"].includes(type)
      ? undefined
      : {
          x: {
            // Hilang garis grid x
            // grid: { display: false },
            grid: { color: "rgba(255, 255, 255, 0.05)" },
            // Konfigurasi teks sumbu x
            ticks: {
              // Tampil semua teks
              autoSkip: false,
              // Font sumbu
              font: { family: "'Inter', sans-serif", size: 16 },
              // Warna teks
              color: "#FFFFFF",
              // Callback format angka
              callback: function (
                this: Scale<CoreScaleOptions>,
                tickValue: string | number,
              ) {
                // Ambil label berdasarkan index
                const label = this.getLabelForValue
                  ? this.getLabelForValue(tickValue as number)
                  : tickValue;
                // Kalo bukan angka balikin label aslinya
                if (typeof label === "string" && isNaN(Number(label))) {
                  return label;
                }
                // Balikin angka yang diformat
                return formatBigNumber(Number(tickValue));
              },
            },
          },
          y: {
            // Hilang garis border
            border: { display: false },
            // Warna grid y
            grid: { color: "rgba(255, 255, 255, 0.05)" },
            // grid: { color: "rgba(0, 0, 0, 0.05)" },
            // Konfigurasi teks sumbu y
            ticks: {
              // Tampil semua teks
              autoSkip: false,
              // Font sumbu
              font: { family: "'Inter', sans-serif", size: 16 },
              // Warna teks
              color: "#FFFFFF",
              // Callback format angka
              callback: function (
                this: Scale<CoreScaleOptions>,
                tickValue: string | number,
              ) {
                // Ambil label berdasarkan index
                const label = this.getLabelForValue
                  ? this.getLabelForValue(tickValue as number)
                  : tickValue;
                // Kalo bukan angka balikin label aslinya
                if (typeof label === "string" && isNaN(Number(label))) {
                  return label;
                }
                // Balikin angka yang diformat
                return formatBigNumber(Number(tickValue));
              },
            },
          },
        },
  } as ChartOptions<T>;

  // Gabung opsi standar sama opsi dari props
  const mergedOptions = merge({}, defaultOptions, options) as ChartOptions<T>;

  // Hitung tinggi grafik setelah zoom
  const finalHeight = height * (zoomPercent / 100);
  // Hitung lebar grafik setelah zoom
  const finalWidth = zoomPercent > 100 ? `${zoomPercent}%` : "100%";

  // Render page
  return (
    // Bungkus utama
    <div className="flex flex-col w-full p-6 relative">
      {" "}
      {/* Cek apa judul ada */}
      {title && (
        // Header judul chart
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-bold text-foreground">
            {/* Judul chart */}
            {title}
          </h3>
          {/* Tombol expand kalo ada fungsi onExpand */}
          {onExpand && (
            <button
              //Action klik expand
              onClick={onExpand}
              // Style tombol expand
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors cursor-pointer"
            >
              {/* Icon maximize */}
              <Maximize2 size={18} />
            </button>
          )}
        </div>
      )}
      {/* Kontrol zoom kalo aktif */}
      {showZoomControls && (
        // Bungkus kontrol zoom
        <div className="sticky top-0 z-20 flex justify-end w-full mb-2 pointer-events-none">
          <div className="pointer-events-auto flex items-center gap-2 bg-background/80 backdrop-blur px-2 py-1 rounded-full border border-border shadow-sm">
            {/* Info persen zoom */}
            <span className="text-xs font-bold text-muted-foreground px-2">
              Zoom {zoomPercent}%
            </span>
            {/* Tombol zoom in */}
            <button
              onClick={handleZoomIn}
              className="p-1.5 bg-card hover:bg-primary hover:text-primary-foreground rounded-full cursor-pointer transition-colors text-muted-foreground border border-border"
            >
              <ZoomIn size={16} />
            </button>
            {/* Tombol zoom out */}
            <button
              onClick={handleZoomOut}
              className="p-1.5 bg-card hover:bg-primary hover:text-primary-foreground rounded-full cursor-pointer transition-colors text-muted-foreground border border-border"
            >
              <ZoomOut size={16} />
            </button>
            {/* Tombol reset */}
            <button
              onClick={handleResetZoom}
              className="p-1.5 bg-card hover:bg-primary hover:text-primary-foreground rounded-full cursor-pointer transition-colors text-muted-foreground border border-border"
            >
              <RefreshCcw size={16} />
            </button>
          </div>
        </div>
      )}
      {/* Bungkus area scroll horizontal */}
      <div className="w-full overflow-x-auto custom-scrollbar">
        {/* Kontainer canvas grafik */}
        <div
          style={{
            height: `${finalHeight}px`,
            width: finalWidth,
            position: "relative",
          }}
        >
          {/* Komponen grafik */}
          <Chart
            ref={chartRef}
            type={type}
            data={styledData}
            options={mergedOptions}
          />
        </div>
      </div>
    </div>
  );
}
