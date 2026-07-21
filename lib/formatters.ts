// Import item tooltip dari chart js
import { TooltipItem } from "chart.js";
// Import skala dan opsi dari chart js
import { Scale, CoreScaleOptions } from "chart.js";

// Fungsi buat format uang style Indonesia
export const formatNumberIndo = (value: string | number) => {
  // Set format desimal 0 sampe 3
  const formatIndo = { minimumFractionDigits: 0, maximumFractionDigits: 3 };
  // Balikin hasil lokalisasi
  return value.toLocaleString("id-ID", formatIndo);
};

// Fungsi buat nyingkat angka gede jadi Miliar, Juta, Ribu
export const formatBigNumber = function (
  // Konteks chart atau kosong
  this: Scale<CoreScaleOptions> | void | undefined,
  // Nilai yang mau diformat
  value: string | number,
): string {
  // Convert nilai ke number
  const numValue = Number(value);
  // Kalo bukan angka atau nol balikin teks mentah
  if (isNaN(numValue) || numValue === 0) return String(value);

  // Ambil nilai mutlak buat logika konversi ukuran uang
  const absValue = Math.abs(numValue);
  // Konfigurasi format desimal standard lokal Indonesia
  const formatIndo = { minimumFractionDigits: 0, maximumFractionDigits: 1 };

  // Kalo tembus Triliun kasih label T
  if (absValue >= 1_000_000_000_000) {
    return (
      (numValue / 1_000_000_000_000).toLocaleString("id-ID", formatIndo) + " T"
    );
  }
  // Kalo tembus Miliar kasih label M
  if (absValue >= 1_000_000_000) {
    return (
      (numValue / 1_000_000_000).toLocaleString("id-ID", formatIndo) + " M"
    );
  }
  // Kalo tembus Juta kasih label Jt
  if (absValue >= 1_000_000) {
    return (numValue / 1_000_000).toLocaleString("id-ID", formatIndo) + " Jt";
  }
  // Kalo tembus Ribu kasih label Ribu
  if (absValue >= 1_000) {
    return (numValue / 1_000).toLocaleString("id-ID", formatIndo) + " Rb";
  }

  // Balikin angka desimal normal kalo kecil banget
  return numValue.toLocaleString("id-ID", formatIndo);
};

export const formatIndex = (
  value: string | number,
): string => {
  const text = String(value);

  if (window.innerWidth <= 768) {
    return text.split(" ").slice(0, 2).join(" ") + "...";
  }

  return text;
};

// Fungsi buat format label di popup tooltip chart biar serasi sama ticks
export const formatTooltipLabel = (
  // Konteks chart
  context: TooltipItem<"bar" | "doughnut" | "pie" | "polarArea">,
): string | void => {
  // Cek apakah chart bentuk bulet
  const isCircularChart =
    context.parsed.x === undefined && context.parsed.y === undefined;

  // Wadah angka mentah
  let rawValue: number | null | undefined;

  // Ambil data buat chart bulet
  if (isCircularChart) {
    rawValue = typeof context.parsed === "number" ? context.parsed : undefined;
  } else {
    // Ambil data buat chart bar/line
    const isHorizontal = context.chart.options.indexAxis === "y";
    // Ambil koordinat sesuai arah chart
    rawValue = isHorizontal ? context.parsed.x : context.parsed.y;
  }

  // Kalo gada datanya balikin void kosong
  if (rawValue === null || rawValue === undefined) return;

  // Pastiin jadi number
  const numValue = Number(rawValue);
  // Ambil label dataset legendanya
  const label = isCircularChart
    ? context.label || ""
    : context.dataset.label || "";

  // Normalisasi data khusus performa persenan
  if (label.includes("(%)") || label === "Profit Margin") {
    return `${label}: ${numValue.toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`;
  }

  // Khusus untuk data non-persen, langsung tembak pake formatBigNumber biar seragam jutaan/miliaran
  const formattedValue = formatBigNumber(numValue);
  // Balikin teks tooltip terformat rapi
  return `${label}: ${formattedValue}`;
};
