// Import hook memo dan state dari react
import { useMemo, useState } from "react";
// Import data mock program buat dashboard
import { MOCK_PROGRAMS } from "@/constants/programMockData";
// Import tipe data chart
import { ChartData } from "chart.js";
// Import fungsi format angka biar rapi
import { formatBigNumber } from "@/lib/formatters";
// Import helper fungsi buat olah data chart
import {
  sumPeriodValue,
  sortAndSlicePrograms,
  createBarDataset,
  generateBarChartData,
  generateDoubleBarChartData,
} from "@/lib/chartHelpers";

// Fungsi komponen custom hook buat logic dashboard
export default function useDashboard() {
  // Wadah buat ngeset kategori apa yang lagi dipilih ama user
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
<<<<<<< HEAD
  
  // Wadah buat nyimpen periode waktu pake pancingan awal all
  const [selectedPeriod, setSelectedPeriod] = useState<string | null>("all");
  
=======

  // Wadah buat nyimpen periode waktu pake pancingan awal all
  const [selectedPeriod, setSelectedPeriod] = useState<string | null>("all");

>>>>>>> 7c23464 (refactored)
  // Wadah buat nandain id program mana yang lagi diklik
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(
    null,
  );
<<<<<<< HEAD
  
=======

>>>>>>> 7c23464 (refactored)
  // Wadah boolean buat ngatur buka tutupnya modal detail program
  const [isProgramDetailOpen, setIsProgramDetailOpen] =
    useState<boolean>(false);

  // Wadah buat nyimpen bulan awal pas milih custom tanggal
  const [startMonth, setStartMonth] = useState<string>("");
<<<<<<< HEAD
  
=======

>>>>>>> 7c23464 (refactored)
  // Wadah buat nyimpen bulan akhir pas milih custom tanggal
  const [endMonth, setEndMonth] = useState<string>("");

  // Wadah penanda modal detail chart lagi nongol apa kaga
  const [isChartDetailOpen, setIsChartDetailOpen] = useState<boolean>(false);
<<<<<<< HEAD
  
  // Wadah buat nyimpen jenis chart pake pancingan awal pnl
  const [chartDetailType, setChartDetailType] = useState<string>("pnl");
  
=======

  // Wadah buat nyimpen jenis chart pake pancingan awal pnl
  const [chartDetailType, setChartDetailType] = useState<string>("pnl");

>>>>>>> 7c23464 (refactored)
  // Wadah teks buat tiban judul modal detail biar dinamis
  const [chartDetailTitle, setChartDetailTitle] = useState<string>("");

  // Wadah buat ngumpulin semua pilihan opsi periode yang ada
  const periodOptions = [
    { label: "All Time", value: "all" },
    { label: "YTD", value: "ytd" },
    { label: "MTD", value: "mtd" },
    { label: "Custom", value: "custom" },
  ];

  // Set tanggal paling baru dasar mock data
  const lastUpdated = useMemo(() => {
    // Buat wadah tanggal paling jadul (1 Jan 1970) buat pancingan nilai awal bandingan
    let latest = new Date(0);

    // Cek semua data program satu2 di dalem array
    MOCK_PROGRAMS.forEach((p) => {
      // Kalo ada properti tanggal update di data program itu
      if (p.updatedAt) {
        // Buat wadah baru buat ubah string updatedAt jadi tipe Date
        const d = new Date(String(p.updatedAt));
<<<<<<< HEAD
        
        // Kalo tanggal ini lebih baru dari isi wadah latest, tiban wadah latest pake tanggal baru ini
        if (d > latest) latest = d;
      }
      
=======

        // Kalo tanggal ini lebih baru dari isi wadah latest, tiban wadah latest pake tanggal baru ini
        if (d > latest) latest = d;
      }

>>>>>>> 7c23464 (refactored)
      // Cek semua data periode kalo properti periods emang ada
      p.periods?.forEach((per) => {
        // Bongkar string teks periode terus pisah jadi angka tahun sama bulan pake tanda strip
        const [year, month] = per.month.split("-").map(Number);

        // Buat wadah baru tanggal periode (bulan dikurang 1 soalnya indeks bulan JavaScript mulainya dari angka 0)
        const d = new Date(year, month - 1);

        // Kalo tanggal periode ini lebih baru dari isi wadah latest, tiban wadah latest pake tanggal periode ini
        if (d > latest) latest = d;
      });
    });
<<<<<<< HEAD
    
=======

>>>>>>> 7c23464 (refactored)
    // Kalo wadah latest ga pernah ketiban (tetap 1 Jan 1970), balikin strip. Kalo ketiban, ubah ke format tanggal Indonesia
    return latest.getTime() === 0
      ? "-"
      : latest.toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });
  }, []);

  // Wadah buat ngumpulin semua pilihan kategori yang ada
  const programCategories = useMemo(() => {
    return MOCK_PROGRAMS.reduce((acc, curr) => {
      // Masukin nama kategori ke wadah array kalo emang belum ada
      if (!acc.includes(curr.category)) acc.push(curr.category);
      // Balikin wadah array biar bisa lanjut dibongkar di putaran berikutnya
      return acc;
    }, [] as string[]);
  }, []);

  // Bongkar data secara dinamis berdasarkan kategori ama periode yang lagi dipilih
  const filteredPrograms = useMemo(() => {
    // Wadah sementara buat nyalin semua data mentah program
    let result = [...MOCK_PROGRAMS];

    // Kalo user milih periode custom baru masukin logic filter tanggal manual
    if (selectedPeriod === "custom") {
      // Kalo bulan awal ada isinya langsung saring data yang masuk range bulan itu
      if (startMonth)
        result = result.filter((p) =>
          p.periods.some((per) => per.month >= startMonth),
        );
      // Kalo bulan akhir ada isinya saring lagi data biar ga kelewat batas bulannya
      if (endMonth)
        result = result.filter((p) =>
          p.periods.some((per) => per.month <= endMonth),
        );
<<<<<<< HEAD
    // Kalo periode dipilih dan bukan all berarti pake filter bawaan sistem
=======
      // Kalo periode dipilih dan bukan all berarti pake filter bawaan sistem
>>>>>>> 7c23464 (refactored)
    } else if (selectedPeriod && selectedPeriod !== "all") {
      // Wadah pancingan buat ngambil info tanggal hari ini
      const today = new Date();
      // Wadah buat nyimpen angka tahun yang sekarang lagi jalan
      const currentYear = today.getFullYear();
      // Wadah teks format tahun bulan buat tanda bulan sekarang
      const currentMonthStr = `${currentYear}-${String(today.getMonth() + 1).padStart(2, "0")}`;
      // Wadah teks penanda bulan pertama di tahun berjalan
      const firstMonthOfYear = `${currentYear}-01`;

      // Wadah pancingan kosong buat nyimpen batas bawah bulan filteran
      let minMonth = "";
      // Kalo periodenya ytd berarti batas bawahnya di-set ke januari tahun ini
      if (selectedPeriod === "ytd") minMonth = firstMonthOfYear;
      // Kalo periodenya mtd berarti batas bawahnya langsung tiban pake bulan sekarang
      else if (selectedPeriod === "mtd") minMonth = currentMonthStr;

      // Bongkar isi periods terus saring data yang masuk dalem range waktu tadi
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
    // Kalo data kosong tampilkan teks data kosong
    if (filteredPrograms.length === 0) return "Data Kosong";
    // Wadah batas bawah
    let min = "9999-99";
    // Wadah batas atas
    let max = "0000-00";

    // Loop buat cari batas range bulan
    filteredPrograms.forEach((p) => {
      // Loop tiap periode
      p.periods.forEach((per) => {
        // Bandingkan bulan
        if (per.month < min) min = per.month;
        if (per.month > max) max = per.month;
      });
    });

    // Balikin label rentang waktu
    return min === max ? min : `${min} s/d ${max}`;
  }, [filteredPrograms]);

  // Hitung nilai kpi buat isi card dashboard
  const totalKPI = useMemo(() => {
    // Pakai reduce buat kumpul total data revenue sama cost pnl
    const totals = filteredPrograms.reduce(
      (acc, curr) => {
        // Tambah revenue
        acc.revenue += sumPeriodValue(
          curr,
          (per) =>
            per.financials.revenueActual +
            (per.performanceDigital.revenue || 0),
        );
        // Tambah cost
        acc.cost += sumPeriodValue(curr, (per) => per.financials.costDirect);
        // Tambah pnl
        acc.pnl += sumPeriodValue(curr, (per) => per.financials.pnl);
        // Balikin akumulator
        return acc;
      },
      // Inisialisasi awal nol
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
        // Kalo kategori belum ada bikin dulu
        if (!acc[curr.category]) acc[curr.category] = 0;
        // Tambah pnl
        acc[curr.category] += sumPeriodValue(curr, (per) => per.financials.pnl);
        // Balik wadah array buat putar looping berikut
        return acc;
      },
      {} as Record<string, number>,
    );

    // List label
    const labels = Object.keys(grouped);
    // List data
    const data = Object.values(grouped);

    // Bikin beda warna latar pas kategori kena klik
    const bgColors = labels.map((label, index) => {
      // Palet warna
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
      // Kasih warna pudar kalo ga dipilih
      return !selectedCategory || label === selectedCategory
        ? baseColor
        : baseColor + "26";
    });

    // Balik struktur data bar
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
    // Kalo program gada balikin objek kosong
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
    // Balik struktur data chart
    return {
      labels: sorted.map((p) => p.name),
      datasets: [
        // Dataset minus
        createBarDataset(
          "Minus (Rp)",
          sorted.map((p) => {
            const pnl = sumPeriodValue(p, (per) => per.financials.pnl);
            return pnl < 0 ? pnl : null;
          }),
          "#ff0000",
        ),
        // Dataset terendah
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
    // Balik struktur data
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

  // Return semua data dan state buat dipake di ui
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
