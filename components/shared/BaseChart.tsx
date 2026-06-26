"use client";

import React, { useRef, useState } from "react";
import merge from "lodash/merge";
import { Maximize2, ZoomIn, ZoomOut, RefreshCcw } from "lucide-react";
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
import { Chart } from "react-chartjs-2";
import { formatBigNumber, formatTooltipLabel } from "@/lib/formatters";

// Daftar semua scale sama plugin ke core chart js biar fitur aktif, siap digunakan
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

// Daftar plugin zoom lewat dynamic import di client biar ga error window not defined
if (typeof window !== "undefined") {
  import("chartjs-plugin-zoom").then((plugin) => {
    ChartJS.register(plugin.default);
  });
}

// Warna palet buat grafik referensi dari tableu
const T10_COLORS = [
  // Biru
  "#1f77b4",
  // Oren/Jingga
  "#ff7f0e",
  // Hijau
  "#2ca02c",
  // Merah
  "#d62728",
  // Ungu
  "#9467bd",
  // Cokelat
  "#8c564b",
  // Pink
  "#e377c2",
  // Slate
  "#5A6B7C",
  // Hijau zaitun
  "#bcbd22",
  // Cyan atau biru muda
  "#17becf",
];

// Struktur interface properti komponen
// Pake T biar generik dinamis, terima apa aja
interface BaseChartProps<T extends ChartType> {
  // Misal bar, line, pie
  type: T;
  // Data grafik, sesuai sama tipe grafik
  data: ChartData<T, DefaultDataPoint<T>, unknown>;
  // Opsi tambah buat konfigurasi
  options?: ChartOptions<T>;
  // Judul grafik
  title?: string;
  // Tinggi area grafik, satuan piksel
  height?: number;
  // Prop fungsi panggil modal detail full
  onExpand?: () => void;
  // Tampil tombol kontrol zoom
  showZoomControls?: boolean;
}

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

  // State simpan nilai persen zoom mulai seratus
  const [zoomPercent, setZoomPercent] = useState<number>(100);

  // Fungsi klik tombol tambah zoom ke dalem grafik
  const handleZoomIn = () => {
    // Batas maksimal zoom in lima ratus persen
    if (zoomPercent >= 500) return;

    // Hitung nilai persen tambah zoom, simpan ke state
    setZoomPercent((prev) => Math.min(500, prev + 25));
  };

  // Fungsi klik tombol kurang zoom ke luar grafik
  const handleZoomOut = () => {
    // Batas maksimal zoom out dua puluh lima persen
    if (zoomPercent <= 25) return;

    // Hitung nilai persen kurang zoom, simpan ke state
    setZoomPercent((prev) => Math.max(25, prev - 25));
  };

  // Fungsi balik ukuran grafik ke awal seratus persen
  const handleResetZoom = () => {
    // Reset state persen zoom balik seratus
    setZoomPercent(100);
  };

  // Bikin objek data baru buat modif warna plus style data, biar ga pake gaya asli
  const styledData: ChartData<T, DefaultDataPoint<T>, unknown> = {
    // Salin semua properti data asli
    ...data,
    // Loop tiap dataset dari props
    datasets: data.datasets.map((dataset, index) => {
      // Cek tipe grafik pie, donat atau polar
      const isPieOrDoughnut =
        type === "pie" || type === "doughnut" || type === "polarArea";

      // Biar grafik warna warni otomatis, urut dari index
      // Pake modulo persen biar warna grafik balik ke awal kalo stok warna abis, cari sisa
      let defaultColor = T10_COLORS[index % T10_COLORS.length];

      // Ubah warna jadi merah kalo label dataset ada kata Bottom PNL atau Minus
      if (dataset.label?.includes("Bottom") || dataset.label?.includes("Minus"))
        defaultColor = "#d62728";

      // Ubah warna jadi hijau kalo label dataset ada kata Top PNL atau Positif
      if (dataset.label?.includes("Top") || dataset.label?.includes("Positif"))
        defaultColor = "#2ca02c";

      // Kalo label Target atau Target KPI, kasih warna abu abu
      const color =
        dataset.label === "Target" || dataset.label === "Taget KPI"
          ? "#5A6B7C"
          : (dataset.backgroundColor as string) || defaultColor;

      // Bikin tipe data kustom lokal, supaya ts izin properti spesifik kaya borderRadius di bar chart atau tension pointBackgroundColor di line chart
      type FlexibleDataset = typeof dataset & {
        borderRadius?: number;
        tension?: number;
        pointBackgroundColor?: string;
      };

      // Ubah tipe dataset asli ke tipe FlecxibleDataset yang udah bikin
      const flexData = dataset as FlexibleDataset;
      return {
        // Salin dataset asli
        ...flexData,
        // Kalo ada warna pake warna yang ada, atau pie donat pake semua palet warna, atau chart bar line pake satu warna, balik warna sesuai label
        backgroundColor:
          flexData.backgroundColor || (isPieOrDoughnut ? T10_COLORS : color),
        // Kalo ada border warna pake warna yang ada, atau tipe line border kasih warna sesuai label, selain itu kasih warna putih buat chart lain
        borderColor:
          flexData.borderColor || (type === "line" ? color : "#1d1b20"),
        // Ukuran border, empat piksel buat line chart, nol piksel buat yang lain
        borderWidth:
          flexData.borderWidth ?? (type === "line" || isPieOrDoughnut ? 4 : 0),
        // Kalo grafik bar, otomatis kasih border radius enam piksel
        ...(type === "bar" && { borderRadius: flexData.borderRadius ?? 6 }),
        ...(isPieOrDoughnut && { borderRadius: flexData.borderRadius ?? 6 }),
        // Kalo grafik line
        ...(type === "line" && {
          // Kalo data ga ada tension, otomatis bikin garis lengkung nol koma tiga
          tension: flexData.tension ?? 0.3,
          // Kalo titik warna data ga ada, kasih warna titik data sesuai warna garis
          pointBackgroundColor: flexData.pointBackgroundColor || color,
        }),
      };
      // Paksa return map supaya sesuai sama tipe dataset Chart js
    }) as ChartData<T, DefaultDataPoint<T>, unknown>["datasets"],
  };

  // Bikin objek konfigurasi default buat tampil grafik
  const defaultOptions: ChartOptions<T> = {
    // Bikin ukuran grafik otomatis responsif ikut ukuran layar atau container
    responsive: true,
    // Mati aspek rasio asli supaya tinggi grafik bisa atur bebas lewat style tailwind
    maintainAspectRatio: false,
    plugins: {
      legend: {
        // Tampil posisi legend chart di bawah grafik
        position: "bottom",
        // Paksa label legend tampil semua pas zoom out, jangan sembunyi
        display: true,
        labels: {
          // Ubah icon kotak asli jadi bentuk bulat atau titik tanda data
          usePointStyle: false,
          // Kasih jarak dua puluh piksel antar item
          padding: 20,
          // Atur font jadi inter, ukuran enam belas, tebal medium
          font: { family: "'Inter', sans-serif", size: 16, weight: 500 },
          // Warna text
          color: "#FFFFFF",
          boxWidth: 15,
          boxHeight: 15,
        },
      },
      tooltip: {
        // Warna background tooltip hitam transparan
        backgroundColor: "rgba(28, 27, 31, 0.9)",
        // Ukuran font judul di dalem tooltip
        titleFont: { size: 16 },
        // Ukuran font isi teks di dalem tooltip
        bodyFont: { size: 16 },
        // Jarak dalem kotak tooltip dua belas piksel
        padding: 12,
        // Bikin sudut kotak tooltip lengkung delapan piksel
        cornerRadius: 8,
        // Tampil kotak warna dataset kecil di samping teks tooltip
        displayColors: true,
        // Format label tooltip
        callbacks: {
          label: formatTooltipLabel,
        },
      },
    },
    // Atur konfigurasi sumbu, kalo grafik tipe lingkaran sumbu tiada, soal lingkaran ga perlu ada sumbu
    scales: ["pie", "doughnut", "polarArea", "radar"].includes(type)
      ? undefined
      : {
          x: {
            // Konfigurasi sumbu x datar kiri kanan
            // Hilang garis grid
            grid: { display: false },
            // Atur font buat teks di sumbu x
            ticks: {
              // Paksa teks sumbu tampil semua pas grafik zoom out, cegah potong
              autoSkip: false,
              font: { family: "'Inter', sans-serif", size: 16 },
              color: "#FFFFFF",
              // Format tick biar angka singkat
              callback: function (
                this: Scale<CoreScaleOptions>,
                tickValue: string | number,
              ) {
                // Ambil label asli ikut index
                const label = this.getLabelForValue
                  ? this.getLabelForValue(tickValue as number)
                  : tickValue;

                // Cek kalo wujud label huruf bukan angka, langsung balik label utuh
                if (typeof label === "string" && isNaN(Number(label))) {
                  return label;
                }

                // Cek kalo wujud label angka, format angka ringkas
                return formatBigNumber(Number(tickValue));
              },
            },
          },
          y: {
            // Konfigurasi sumbu y
            // Hilang garis border sumbu y paling kiri
            border: { display: false },
            // Kasih warna garis grid abu abu tipis
            grid: { color: "rgba(0, 0, 0, 0.05)" },
            // Atur font buat teks angka di sumbu y
            ticks: {
              // Paksa teks sumbu tampil semua pas grafik zoom out, cegah potong
              autoSkip: false,
              font: { family: "'Inter', sans-serif", size: 16 },
              color: "#FFFFFF",
              // Format tick biar angka singkat
              callback: function (
                this: Scale<CoreScaleOptions>,
                tickValue: string | number,
              ) {
                // Ambil label asli ikut index
                const label = this.getLabelForValue
                  ? this.getLabelForValue(tickValue as number)
                  : tickValue;

                // Cek kalo wujud label huruf bukan angka, langsung balik label utuh
                if (typeof label === "string" && isNaN(Number(label))) {
                  return label;
                }

                // Cek kalo wujud label angka, format angka ringkas
                return formatBigNumber(Number(tickValue));
              },
            },
          },
        },
    // Kasting konfigurasi ke tipe ChartOptions T
  } as ChartOptions<T>;

  // Gabung opsi default komponen sama opsi kustom dari props
  const mergedOptions = merge({}, defaultOptions, options) as ChartOptions<T>;

  // Hitung tinggi final grafik dari prop height kali persen zoom
  const finalHeight = height * (zoomPercent / 100);

  // Hitung lebar final grafik dari persen zoom biar bisa scroll
  const finalWidth = zoomPercent > 100 ? `${zoomPercent}%` : "100%";

  // Render di browser
  return (
    // Container
    <div className="flex flex-col w-full p-6 relative">
      {" "}
      {title && (
        // Syarat render, kalo ada prop title, render elemen di bawah
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-bold text-foreground">
            {/* Tampil teks title grafik */}
            {title}
          </h3>
          {onExpand && (
            // Tombol klik muncul modal detail
            <button
              onClick={onExpand}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors cursor-pointer"
            >
              <Maximize2 size={18} />
            </button>
          )}
        </div>
      )}
      {showZoomControls && (
        // Bungkus tombol zoom sama indikator persen posisi nempel atas
        <div className="sticky top-0 z-20 flex justify-end w-full mb-2 pointer-events-none">
          <div className="pointer-events-auto flex items-center gap-2 bg-background/80 backdrop-blur px-2 py-1 rounded-full border border-border shadow-sm">
            {/* Tampil teks indikator jumlah persen zoom */}
            <span className="text-xs font-bold text-muted-foreground px-2">
              Zoom {zoomPercent}%
            </span>
            <button
              onClick={handleZoomIn}
              className="p-1.5 bg-card hover:bg-primary hover:text-primary-foreground rounded-full cursor-pointer transition-colors text-muted-foreground border border-border"
            >
              <ZoomIn size={16} />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-1.5 bg-card hover:bg-primary hover:text-primary-foreground rounded-full cursor-pointer transition-colors text-muted-foreground border border-border"
            >
              <ZoomOut size={16} />
            </button>
            <button
              onClick={handleResetZoom}
              className="p-1.5 bg-card hover:bg-primary hover:text-primary-foreground rounded-full cursor-pointer transition-colors text-muted-foreground border border-border"
            >
              <RefreshCcw size={16} />
            </button>
          </div>
        </div>
      )}
      {/* Container bungkus area scroll horizontal */}
      <div className="w-full overflow-x-auto custom-scrollbar">
        {/* Container bungkus canvas grafik, tinggi dan lebar dinamis sesuai prop height kali zoom */}
        <div
          style={{
            height: `${finalHeight}px`,
            width: finalWidth,
            position: "relative",
          }}
        >
          {/* Panggil komponen Chart dari react chart js dua, kirim data sama opsi olah */}
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
