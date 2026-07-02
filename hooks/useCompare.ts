// Import hook state buat kelola data lokal
import {
  useState,
  // Import hook memo buat efisiensi hitungan
  useMemo,
} from "react";
// Import hook query dari tanstack buat manage data server
import { useQuery } from "@tanstack/react-query";
// Import fungsi api buat ambil data program
import { fetchProgramsByRange } from "@/services/api/programService";
// Import tipe data chart js
import { ChartData } from "chart.js";
// Import skema tipe data program
import { ProgramFormData } from "@/schemas/program";
// Import fungsi helper buat bikin dataset bar
import { createBarDataset } from "@/lib/chartHelpers";

// Fungsi buat bikin objek periode kosong biar aplikasi ga crash pas data gada
const emptyPeriod = (
  // Bulan periode
  month: string,
) => ({
  // Id unik pake tanda empty
  id: `empty-${month}`,
  // Bulan periode
  month,
  // Performa tv default nol
  performanceTV: { targetTVR: 0, targetShare: 0, actualTVR: 0, actualShare: 0 },
  // Performa digital default nol
  performanceDigital: { views: 0, revenue: 0 },
  // Finansial default nol
  financials: { costDirect: 0, revenueTarget: 0, revenueActual: 0, pnl: 0 },
  // Inventori default nol
  inventory: { spot: 0, adRate: 0 },
  // Status default strip
  status: "-",
});

