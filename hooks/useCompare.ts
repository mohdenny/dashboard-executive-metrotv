import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchProgramsByRange } from "@/services/api/programService";
import { ChartData } from "chart.js";
import { ProgramFormData } from "@/schemas/program";

export function useCompare() {
  const { data: programs = [], isLoading } = useQuery({
    queryKey: ["programs"],
    queryFn: () => fetchProgramsByRange("", ""),
  });

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

  const progA = useMemo(
    () => programs.find((p: ProgramFormData) => p.id === progAId) || null,
    [programs, progAId],
  );
  const progB = useMemo(
    () => programs.find((p: ProgramFormData) => p.id === progBId) || null,
    [programs, progBId],
  );

  const pA = useMemo(() => {
    if (!progA?.periods?.length) return null;
    if (selectedPeriodA) {
      const found = progA.periods.find((p) => p.month === selectedPeriodA);
      if (found) return found;
      return {
        id: `empty-A`,
        month: selectedPeriodA,
        performanceTV: {
          targetTVR: 0,
          targetShare: 0,
          actualTVR: 0,
          actualShare: 0,
        },
        performanceDigital: { views: 0, revenue: 0 },
        financials: {
          costDirect: 0,
          revenueTarget: 0,
          revenueActual: 0,
          pnl: 0,
        },
        inventory: { spot: 0, adRate: 0 },
        status: "-",
      };
    }
    return [...progA.periods].sort((a, b) => b.month.localeCompare(a.month))[0];
  }, [progA, selectedPeriodA]);

  const pB = useMemo(() => {
    if (!progB?.periods?.length) return null;
    if (selectedPeriodB) {
      const found = progB.periods.find((p) => p.month === selectedPeriodB);
      if (found) return found;
      return {
        id: `empty-B`,
        month: selectedPeriodB,
        performanceTV: {
          targetTVR: 0,
          targetShare: 0,
          actualTVR: 0,
          actualShare: 0,
        },
        performanceDigital: { views: 0, revenue: 0 },
        financials: {
          costDirect: 0,
          revenueTarget: 0,
          revenueActual: 0,
          pnl: 0,
        },
        inventory: { spot: 0, adRate: 0 },
        status: "-",
      };
    }
    return [...progB.periods].sort((a, b) => b.month.localeCompare(a.month))[0];
  }, [progB, selectedPeriodB]);

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

  const handleSwap = () => {
    if (!progAId && !progBId) return;

    const currentA = progAId;
    const currentB = progBId;
    const currentPerA = selectedPeriodA;
    const currentPerB = selectedPeriodB;

    setProgAId(currentB);
    setProgBId(currentA);
    setSelectedPeriodA(currentPerB);
    setSelectedPeriodB(currentPerA);
  };

  const getCardStyle = (valA: number, valB: number) => {
    if (valA > valB) return "bg-[#1f77b4]/10 border-[#1f77b4]/30";
    if (valB > valA) return "bg-[#ff7f0e]/10 border-[#ff7f0e]/30";
    return "bg-card border-border";
  };

  const getWinnerTextColor = (valA: number, valB: number) => {
    if (valA > valB) return "text-[#1f77b4]";
    if (valB > valA) return "text-[#ff7f0e]";
    return "text-foreground";
  };

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
        {
          label: progA.name,
          data: [
            pA?.financials?.revenueTarget ?? 0,
            pA?.financials?.revenueActual ?? 0,
            pA?.performanceDigital?.revenue ?? 0,
            pA?.financials?.costDirect ?? 0,
            pA?.financials?.pnl ?? 0,
          ],
          backgroundColor: "#1f77b4",
          minBarLength: 15,
        },
        {
          label: progB.name,
          data: [
            pB?.financials?.revenueTarget ?? 0,
            pB?.financials?.revenueActual ?? 0,
            pB?.performanceDigital?.revenue ?? 0,
            pB?.financials?.costDirect ?? 0,
            pB?.financials?.pnl ?? 0,
          ],
          backgroundColor: "#ff7f0e",
          minBarLength: 15,
        },
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
