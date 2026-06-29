// Import item tooltip dari chart js
import { TooltipItem } from "chart.js";
// Import skala dan opsi dari chart js
import { Scale, CoreScaleOptions } from "chart.js";

// Fungsi buat format uang gaya Indonesia
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
): string | number | string[] {
  // Simpen nilai biar aman
  const targetValue = value;

  // Cek konteks chart buat label kategori
  if (
    this &&
    typeof this === "object" &&
    "type" in this &&
    this.type === "category"
  ) {
    // Ambil label dari index
    const label = this.getLabelForValue(Number(targetValue));
    // Balikin label kalo ada
    if (label !== undefined && label !== null) {
      // Baliki huruf aslinya
      return label.length > 12 ? `${label.substring(0, 11)}..`: label;
      // return label;
    }
  }

  // Convert nilai ke number
  const numValue = Number(targetValue);
  // Kalo bukan angka balik mentah
  if (isNaN(numValue)) return targetValue;

  // Ambil nilai mutlak buat logika konversi
  const absValue = Math.abs(numValue);

  // Setingan koma gaya Indonesia, otomatis ngilangin nol mubazir (misal: 1,50 jadi 1,5)
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
    return (numValue / 1_000).toLocaleString("id-ID", formatIndo) + " Ribu";
  }

  // Balikin angka biasa kalo kecil
  return numValue.toLocaleString("id-ID");
};

// Fungsi buat format label di popup tooltip chart
export const formatTooltipLabel = (
  // Konteks chart
  context: TooltipItem<"bar" | "doughnut" | "pie" | "polarArea">,
): string | void => {
  // Cek apakah chart bentuk bulat
  const isCircularChart =
    context.parsed.x === undefined && context.parsed.y === undefined;

  // Wadah angka mentah
  let rawValue: number | null | undefined;

  // Ambil data buat chart bulat
  if (isCircularChart) {
    rawValue = typeof context.parsed === "number" ? context.parsed : undefined;
  } else {
    // Ambil data buat chart bar/line
    const isHorizontal = context.chart.options.indexAxis === "y";
    // Ambil koordinat sesuai arah chart
    rawValue = isHorizontal ? context.parsed.x : context.parsed.y;
  }

  // Kalo gada datanya balikin void
  if (rawValue === null || rawValue === undefined) return;

  // Pastiin jadi number
  let numValue = Number(rawValue);

  // Ambil label dataset
  const label = isCircularChart
    ? context.label || ""
    : context.dataset.label || "";

  // Normalisasi data khusus performa
  if (label === "Performa Kinerja (%)") {
    numValue = numValue / 2_000_000;
  }

  // Ambil nilai mutlak
  const absValue = Math.abs(numValue);
  // Wadah string hasil format
  let formattedValue: string;

  // Format angka gede buat tooltip
  if (!label.includes("(%)") && absValue >= 1_000_000_000) {
    formattedValue =
      (numValue / 1_000_000_000).toFixed(1).replace(".0", "") + " Miliar";
  } else if (!label.includes("(%)") && absValue >= 1_000_000) {
    formattedValue =
      (numValue / 1_000_000).toFixed(1).replace(".0", "") + " Juta";
  } else if (!label.includes("(%)") && absValue >= 1_000) {
    formattedValue = (numValue / 1_000).toFixed(1).replace(".0", "") + " Ribu";
  } else {
    // Format persen atau biasa
    formattedValue = label.includes("(%)")
      ? `${numValue.toFixed(1).replace(".0", "")}%`
      : String(numValue);
  }

  // Balikin teks tooltip
  return `${label}: ${formattedValue}`;
};
