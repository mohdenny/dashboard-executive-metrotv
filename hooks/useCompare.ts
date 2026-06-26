import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchProgramsByRange } from "@/services/api/programService";
import { ChartData } from "chart.js";
import { ProgramFormData } from "@/schemas/program";
import { createBarDataset } from "@/lib/chartHelpers";

// Bikin dummy periode pas kosong biar rapi
const emptyPeriod = (month: string) => ({
  id: `empty-${month}`,
  month,
  performanceTV: { targetTVR: 0, targetShare: 0, actualTVR: 0, actualShare: 0 },
  performanceDigital: { views: 0, revenue: 0 },
  financials: { costDirect: 0, revenueTarget: 0, revenueActual: 0, pnl: 0 },
  inventory: { spot: 0, adRate: 0 },
  status: "-",
});

export function useCompare() {
  // Ambil data program dari api pake usequery
  const { data: programs = [], isLoading } = useQuery({
    queryKey: ["programs"],
    queryFn: () => fetchProgramsByRange("", ""),
  });

  // Bikin state buat nyimpen id program yang dipilih user
  const [progAId, setProgAId] = useState<string>("");
  const [progBId, setProgBId] = useState<string>("");
  const [selectedPeriodA, setSelectedPeriodA] = useState<string>("");
  const [selectedPeriodB, setSelectedPeriodB] = useState<string>("");

  const periodOptions = useMemo(() => {
    const all = programs.flatMap(
      (p: ProgramFormData) => p.periods?.map((x) => x.month) || [],
    );
    return Array.from(new Set(all)).sort().reverse();
  }, [programs]);

  // Pake usememo biar pencarian objek program ga dirender ulang terus
  const progA = useMemo(
    () => programs.find((p: ProgramFormData) => p.id === progAId) || null,
    [programs, progAId],
  );
  const progB = useMemo(
    () => programs.find((p: ProgramFormData) => p.id === progBId) || null,
    [programs, progBId],
  );

  // Cari periode terkini buat masing masing program
  const pA = useMemo(() => {
    if (!progA?.periods?.length) return null;
    if (selectedPeriodA)
      return (
        progA.periods.find((p) => p.month === selectedPeriodA) ||
        emptyPeriod(selectedPeriodA)
      );
    return [...progA.periods].sort((a, b) => b.month.localeCompare(a.month))[0];
  }, [progA, selectedPeriodA]);

  const pB = useMemo(() => {
    if (!progB?.periods?.length) return null;
    if (selectedPeriodB)
      return (
        progB.periods.find((p) => p.month === selectedPeriodB) ||
        emptyPeriod(selectedPeriodB)
      );
    return [...progB.periods].sort((a, b) => b.month.localeCompare(a.month))[0];
  }, [progB, selectedPeriodB]);

  // Kalkulasi roi
  const totalRevA = pA
    ? (pA.financials?.revenueActual ?? 0) +
      (pA.performanceDigital?.revenue ?? 0)
    : 0;
  const roiA = pA
    ? ((totalRevA - (pA.financials?.costDirect ?? 0)) /
        ((pA.financials?.costDirect ?? 0) || 1)) *
      100
    : 0;

  const totalRevB = pB
    ? (pB.financials?.revenueActual ?? 0) +
      (pB.performanceDigital?.revenue ?? 0)
    : 0;
  const roiB = pB
    ? ((totalRevB - (pB.financials?.costDirect ?? 0)) /
        ((pB.financials?.costDirect ?? 0) || 1)) *
      100
    : 0;

  // Fungsi buat nuker posisi program pas tombol swap diklik
  const handleSwap = () => {
    if (!progAId && !progBId) return;
    const [currentA, currentB, currentPerA, currentPerB] = [
      progAId,
      progBId,
      selectedPeriodA,
      selectedPeriodB,
    ];
    setProgAId(currentB);
    setProgBId(currentA);
    setSelectedPeriodA(currentPerB);
    setSelectedPeriodB(currentPerA);
  };

  // Helper buat ngatur warna background card
  const getCardStyle = (valA: number, valB: number) => {
    if (valA > valB) return "bg-[#1f77b4]/10 border-[#1f77b4]/30";
    if (valB > valA) return "bg-[#ff7f0e]/10 border-[#ff7f0e]/30";
    return "bg-card border-border";
  };

  // Helper buat ngatur warna teks tulisan pemenang
  const getWinnerTextColor = (valA: number, valB: number) => {
    if (valA > valB) return "text-[#1f77b4]";
    if (valB > valA) return "text-[#ff7f0e]";
    return "text-foreground";
  };

  // Bikin struktur data buat grouped bar chart nampilin komparasi
  const comparisonData = useMemo<ChartData<"bar">>(() => {
    if (!progA || !progB) return { labels: [], datasets: [] };

    return {
      labels: [
        "Target Revenue",
        "Actual TV Rev",
        "Digital Rev",
        "Cost Direct",
        "Net PNL",
      ],
      datasets: [
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
