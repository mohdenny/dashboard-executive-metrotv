import React from "react";
// Import komponen BaseChart dari folder shared
import BaseChart from "@/components/shared/BaseChart";
// Import tipe data yang dibutuhin chart js
import { ChartType, ChartData, ChartOptions, DefaultDataPoint } from "chart.js";
// Import fungsi cn buat ngegabungin classname biar dinamis
import { cn } from "@/lib/utils";

// Interface buat properti yang dipake di komponen chart card ini
interface ChartCardProps<T extends ChartType> {
  // Tipe grafik yang bakal dipake, contohnya bar, line, atau pie
  type: T;
  // Judul opsional buat nampilin nama grafik di atas
  title?: string;
  // Data utama grafik yang disesuaiin sama tipe grafik
  data: ChartData<T, DefaultDataPoint<T>, unknown>;
  // Opsi konfigurasi tambahan buat ngebentuk tampilan chart
  options?: ChartOptions<T>;
  // Tinggi grafik dalam satuan pixel, defaultnya tiga ratus enam puluh
  height?: number;
  // Lebar grafik dalam satuan pixel
  isMobile?: boolean;
  // Fungsi yang bakal jalan pas tombol expand diklik
  onExpand?: () => void;
  // Penanda buat nampilin atau nyembunyiin kontrol zoom
  showZoomControls?: boolean;
  // Tambahan classname biar bisa dimodif dari luar komponen
  className?: string;
}

// Komponen buat ngebungkus grafik biar kelihatan rapi di dalem card
export default function ChartCard<T extends ChartType>({
  // Ambil tipe grafik dari props
  type,
  // Ambil judul dari props
  title,
  // Ambil data dari props
  data,
  // Ambil konfigurasi dari props
  options,
  // Ambil tinggi dengan default tiga ratus enam puluh
  height = 360,
  // Untuk mengecek ukuran screen
  isMobile,
  // Ambil fungsi expand dari props
  onExpand,
  // Ambil status kontrol zoom dari props
  showZoomControls,
  // Ambil classname tambahan dari props
  className,
}: ChartCardProps<T>) {
  // Ngembaliin elemen jsx buat nampilin grafik di dalem kontainer card
  return (
    // Div utama ngebungkus grafik pake cn biar bisa ngatur layout
    <div className={cn("flex flex-col relative", className)}>
      {/* Panggil komponen BaseChart buat ngerender grafik sebenernya */}
      <BaseChart
        // Masukin tipe grafik
        type={type}
        // Masukin judul grafik
        title={title}
        // Masukin data yang udah disiapin
        data={data}
        // Masukin opsi konfigurasi
        options={options}
        // Masukin tinggi grafik
        height={height}
        // Masukin fungsi panggil modal kalau ada
        onExpand={onExpand}
        // Masukin status tampil kontrol zoom
        showZoomControls={showZoomControls}
      />
    </div>
  );
}
