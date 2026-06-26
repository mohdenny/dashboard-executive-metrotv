import { useMemo, useState } from "react";
import { MOCK_PROGRAMS } from "@/constants/programMockData";
import { ChartData } from "chart.js";
import { formatBigNumber } from "@/lib/formatters";
import {
  sumPeriodValue,
  sortAndSlicePrograms,
  createBarDataset,
  generateBarChartData,
  generateDoubleBarChartData,
} from "@/lib/chartHelpers";

export default function useDashboard() {
  // Buat wadah state nilai pilih dasar kategori
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  // Buat wadah state nilai pilih dasar periode
  const [selectedPeriod, setSelectedPeriod] = useState<string | null>("all");
  // Buat wadah state nilai pilih per program
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(
    null,
  );
  // Buat state buat buka tutup modal detail program
  const [isProgramDetailOpen, setIsProgramDetailOpen] =
    useState<boolean>(false);

  const [startMonth, setStartMonth] = useState<string>("");
  const [endMonth, setEndMonth] = useState<string>("");

  // State tanda buka tutup modal detail chart
  const [isChartDetailOpen, setIsChartDetailOpen] = useState<boolean>(false);
  // State simpan tipe chart buat modal
  const [chartDetailType, setChartDetailType] = useState<string>("pnl");
  // State simpan judul modal detail
  const [chartDetailTitle, setChartDetailTitle] = useState<string>("");

  // Kumpul opsi periode
  const periodOptions = [
    { label: "All Time", value: "all" },
    { label: "YTD", value: "ytd" },
    { label: "MTD", value: "mtd" },
    { label: "Custom", value: "custom" },
  ];

  // Set tanggal paling baru dasar mock data
  const lastUpdated = useMemo(() => {
    let latest = new Date(0);
    MOCK_PROGRAMS.forEach((p) => {
      if (p.updatedAt) {
        const d = new Date(String(p.updatedAt));
        if (d > latest) latest = d;
      }
      p.periods?.forEach((per) => {
        const [year, month] = per.month.split("-").map(Number);
        const d = new Date(year, month - 1);
        if (d > latest) latest = d;
      });
    });
    return latest.getTime() === 0
      ? "-"
      : latest.toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });
  }, []);

  // Kumpul daftar opsi kategori
  const programCategories = useMemo(() => {
    return MOCK_PROGRAMS.reduce((acc, curr) => {
      // Masuk nama kategori ke array kalo belum ada
      if (!acc.includes(curr.category)) acc.push(curr.category);
      // Balik wadah array buat putar looping berikut
      return acc;
    }, [] as string[]);
  }, []);

  // Filter data dinamis dasar kategori sama periode
  const filteredPrograms = useMemo(() => {
    let result = [...MOCK_PROGRAMS];

    if (selectedPeriod === "custom") {
      if (startMonth)
        result = result.filter((p) =>
          p.periods.some((per) => per.month >= startMonth),
        );
      if (endMonth)
        result = result.filter((p) =>
          p.periods.some((per) => per.month <= endMonth),
        );
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

    // Kalo kategori kosong kasih semua data
    if (!selectedCategory) return result;
    // Filter array berdasar kategori
    return result.filter((p) => p.category === selectedCategory);
  }, [selectedCategory, startMonth, endMonth, selectedPeriod]);

  // Cari rentang waktu dari data filter buat label dashboard
  const displayedPeriodLabel = useMemo(() => {
    if (filteredPrograms.length === 0) return "Data Kosong";
    let min = "9999-99";
    let max = "0000-00";

    filteredPrograms.forEach((p) => {
      p.periods.forEach((per) => {
        if (per.month < min) min = per.month;
        if (per.month > max) max = per.month;
      });
    });

    return min === max ? min : `${min} s/d ${max}`;
  }, [filteredPrograms]);

  // Hitung nilai kpi buat isi card dashboard
  const totalKPI = useMemo(() => {
    // Pakai reduce buat kumpul total data revenue sama cost pnl
    const totals = filteredPrograms.reduce(
      (acc, curr) => {
        acc.revenue += sumPeriodValue(
          curr,
          (per) =>
            per.financials.revenueActual +
            (per.performanceDigital.revenue || 0),
        );
        acc.cost += sumPeriodValue(curr, (per) => per.financials.costDirect);
        acc.pnl += sumPeriodValue(curr, (per) => per.financials.pnl);
        return acc;
      },
      { revenue: 0, cost: 0, pnl: 0 },
    );

    // Cegah error pas bagi angka biar hasil aman pas penyebut nol
    const safeDiv = (num: number, denom: number) =>
      denom !== 0 ? num / denom : 0;
    // Format persen biar rapi
    const formatPct = (val: number) => val.toFixed(0).replace(".", ",");
    // Hitung persen profit bersih dari revenue
    const profitMarginPct = safeDiv(totals.pnl, totals.revenue) * 100;

    // Cari program sumbang pnl paling gede
    const topContributor =
      filteredPrograms.length > 0
        ? sortAndSlicePrograms(
            filteredPrograms,
            (per) => per.financials.pnl,
            true,
            1,
          )[0]
        : null;

    // Susun objek data kpi
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
          isPositive: topContributor
            ? sumPeriodValue(topContributor, (per) => per.financials.pnl) >= 0
            : false,
          label: topContributor
            ? `Rp ${formatBigNumber(sumPeriodValue(topContributor, (per) => per.financials.pnl))}`
            : "-",
        },
      ],
    };
  }, [filteredPrograms]);

  // Set id program aktif dasar filter kategori
  const activeProgramId = useMemo(() => {
    // Balik id program kalo program ada di dalem data saring
    if (
      selectedProgramId &&
      filteredPrograms.some((p) => p.id === selectedProgramId)
    ) {
      return selectedProgramId;
    }
    // Balik id program awal kalo data saring ada isi
    return filteredPrograms.length > 0 ? filteredPrograms[0].id : "";
  }, [filteredPrograms, selectedProgramId]);

  // Susun data pnl gabung semua program
  const allProgramData = useMemo<ChartData<"bar">>(() => {
    // Gabung nilai pnl dasar grup kategori
    const grouped = MOCK_PROGRAMS.reduce(
      (acc, curr) => {
        if (!acc[curr.category]) acc[curr.category] = 0;
        acc[curr.category] += sumPeriodValue(curr, (per) => per.financials.pnl);
        // Balik wadah array buat putar looping berikut
        return acc;
      },
      {} as Record<string, number>,
    );

    const labels = Object.keys(grouped);
    const data = Object.values(grouped);

    // Bikin beda warna latar pas kategori kena klik
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
      datasets: [createBarDataset("Total PNL (Rp)", data, bgColors)],
    };
  }, [selectedCategory]);

  // Susun data detail program bentuk donat
  const detailProgramData = useMemo<ChartData<"doughnut">>(() => {
    // Ambil data program pas id cocok
    const prog =
      MOCK_PROGRAMS.find((p) => p.id === activeProgramId) || MOCK_PROGRAMS[0];
    if (!prog) return { labels: [], datasets: [] };

    // Balik struktur data siap pakai buat chart js
    return {
      labels: ["Revenue Capaian", "Cost Direct", "Target Revenue"],
      datasets: [
        {
          data: [
            sumPeriodValue(
              prog,
              (per) =>
                per.financials.revenueActual +
                (per.performanceDigital.revenue || 0),
            ),
            sumPeriodValue(prog, (per) => per.financials.costDirect),
            sumPeriodValue(prog, (per) => per.financials.revenueTarget),
          ],
        },
      ],
    };
  }, [activeProgramId]);

  // Susun data top pnl via fungsi dry
  const topPnlData = useMemo<ChartData<"bar">>(() => {
    return generateBarChartData(
      filteredPrograms,
      (per) => per.financials.pnl,
      "Positif (Rp)",
      "#1f77b4",
      true,
    );
  }, [filteredPrograms]);

  // Susun data bottom pnl pakai custom dataset pisah
  const bottomPnlData = useMemo<ChartData<"bar">>(() => {
    // Urut data program dari nilai minus ke atas
    const sorted = sortAndSlicePrograms(
      filteredPrograms,
      (per) => per.financials.pnl,
      false,
    );
    return {
      labels: sorted.map((p) => p.name),
      datasets: [
        createBarDataset(
          "Minus (Rp)",
          sorted.map((p) => {
            const pnl = sumPeriodValue(p, (per) => per.financials.pnl);
            return pnl < 0 ? pnl : null;
          }),
          "#ff0000",
        ),
        createBarDataset(
          "Terendah (Rp)",
          sorted.map((p) => {
            const pnl = sumPeriodValue(p, (per) => per.financials.pnl);
            return pnl >= 0 ? pnl : null;
          }),
          "#1f77b4",
        ),
      ],
    };
  }, [filteredPrograms]);

  // Susun data top digital dua baris via fungsi dry
  const topRevenueDigitalData = useMemo<ChartData<"bar">>(() => {
    return generateDoubleBarChartData(
      filteredPrograms,
      (per) => per.performanceDigital.revenue,
      [
        {
          getter: (per) => per.performanceDigital.revenue,
          label: "Revenue (Rp)",
          color: "#1f77b4",
        },
        {
          getter: (per) => per.performanceDigital.views,
          label: "Views",
          color: "#17becf",
        },
      ],
      true,
    );
  }, [filteredPrograms]);

  // Susun data bottom digital dua baris via fungsi dry
  const bottomRevenueDigitalData = useMemo<ChartData<"bar">>(() => {
    return generateDoubleBarChartData(
      filteredPrograms,
      (per) => per.performanceDigital.revenue,
      [
        {
          getter: (per) => per.performanceDigital.revenue,
          label: "Revenue (Rp)",
          color: "#d62728",
        },
        {
          getter: (per) => per.performanceDigital.views,
          label: "Views",
          color: "#ff7f0e",
        },
      ],
      false,
    );
  }, [filteredPrograms]);

  // Susun data top revenue via fungsi dry
  const topRevenueData = useMemo<ChartData<"bar">>(() => {
    return generateBarChartData(
      filteredPrograms,
      (per) => per.financials.revenueActual,
      "Actual Revenue (Rp)",
      "#2ca02c",
      true,
    );
  }, [filteredPrograms]);

  // Susun data bottom revenue custom satu dataset
  const bottomRevenueData = useMemo<ChartData<"bar">>(() => {
    // Urut data program nilai rendah
    const sorted = sortAndSlicePrograms(
      filteredPrograms,
      (per) => per.financials.revenueActual,
      false,
    );
    return {
      labels: sorted.map((p) => p.name),
      datasets: [
        createBarDataset(
          "Actual Revenue (Rp)",
          sorted.map((p) =>
            sumPeriodValue(p, (per) => per.financials.revenueActual),
          ),
          sorted.map((p) =>
            sumPeriodValue(p, (per) => per.financials.revenueActual) >= 0
              ? "#ff7f0e"
              : "#d62728",
          ),
        ),
      ],
    };
  }, [filteredPrograms]);

  // Susun data top tvr via fungsi dry
  const topTvPerformanceDataTvr = useMemo<ChartData<"bar">>(() => {
    return generateBarChartData(
      filteredPrograms,
      (per) => per.performanceTV.actualTVR,
      "Pencapaian TVR",
      "#1f77b4",
      true,
    );
  }, [filteredPrograms]);

  // Susun data top share via fungsi dry
  const topTvPerformanceDataShare = useMemo<ChartData<"bar">>(() => {
    return generateBarChartData(
      filteredPrograms,
      (per) => per.performanceTV.actualShare,
      "Pencapaian Share",
      "#1f77b4",
      true,
    );
  }, [filteredPrograms]);

  // Susun data bottom tvr via fungsi dry
  const bottomTvPerformanceDataTvr = useMemo<ChartData<"bar">>(() => {
    return generateBarChartData(
      filteredPrograms,
      (per) => per.performanceTV.actualTVR,
      "Pencapaian TVR",
      "#d62728",
      false,
    );
  }, [filteredPrograms]);

  // Susun data bottom share via fungsi dry
  const bottomTvPerformanceDataShare = useMemo<ChartData<"bar">>(() => {
    return generateBarChartData(
      filteredPrograms,
      (per) => per.performanceTV.actualShare,
      "Pencapaian Share",
      "#d62728",
      false,
    );
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
    topRevenueData,
    bottomRevenueData,
    topTvPerformanceDataTvr,
    topTvPerformanceDataShare,
    bottomTvPerformanceDataTvr,
    bottomTvPerformanceDataShare,
    totalKPI,
    topRevenueDigitalData,
    bottomRevenueDigitalData,
    programCategories,
    selectedPeriod,
    setSelectedPeriod,
    periodOptions,
    lastUpdated,
    displayedPeriodLabel,
    isChartDetailOpen,
    setIsChartDetailOpen,
    chartDetailType,
    setChartDetailType,
    chartDetailTitle,
    setChartDetailTitle,
    isProgramDetailOpen,
    setIsProgramDetailOpen,
  };
}
