"use client";

import React from "react";
import merge from "lodash/merge";
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
} from "chart.js";
import { Chart } from "react-chartjs-2";
import { formatBigNumber, formatTooltipLabel } from "@/lib/formatters";

//  Daftarin semua scale sama pluginnya ke core ChartJS biar fiturnya aktif, bisa digunakan
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

// Warna palet buat grafiknya refrensi dari tableu
const T10_COLORS = [
  // Biru
  "#1f77b4",
  // Jingga
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
  // Abu2
  "#7f7f7f",
  // Hijau zaitun
  "#bcbd22",
  // Cyan/Biru muda
  "#17becf",
];

// Struktur interface properti komponen
// Pake T biar generik dinamis, nerima apa saja
interface BaseChartProps<T extends ChartType> {
  // Misalnya bar, line, pie
  type: T;
  // Data grafik, disesuaikan sama tipe grafiknya
  data: ChartData<T, DefaultDataPoint<T>, unknown>;
  // Opsi tambahan buat konfigurasi
  options?: ChartOptions<T>;
  // Judul grafiknya
  title?: string;
  // Tinggi area grafiknya, satuan pixel
  height?: number;
}

export default function BaseChart<T extends ChartType>({
  type,
  data,
  options,
  title,
  height = 300,
}: BaseChartProps<T>) {
  // Bikin objek data baru buat modif warna+style data, biar ga pake tampilan bawaan
  const styledData: ChartData<T, DefaultDataPoint<T>, unknown> = {
    // Copy semua properti data aslinya
    ...data,
    // Loop setiap dataset yang dikirim
    datasets: data.datasets.map((dataset, index) => {
      // Cek apakah tipe grafik pie, donat atau polar
      const isPieOrDoughnut =
        type === "pie" || type === "doughnut" || type === "polarArea";

      // Biar grafiknya warna-warni otomatis, ngurut dari index
      // Pake modulo % biar warna grafiknya balik ke awal kalo stok warnanya udah abis, nyari sisanya
      let defaultColor = T10_COLORS[index % T10_COLORS.length];

      // Ubah warna jadi hijau kalo label datasetnya ada kata "Top PNL" atau "Positif"
      if (dataset.label?.includes("Top") || dataset.label?.includes("Positif"))
        defaultColor = "#2ca02c";

      // Ubah warna jadi merah kalo label datasetnya ada kata "Bottom PNL" atau "Negatif"
      if (dataset.label?.includes("Bottom") || dataset.label?.includes("Minus"))
        defaultColor = "#d62728";

      // Kalo labenya "Target" atau "Target KPI", kasih warna abu2
      const color =
        dataset.label === "Target" || dataset.label === "Taget KPI"
          ? "#7f7f7f"
          : (dataset.backgroundColor as string) || defaultColor;

      // bikin tipe data kostum lokal, supaya ts izinin properti spesifik kaya borderRadius di bar chart atau tension pointBackgroundColor di line chart
      type FlexibleDataset = typeof dataset & {
        borderRadius?: number;
        tension?: number;
        pointBackgroundColor?: string;
      };

      // Ubah tipe dataset asli ke tipe FlecxibleDataset yang udah dibikin
      const flexData = dataset as FlexibleDataset;
      return {
        // Salin dataset asli
        ...flexData,
        backgroundColor:
          // Kalo ada warna pake warna yang ada || pie atau donat pake semua palet warna || kalo grafiknya bar atau line pake satu warna aja balikin warnanya 'color' yang sesuai label.
          flexData.backgroundColor || (isPieOrDoughnut ? T10_COLORS : color),
        borderColor:
          // Kalo ada border warnanya pake warna yang ada || kalo tipenya line bordernya kasih warna yang sesuai label, kalo engga kasih warna putih untuk chart lainnya
          flexData.borderColor || (type === "line" ? color : "#1d1b20"),
        // Ukuran border, 3px buat line chart, 1px buat yang lainnya
        borderWidth:
          flexData.borderWidth ?? (type === "line" || isPieOrDoughnut ? 4 : 0),
        // Kalo grafiknya bar, otomatis kasih border radius 6px
        ...(type === "bar" && { borderRadius: flexData.borderRadius ?? 6 }),
        ...(isPieOrDoughnut && { borderRadius: flexData.borderRadius ?? 6 }),
        // Kalo grafiknya line
        ...(type === "line" && {
          // Kalo di data ga ada tansion, otomatis bikin garis melengkung 0.3.
          tension: flexData.tension ?? 0.3,
          // Kalo titik warna datamya ga ada, kasih warna titik data sesuai warna garisnya yang ada
          pointBackgroundColor: flexData.pointBackgroundColor || color,
        }),
      };
      // Paksa return map supaya sesuai sama tipe dataset Chart.js
    }) as ChartData<T, DefaultDataPoint<T>, unknown>["datasets"],
  };

  // Bikin objek konfigurasi default buat tampilan grafik
  const defaultOptions: ChartOptions<T> = {
    // Bikin ukuran grafik otomatis responsif ngikut ukuran layar atau containernya
    responsive: true,
    // Matiin aspek rasio bawaan supaya tinggi grafik bisa diatur bebas lewat style tailwind
    maintainAspectRatio: false,
    plugins: {
      legend: {
        // Tampilin posisi keterangan/key si chart di bagian bawah grafiknya
        position: "bottom",
        labels: {
          // Ubah icon kotak bawaan jadi bentuk bulet atao titik tanda datanya
          usePointStyle: false,
          // Kasih jarak 20px antar item
          padding: 20,
          // Atur font jadi 'Inter', ukurannya 12, tebelnya medium
          // Sebelumnya 12, naik 2 poin jadi 14
          font: { family: "'Inter', sans-serif", size: 16, weight: 500 },
          // Warna text
          color: "#FFFFFF",
          boxWidth: 15,
          boxHeight: 15,
        },
      },
      tooltip: {
        // Warna background tooltip hitam transparan (dark mode style)
        backgroundColor: "rgba(28, 27, 31, 0.9)",
        // Ukuran font judul di dalem tooltip
        titleFont: { size: 16 },
        // Ukuran font isi teks di dalem tooltip
        bodyFont: { size: 16 },
        // Jarak bagian dalem (padding) kotak tooltip 12px
        padding: 12,
        // Biki sudut kotak tooltip melengkung 8px
        cornerRadius: 8,
        // Tampilin kotak warna dataset kecil di samping teks tooltip
        displayColors: true,
        // Format label tooltip
        callbacks: {
          label: formatTooltipLabel,
        },
      },
    },
    // Atur konfigurasi sumbu (axis grid), kalo grafik tipe lingkaran sumbu ditiadakan (undefined) solanya kan lingkaran ga perlu ada sumbu
    scales: ["pie", "doughnut", "polarArea", "radar"].includes(type)
      ? undefined
      : {
          x: {
            // Konfigurasu sumbu X mendatar/kiri-kanan
            // Ilangin garis grid
            grid: { display: false },
            // Atur font buat teks di sumbu X
            ticks: {
              font: { family: "'Inter', sans-serif", size: 14 },
              color: "#FFFFFF",
              // Format ticknya biar angkanya disingkat
              callback: formatBigNumber,
            },
          },
          y: {
            // Konfigurasi sumbu Y
            // Ilangin garis border sumbu Y paling kiri
            border: { display: false },
            // Kasih warna garis grid abu2 tipis
            grid: { color: "rgba(0, 0, 0, 0.05)" },
            // Atur font buat teks angka di sumbu Y
            ticks: {
              font: { family: "'Inter', sans-serif", size: 14, weight: "normal" },
              color: "#FFFFFF",
              //  Format ticknya biar angkanya disingkat
              callback: formatBigNumber,
            },
          },
        },
    // Type casting konfigurasi ke tipe ChartOptions<T>
  } as ChartOptions<T>;

  // Gabungin opsi default komponen sama opsi kustom yang dikirim user via props
  const mergedOptions = merge({}, defaultOptions, options) as ChartOptions<T>;

  // Render di browser
  return (
    // Container
    <div className="flex flex-col w-full h-full md:p-6 p-3">
      {" "}
      {title && (
        // Confitional rendering, kalo ada prop title, render elemen h3 di bawah ini
        <h3 className="text-xl md:text-2xl font-semibold text-foreground mb-4">
          {/* Tampil teks title grafiknya */}
          {title}
        </h3>
      )}
      {/* Container pembungkus canvas grafik, tingginya dinamis sesuai sama prop height */}
      <div style={{ height: `${height}px`, width: "100%" }}>
        {/* Panggil komponen Chart dari react-chartjs-2, data sama opsi yang udah diproses tadi */}
        <Chart type={type} data={styledData} options={mergedOptions} />
      </div>
    </div>
  );
}
