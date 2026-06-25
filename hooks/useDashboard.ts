import { useMemo, useState } from "react";
import { MOCK_PROGRAMS } from "@/constants/programMockData";
import { ChartData } from "chart.js";
import { formatBigNumber } from "@/lib/formatters";

export default function useDashboard() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<string | null>("all");
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(
    null,
  );
  const [startMonth, setStartMonth] = useState<string>("");
  const [endMonth, setEndMonth] = useState<string>("");

  const periodOptions = [
    { label: "All Time", value: "all" },
    { label: "YTD", value: "ytd" },
    { label: "MTD", value: "mtd" },
    { label: "Custom", value: "custom" },
  ];

  const lastUpdated = useMemo(() => {
    let latest = "";
    MOCK_PROGRAMS.forEach((p) => {
      p.periods?.forEach((per) => {
        if (per.month && per.month > latest) latest = per.month;
      });
    });
    return latest || "-";
  }, []);

  const activePeriodDisplay = useMemo(() => {
    if (selectedPeriod === "custom") {
      if (startMonth && endMonth) return `${startMonth} s/d ${endMonth}`;
      if (startMonth) return `Mulai ${startMonth}`;
      return "Custom Periode";
    }
    if (selectedPeriod === "mtd") return new Date().toISOString().slice(0, 7);
    if (selectedPeriod === "ytd")
      return `2026-01 s/d ${new Date().toISOString().slice(0, 7)}`;
    return `Seluruh Periode (Update: ${lastUpdated})`;
  }, [selectedPeriod, startMonth, endMonth, lastUpdated]);

  const programCategories = useMemo(() => {
    return MOCK_PROGRAMS.reduce((acc, curr) => {
      if (!acc.includes(curr.category)) {
        acc.push(curr.category);
      }
      return acc;
    }, [] as string[]);
  }, []);

  const filteredPrograms = useMemo(() => {
    let result = [...MOCK_PROGRAMS];

    if (selectedPeriod === "custom") {
      if (startMonth) {
        result = result.filter((p) =>
          p.periods.some((per) => per.month >= startMonth),
        );
      }
      if (endMonth) {
        result = result.filter((p) =>
          p.periods.some((per) => per.month <= endMonth),
        );
      }
    } else if (selectedPeriod && selectedPeriod !== "all") {
      const today = new Date();
      const currentYear = today.getFullYear();
      const currentMonthStr = `${currentYear}-${String(today.getMonth() + 1).padStart(2, "0")}`;
      const firstMonthOfYear = `${currentYear}-01`;

      let minMonth = "";
      if (selectedPeriod === "ytd") minMonth = firstMonthOfYear;
      else if (selectedPeriod === "mtd") minMonth = currentMonthStr;

      result = result.filter((p) =>
        p.periods.some(
          (per) => per.month >= minMonth && per.month <= currentMonthStr,
        ),
      );
    }

    if (!selectedCategory) return result;
    return result.filter((p) => p.category === selectedCategory);
  }, [selectedCategory, startMonth, endMonth, selectedPeriod]);

  const totalKPI = useMemo(() => {
    const totals = filteredPrograms.reduce(
      (acc, curr) => {
        acc.revenue += curr.periods.reduce(
          (s, per) =>
            s +
            per.financials.revenueActual +
            (per.performanceDigital.revenue || 0),
          0,
        );
        acc.cost += curr.periods.reduce(
          (s, per) => s + per.financials.costDirect,
          0,
        );
        acc.pnl += curr.periods.reduce((s, per) => s + per.financials.pnl, 0);
        return acc;
      },
      { revenue: 0, cost: 0, pnl: 0 },
    );

    const safeDiv = (num: number, denom: number) =>
      denom !== 0 ? num / denom : 0;

    const formatPct = (val: number) => val.toFixed(0).replace(".", ",");

    const profitMarginPct = safeDiv(totals.pnl, totals.revenue) * 100;

    const topContributor =
      filteredPrograms.length > 0
        ? [...filteredPrograms].sort(
            (a, b) =>
              b.periods.reduce((s, per) => s + per.financials.pnl, 0) -
              a.periods.reduce((s, per) => s + per.financials.pnl, 0),
          )[0]
        : null;

    return {
      totals,
      cards: [
        {
          title: "Total Revenue",
          value: `Rp ${formatBigNumber(totals.revenue)}`,
          isPositive: totals.revenue > 0,
          label: "Pendapatan",
        },
        {
          title: "Net Profit",
          value: `Rp ${formatBigNumber(totals.pnl)}`,
          isPositive: totals.pnl >= 0,
          label: totals.pnl >= 0 ? "Profit Bersih" : "Rugi Bersih",
        },
        {
          title: "Profit Margin",
          value: `${formatPct(profitMarginPct)}%`,
          isPositive: profitMarginPct >= 0,
          label: profitMarginPct >= 0 ? "Margin Sehat" : "Margin Negatif",
        },
        {
          title: "Top Contributor Program",
          value: topContributor?.name || "-",
          isPositive:
            (topContributor
              ? topContributor.periods.reduce(
                  (s, per) => s + per.financials.pnl,
                  0,
                )
              : 0) >= 0,
          label: topContributor
            ? `Rp ${formatBigNumber(topContributor.periods.reduce((s, per) => s + per.financials.pnl, 0))}`
            : "-",
        },
      ],
    };
  }, [filteredPrograms]);

  const activeProgramId = useMemo(() => {
    if (
      selectedProgramId &&
      filteredPrograms.some((p) => p.id === selectedProgramId)
    ) {
      return selectedProgramId;
    }
    return filteredPrograms.length > 0 ? filteredPrograms[0].id : "";
  }, [filteredPrograms, selectedProgramId]);

  const allProgramData = useMemo<ChartData<"bar">>(() => {
    const grouped = MOCK_PROGRAMS.reduce(
      (acc, curr) => {
        if (!acc[curr.category]) acc[curr.category] = 0;
        acc[curr.category] += curr.periods.reduce(
          (s, per) => s + per.financials.pnl,
          0,
        );
        return acc;
      },
      {} as Record<string, number>,
    );

    const labels = Object.keys(grouped);
    const data = Object.values(grouped);
    const bgColors = labels.map((label, index) => {
      const colors = [
        "#1f77b4",
        "#ff7f0e",
        "#2ca02c",
        "#d62728",
        "#9467bd",
        "#8c564b",
        "#e377c2",
        "#7f7f7f",
        "#bcbd22",
        "#17becf",
      ];
      const baseColor = colors[index % colors.length];
      return !selectedCategory || label === selectedCategory
        ? baseColor
        : baseColor + "26";
    });

    return {
      labels,
      datasets: [
        {
          label: "Total PNL (Rp)",
          data,
          backgroundColor: bgColors,
          minBarLength: 15,
        },
      ],
    };
  }, [selectedCategory]);

  const detailProgramData = useMemo<ChartData<"doughnut">>(() => {
    const prog =
      MOCK_PROGRAMS.find((p) => p.id === activeProgramId) || MOCK_PROGRAMS[0];

    if (!prog) return { labels: [], datasets: [] };

    return {
      labels: ["Revenue Capaian", "Cost Direct", "Target Revenue"],
      datasets: [
        {
          data: [
            prog.periods.reduce(
              (s, per) =>
                s +
                per.financials.revenueActual +
                (per.performanceDigital.revenue || 0),
              0,
            ),
            prog.periods.reduce((s, per) => s + per.financials.costDirect, 0),
            prog.periods.reduce(
              (s, per) => s + per.financials.revenueTarget,
              0,
            ),
          ],
        },
      ],
    };
  }, [activeProgramId]);

  const topPnlData = useMemo<ChartData<"bar">>(() => {
    const sorted = [...filteredPrograms]
      .sort(
        (a, b) =>
          b.periods.reduce((s, per) => s + per.financials.pnl, 0) -
          a.periods.reduce((s, per) => s + per.financials.pnl, 0),
      )
      .slice(0, 5);

    return {
      labels: sorted.map((p) => p.name),
      datasets: [
        {
          label: "Positif (Rp)",
          data: sorted.map((p) =>
            p.periods.reduce((s, per) => s + per.financials.pnl, 0),
          ),
          minBarLength: 15,
        },
      ],
    };
  }, [filteredPrograms]);

  const bottomPnlData = useMemo<ChartData<"bar">>(() => {
    const sorted = [...filteredPrograms]
      .sort(
        (a, b) =>
          a.periods.reduce((s, per) => s + per.financials.pnl, 0) -
          b.periods.reduce((s, per) => s + per.financials.pnl, 0),
      )
      .slice(0, 5);

    return {
      labels: sorted.map((p) => p.name),
      datasets: [
        {
          label: "Minus (Rp)",
          data: sorted.map((p) => {
            const pnl = p.periods.reduce((s, per) => s + per.financials.pnl, 0);
            return pnl < 0 ? pnl : null;
          }),
          backgroundColor: "#ff0000",
          minBarLength: 15,
        },
        {
          label: "Terendah (Rp)",
          data: sorted.map((p) => {
            const pnl = p.periods.reduce((s, per) => s + per.financials.pnl, 0);
            return pnl >= 0 ? pnl : null;
          }),
          minBarLength: 15,
        },
      ],
    };
  }, [filteredPrograms]);

  const topRevenueDigitalData = useMemo<ChartData<"bar">>(() => {
    const sorted = [...filteredPrograms]
      .sort(
        (a, b) =>
          b.periods.reduce((s, per) => s + per.performanceDigital.revenue, 0) -
          a.periods.reduce((s, per) => s + per.performanceDigital.revenue, 0),
      )
      .slice(0, 5);

    return {
      labels: sorted.map((p) => p.name),
      datasets: [
        {
          label: "Revenue (Rp)",
          data: sorted.map((p) =>
            p.periods.reduce((s, per) => s + per.performanceDigital.revenue, 0),
          ),
          minBarLength: 15,
        },
        {
          label: "Views",
          data: sorted.map((p) =>
            p.periods.reduce((s, per) => s + per.performanceDigital.views, 0),
          ),
          backgroundColor: "#9467bd",
          minBarLength: 15,
        },
      ],
    };
  }, [filteredPrograms]);

  const bottomRevenueDigitalData = useMemo<ChartData<"bar">>(() => {
    const sorted = [...filteredPrograms]
      .sort(
        (a, b) =>
          a.periods.reduce((s, per) => s + per.performanceDigital.revenue, 0) -
          b.periods.reduce((s, per) => s + per.performanceDigital.revenue, 0),
      )
      .slice(0, 5);

    return {
      labels: sorted.map((p) => p.name),
      datasets: [
        {
          label: "Revenue (Rp)",
          data: sorted.map((p) =>
            p.periods.reduce((s, per) => s + per.performanceDigital.revenue, 0),
          ),
          minBarLength: 15,
        },
        {
          label: "Views",
          data: sorted.map((p) =>
            p.periods.reduce((s, per) => s + per.performanceDigital.views, 0),
          ),
          backgroundColor: "#9467bd",
          minBarLength: 15,
        },
      ],
    };
  }, [filteredPrograms]);

  const comboTargetActualData = useMemo<ChartData<"bar">>(() => {
    return {
      labels: filteredPrograms.map((p) => p.name),
      datasets: [
        {
          type: "bar",
          label: "Target Revenue (Rp)",
          data: filteredPrograms.map((p) =>
            p.periods.reduce((s, per) => s + per.financials.revenueTarget, 0),
          ),
          minBarLength: 15,
        },
        {
          type: "bar",
          label: "Actual Revenue (Rp)",
          data: filteredPrograms.map((p) =>
            p.periods.reduce((s, per) => s + per.financials.revenueActual, 0),
          ),
          minBarLength: 15,
        },
      ],
    };
  }, [filteredPrograms]);

  const tvPerformanceData = useMemo<ChartData<"bar">>(() => {
    return {
      labels: filteredPrograms.map((p) => p.name),
      datasets: [
        {
          label: "Pencapaian TVR (%)",
          data: filteredPrograms.map((p) => {
            const targetTVR = p.periods.reduce(
              (s, per) => s + per.performanceTV.targetTVR,
              0,
            );
            const capaianTVR = p.periods.reduce(
              (s, per) => s + per.performanceTV.actualTVR,
              0,
            );
            return targetTVR ? (capaianTVR / targetTVR) * 100 : 0;
          }),
          backgroundColor: "#1f77b4",
          minBarLength: 15,
        },
        {
          label: "Pencapaian Share (%)",
          data: filteredPrograms.map((p) => {
            const targetShare = p.periods.reduce(
              (s, per) => s + per.performanceTV.targetShare,
              0,
            );
            const capaianShare = p.periods.reduce(
              (s, per) => s + per.performanceTV.actualShare,
              0,
            );
            return targetShare ? (capaianShare / targetShare) * 100 : 0;
          }),
          backgroundColor: "#ff7f0e",
          minBarLength: 15,
        },
      ],
    };
  }, [filteredPrograms]);

  return {
    selectedProgramId,
    setSelectedProgramId,
    selectedCategory,
    setSelectedCategory,
    startMonth,
    setStartMonth,
    endMonth,
    setEndMonth,
    activeProgramId,
    allProgramData,
    detailProgramData,
    topPnlData,
    bottomPnlData,
    filteredPrograms,
    comboTargetActualData,
    totalKPI,
    topRevenueDigitalData,
    bottomRevenueDigitalData,
    tvPerformanceData,
    programCategories,
    selectedPeriod,
    setSelectedPeriod,
    periodOptions,
    lastUpdated,
    activePeriodDisplay,
  };
}
