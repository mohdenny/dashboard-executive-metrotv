import { TooltipItem } from "chart.js";
import { Scale, CoreScaleOptions } from "chart.js";

// Fungsi helper buat nyingkat angka gede misalnya Miliar, Juta, Ribu
export const formatBigNumber = function (
  // Diubah ke tipe gabungan agar bisa menerima konteks dari Chart.js maupun context kosong (void/undefined) dari komponen
  this: Scale<CoreScaleOptions> | void | undefined,
  value: string | number,
): string | number | string[] {
  // Bikin variabel penampung biar fleksibel pas dioper 1 angka dari luar
  const targetValue = value;

  // Kalo "this" chartnya ada dan tipenya "category"
  // Ditambah pengecekan tipe objek (duck typing) biar aman dari void/undefined sebelum baca properti internal
  if (
    this &&
    typeof this === "object" &&
    "type" in this &&
    this.type === "category"
  ) {
    // Ambil label teks asli berdasarkan index yang dikirim oleh Chart.js
    const label = this.getLabelForValue(Number(targetValue));
    if (label !== undefined && label !== null) {
      // Balikim huruf aslinya
      return label;
    }
  }

  const numValue = Number(targetValue);
  if (isNaN(numValue)) return targetValue;

  // Pake Math.abs biar angka yang minus jadi positif
  // Cuma buat logika dibawah aja
  const absValue = Math.abs(numValue);

  // Setingan koma gaya Indonesia, otomatis ngilangin nol mubazir (misal: 1,50 jadi 1,5)
  const formatIndo = { minimumFractionDigits: 0, maximumFractionDigits: 3 };

  // Kalo angka tembus 1 Triliun (Biar gak rancu nyebut jutaan miliar)
  if (absValue >= 1_000_000_000_000) {
    // Bagi angkanya terus tempelin tulisan Triliun di buntutnya, pake format koma Indo
    return (
      (numValue / 1_000_000_000_000).toLocaleString("id-ID", formatIndo) + " T"
    );
  }
  // Kalo angka tembus 1 Miliar
  if (absValue >= 1_000_000_000) {
    //  Bagi angkanya terus tempelem tulisan Miliar di buntutnya, kaya 1 Miliar
    return (
      (numValue / 1_000_000_000).toLocaleString("id-ID", formatIndo) + " M"
    );
  }
  if (absValue >= 1_000_000) {
    return (numValue / 1_000_000).toLocaleString("id-ID", formatIndo) + " Jt";
  }
  if (absValue >= 1_000) {
    return (numValue / 1_000).toLocaleString("id-ID", formatIndo) + " Ribu";
  }

  // Kalo cuma angka kecil atau angka 0, kasih format titik pemisah ribuan standar Indonesia (id-ID)
  return numValue.toLocaleString("id-ID");
};

// Fungsi buat format angka di tooltip
export const formatTooltipLabel = (
  context: TooltipItem<"bar" | "doughnut" | "pie" | "polarArea">,
): string | void => {
  // Buat ngecek chartnya bulet (pie/donat) ga punya koordinat x/y di objek parsednya
  const isCircularChart =
    context.parsed.x === undefined && context.parsed.y === undefined;

  // Wadah kosong buat nanti nampung angka mentah dari chart
  let rawValue: number | null | undefined;

  // Kalo kebukti chartnya bulet, langsung ambil angkanya dari properti parsed
  if (isCircularChart) {
    // Pastiin tipe datanya emang angka valid sebelon dimasukin ke wadah biar ga error
    rawValue = typeof context.parsed === "number" ? context.parsed : undefined;
  } else {
    // Kalo chartnya bar/line, cek dulu arahnya horizontal (rebahan) atau vertikal (dengak)
    const isHorizontal = context.chart.options.indexAxis === "y";
    // Kalo horizontal ambil angka dari sumbu X, kalo vertikal ambil angka dari sumbu Y
    rawValue = isHorizontal ? context.parsed.x : context.parsed.y;
  }

  // Jaga2 kalo datanya kosong atau null, biar tooltip kosongnya ga nongol pas cursonya di area
  if (rawValue === null || rawValue === undefined) return;

  // Konversi nilanya jadi number
  // Paksa nilainya jadi tipe data Number biar aman pas diitung
  let numValue = Number(rawValue);

  // Cari tau teks labelnya, kalo donat ambil labelnya, kalo bar/line ambil nama kelompok label si datasetnya
  const label = isCircularChart
    ? context.label || ""
    : context.dataset.label || "";

  // Khusus buat dataset performa kinerja yang angkanya udah dikali 2 juta pas di props, kembatolin lagi biar normal
  if (label === "Performa Kinerja (%)") {
    numValue = numValue / 2_000_000;
  }

  // Pake Math.abs buat mutlakin angka negatif jadi positif sementara biar bisa lolos filter if-else di bawah
  const absValue = Math.abs(numValue);
  // Siapin wadah variabel string buat nampung teks hasil konversi angka yang udah rapi
  let formattedValue: string;

  // Kalo angkanya tembus 1 Miliar atau lebih yang bukan data performa, bagi angkanya trus tempelin teks "Miliar" di buntutnya
  if (!label.includes("(%)") && absValue >= 1_000_000_000) {
    formattedValue =
      (numValue / 1_000_000_000).toFixed(1).replace(".0", "") + " Miliar";
  } else if (!label.includes("(%)") && absValue >= 1_000_000) {
    // Kalo masuk direntang jutaan yang bukan data performa, bagi angkanya trus tempelin teks "Juta" di buntutnya
    formattedValue =
      (numValue / 1_000_000).toFixed(1).replace(".0", "") + " Juta";
  } else if (!label.includes("(%)") && absValue >= 1_000) {
    // Kalo masuk direntang ribuan yang bukan data performa, bagi angkanya trus tempelin teks "Ribu" di buntutnya
    formattedValue = (numValue / 1_000).toFixed(1).replace(".0", "") + " Ribu";
  } else {
    // Kalo angka kecil/nol, balikin mentah2
    // Tapi kalo kebukti data performa, tempel persen % di buntutnya
    formattedValue = label.includes("(%)")
      ? `${numValue.toFixed(1).replace(".0", "")}%`
      : String(numValue);
  }

  // Gabungin nama label sama hasil angka yang udah rapi tadi buat dipajang di dalem popup tooltip
  return `${label}: ${formattedValue}`;
};