// Hook buat handle logic bandingin dua program
export function useCompare() {
  // Ambil data program dari api pake usequery
  const {
    // Data program dari api
    data: programs = [],
    // Status loading
    isLoading,
  } = useQuery({
    // Key cache
    queryKey: ["programs"],
    // Fungsi panggil api
    queryFn: () => fetchProgramsByRange("", ""),
  });

  // State buat nyimpen id program pertama
  const [progAId, setProgAId] = useState<string>("");
  // State buat nyimpen id program kedua
  const [progBId, setProgBId] = useState<string>("");
  // State buat nyimpen periode program pertama
  const [selectedPeriodA, setSelectedPeriodA] = useState<string>("");
  // State buat nyimpen periode program kedua
  const [selectedPeriodB, setSelectedPeriodB] = useState<string>("");

  // Memo buat daftar semua opsi periode yang ada
  const periodOptions = useMemo(() => {
    // Bongkar semua bulan dari semua program
    const all = programs.flatMap(
      (p: ProgramFormData) => p.periods?.map((x) => x.month) || [],
    );
    // Hapus duplikat terus urutin dari yang terbaru
    return Array.from(new Set(all)).sort().reverse();
  }, [programs]);

  // Cari objek program pertama berdasarkan id
  const progA = useMemo(
    // Cari program yang match sama progAId
    () => programs.find((p: ProgramFormData) => p.id === progAId) || null,
    // Dependency list
    [programs, progAId],
  );
  // Cari objek program kedua berdasarkan id
  const progB = useMemo(
    // Cari program yang match sama progBId
    () => programs.find((p: ProgramFormData) => p.id === progBId) || null,
    // Dependency list
    [programs, progBId],
  );

  // Ambil data periode aktif program pertama
  const pA = useMemo(() => {
    // Kalo program gada periode balikin null
    if (!progA?.periods?.length) return null;
    // Kalo user milih periode cari di array periode
    if (selectedPeriodA)
      return (
        progA.periods.find((p) => p.month === selectedPeriodA) ||
        emptyPeriod(selectedPeriodA)
      );
    // Default ambil yang paling baru
    return [...progA.periods].sort((a, b) => b.month.localeCompare(a.month))[0];
  }, [progA, selectedPeriodA]);

  // Ambil data periode aktif program kedua
  const pB = useMemo(() => {
    // Kalo program gada periode balikin null
    if (!progB?.periods?.length) return null;
    // Kalo user milih periode cari di array periode
    if (selectedPeriodB)
      return (
        progB.periods.find((p) => p.month === selectedPeriodB) ||
        emptyPeriod(selectedPeriodB)
      );
    // Default ambil yang paling baru
    return [...progB.periods].sort((a, b) => b.month.localeCompare(a.month))[0];
  }, [progB, selectedPeriodB]);

  // Hitung total revenue program pertama
  const totalRevA = pA
    ? (pA.financials?.revenueActual ?? 0) +
      (pA.performanceDigital?.revenue ?? 0)
    : 0;
  // Hitung roi program pertama
  const roiA = pA
    ? ((totalRevA - (pA.financials?.costDirect ?? 0)) /
        ((pA.financials?.costDirect ?? 0) || 1)) *
      100
    : 0;

  // Hitung total revenue program kedua
  const totalRevB = pB
    ? (pB.financials?.revenueActual ?? 0) +
      (pB.performanceDigital?.revenue ?? 0)
    : 0;
  // Hitung roi program kedua
  const roiB = pB
    ? ((totalRevB - (pB.financials?.costDirect ?? 0)) /
        ((pB.financials?.costDirect ?? 0) || 1)) *
      100
    : 0;

  // Fungsi buat swap posisi program dan periodenya
  const handleSwap = () => {
    // Kalo duanya kosong balikin
    if (!progAId && !progBId) return;
    // Deklarasi temp swap
    const [currentA, currentB, currentPerA, currentPerB] = [
      progAId,
      progBId,
      selectedPeriodA,
      selectedPeriodB,
    ];
    // Set program a ke b
    setProgAId(currentB);
    // Set program b ke a
    setProgBId(currentA);
    // Set periode a ke b
    setSelectedPeriodA(currentPerB);
    // Set periode b ke a
    setSelectedPeriodB(currentPerA);
  };

  // Fungsi buat atur style card pemenang
  const getCardStyle = (
    // Nilai A
    valA: number,
    // Nilai B
    valB: number,
  ) => {
    // Kalo a lebih gede kasih warna biru
    if (valA > valB) return "bg-[#1f77b4]/10 border-[#1f77b4]/30";
    // Kalo b lebih gede kasih warna oren
    if (valB > valA) return "bg-[#ff7f0e]/10 border-[#ff7f0e]/30";
    // Default style
    return "bg-card border-border";
  };

  // Fungsi buat atur warna teks pemenang
  const getWinnerTextColor = (
    // Nilai A
    valA: number,
    // Nilai B
    valB: number,
  ) => {
    // Kalo a menang teks biru
    if (valA > valB) return "text-[#1f77b4]";
    // Kalo b menang teks oren
    if (valB > valA) return "text-[#ff7f0e]";
    // Default teks
    return "text-foreground";
  };

  // Memo buat susun data chart perbandingan
  const comparisonData = useMemo<ChartData<"bar">>(() => {
    // Kalo program gada balikin objek data kosong
    if (!progA || !progB) return { labels: [], datasets: [] };

    // Balikin objek data buat bar chart
    return {
      // Label sumbu x
      labels: [
        "Target Revenue",
        "Capaian TV Rev",
        "Digital Rev",
        "Cost Direct",
        "Net PNL",
      ],
      // Dataset buat perbandingan
      datasets: [
        // Dataset program pertama
        createBarDataset(
          progA.name,
          [
            pA?.financials?.revenueTarget ?? 0,
            pA?.financials?.revenueActual ?? 0,
            pA?.performanceDigital?.revenue ?? 0,
            pA?.financials?.costDirect ?? 0,
            pA?.financials?.pnl ?? 0,
          ],
          "#1f77b4",
        ),
        // Dataset program kedua
        createBarDataset(
          progB.name,
          [
            pB?.financials?.revenueTarget ?? 0,
            pB?.financials?.revenueActual ?? 0,
            pB?.performanceDigital?.revenue ?? 0,
            pB?.financials?.costDirect ?? 0,
            pB?.financials?.pnl ?? 0,
          ],
          "#ff7f0e",
        ),
      ],
    };
  }, [progA, progB, pA, pB]);

  // Return data dan fungsi buat dipake ui
  return {
    programs,
    isLoading,
    progAId,
    setProgAId,
    progBId,
    setProgBId,
    progA,
    progB,
    pA,
    pB,
    roiA,
    roiB,
    selectedPeriodA,
    setSelectedPeriodA,
    selectedPeriodB,
    setSelectedPeriodB,
    periodOptions,
    handleSwap,
    getCardStyle,
    getWinnerTextColor,
    comparisonData,
  };
}
