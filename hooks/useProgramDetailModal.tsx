"use client";

import { useState, useMemo, useSyncExternalStore } from "react";
// Import tipe data dari chart js
import { ChartData, ChartOptions, TooltipItem, ChartDataset } from "chart.js";
// Import skema form program
import { ProgramFormData } from "@/schemas/program";
// Import helper format formatter
import { formatBigNumber, formatNumberIndo } from "@/lib/formatters";
// Import helper buat rakit dataset chart
import {
  createLineDataset,
  createBarDataset,
  generateMultiMetricDoughnutData,
} from "@/lib/chartHelpers";

// Fungsi dummy buat bantu sinkronisasi store eksternal
const emptySubscribe = () => () => {};

// Hook kustom buat misahin logika operasional di modal detail program
export const useProgramDetailModal = (
  // Terima data program sasaran
  program: ProgramFormData | null,
  // Terima parameter periode awal dari list
  initialPeriod?: string,
) => {
  // Hook buat mastiin komponen cuma render di browser biar ga error
  const mounted = useSyncExternalStore(
    // Pake fungsi kosong
    emptySubscribe,
    // Kalo di client balikin true
    () => true,
    // Kalo di server balikin false
    () => false,
  );

  // State buat simpen input bulan mulai filter tren
  const [trendStartMonth, setTrendStartMonth] = useState<string>("");
  // State buat simpen input bulan akhir filter tren
  const [trendEndMonth, setTrendEndMonth] = useState<string>("");
  // State buat simpen pilihan filter tren
  const [trendFilter, setTrendFilter] = useState<string>("ytd");

  // State buat simpen bulan yang lagi aktif dipilih, inisialisasi dari parameter awal
  const [selectedMonth, setSelectedMonth] = useState<string>(
    initialPeriod || "",
  );
  // State bayangan buat ngecek prop initial period tanpa use effect
  const [prevInitialPeriod, setPrevInitialPeriod] = useState<
    string | undefined
  >(initialPeriod);

  // Kondisi sinkron state bulan aktif pas prop initial period berubah
  if (initialPeriod !== prevInitialPeriod) {
    // Tiban state bayangan pake prop baru
    setPrevInitialPeriod(initialPeriod);
    // Tembak nilai state bulan terpilih pake periode awal
    setSelectedMonth(initialPeriod || "");
  }

  // State buat ganti tab antara overview atau tren
  const [activeTab, setActiveTab] = useState<
    "overview" | "trend" | "komparasi"
  >("overview");

  // Memo buat urutin data periode biar pas tampil udah rapi
  const sortedPeriods = useMemo(() => {
    // Kalo data periode kosong balikin array kosong
    if (!program?.periods) return [];
    // Sortir data berdasarkan bulan biar urut
    return [...program.periods].sort((a, b) => a.month.localeCompare(b.month));
  }, [program]);

  // Memo buat bulan terakhir dari data periode
  const lastPeriodMonth = useMemo(
    () => sortedPeriods[sortedPeriods.length - 1]?.month ?? "",
    [sortedPeriods],
  );

  // Bulan yang dipakai sebenernya, fallback ke periode terbaru kalo pilihan kosong atau ga valid
  const effectiveSelectedMonth = useMemo(
    () =>
      selectedMonth && sortedPeriods.some((p) => p.month === selectedMonth)
        ? selectedMonth
        : lastPeriodMonth,
    [selectedMonth, sortedPeriods, lastPeriodMonth],
  );

  // Memo buat dapetin data periode spesifik yang lagi dipilih
  const currentPeriodData = useMemo(() => {
    // Kalo ga ada data balikin null
    if (!program?.periods) return null;
    // Cari periode yang bulan-nya cocok sama pilihan user
    return (
      program.periods.find((p) => p.month === effectiveSelectedMonth) ||
      sortedPeriods[sortedPeriods.length - 1]
    );
  }, [program, effectiveSelectedMonth, sortedPeriods]);

  // Memo buat nyaring data buat chart tren sesuai filter yang dipasang
  const filteredTrendPeriods = useMemo(() => {
    // Awalnya ambil data periode yang udah urut
    let result = sortedPeriods;
    // Kalo filter YTD, filter data cuma buat tahun ini
    if (trendFilter === "ytd") {
      const currentYear = new Date().getFullYear().toString();
      result = result.filter((p) => p.month.startsWith(currentYear));
    } else if (trendFilter === "mtd") {
      // Kalo MTD, filter data buat bulan ini aja
      const currentMonth = new Date().toISOString().slice(0, 7);
      result = result.filter((p) => p.month === currentMonth);
    } else if (trendFilter === "custom") {
      // Kalo custom, filter berdasarkan input user
      if (trendStartMonth) {
        result = result.filter((p) => p.month >= trendStartMonth);
      }
      if (trendEndMonth) {
        result = result.filter((p) => p.month <= trendEndMonth);
      }
    }
    // Balikin hasil filteran
    return result;
  }, [sortedPeriods, trendStartMonth, trendEndMonth, trendFilter]);

  // Fungsi bantu buat ngambil nilai metrik dari objek periode
  const getMetricValue = (p: ProgramFormData["periods"][0], metric: string) => {
    // Kalo objek periode ga ada balikin nol
    if (!p) return 0;
    // Cek key metrik terus balikin nilainya sesuai tipe
    switch (metric) {
      case "rev":
        return p.financials.revenueActual;
      case "pnl":
        return p.financials.pnl;
      case "cost":
        return p.financials.costDirect;
      case "tvr":
        return p.performanceTV.actualTVR;
      case "share":
        return p.performanceTV.actualShare;
      case "views":
        return p.performanceDigital.views;
      default:
        return 0;
    }
  };

  // Fungsi buat hitung statistik tren kenaikan atau penurunan berdasar rentang awal dan akhir array
  const calculateTrend = (metricKey: string) => {
    // Kalo data kosong balikin nilai awal default
    if (filteredTrendPeriods.length === 0)
      return { val: 0, pct: 0, diff: 0, up: true };
    // Kalo cuma ada satu data ga bisa bandingin
    if (filteredTrendPeriods.length === 1) {
      const p = filteredTrendPeriods[0];
      return { val: getMetricValue(p, metricKey), pct: 0, diff: 0, up: true };
    }
    // Ambil nilai periode terakhir
    const last = getMetricValue(
      filteredTrendPeriods[filteredTrendPeriods.length - 1],
      metricKey,
    );
    // Ambil nilai periode sebelumnya
    const prev = getMetricValue(
      filteredTrendPeriods[filteredTrendPeriods.length - 2],
      metricKey,
    );
    // Hitung selisihnya
    const diff = last - prev;
    // Hitung persentase kenaikan
    const pct = prev === 0 ? (diff > 0 ? 100 : 0) : (diff / prev) * 100;
    // Balikin status tren naik atau turun beserta selisih
    return { val: last, pct: Math.abs(pct), diff, up: diff >= 0 };
  };

  // Memo buat hitung statistik periode aktif vs bulan sebelumnya buat card overview
  const currentPeriodStats = useMemo(() => {
    // Bikin fungsi helper internal buat hitung satu metrik
    const calcSingle = (metric: string) => {
      // Cek kalo ga ada data saat ini, kasih nol semua
      if (!currentPeriodData || sortedPeriods.length === 0) {
        return { val: 0, pct: 0, diff: 0, up: true };
      }
      // Cari index periode saat ini di array yang udah diurutin
      const currIdx = sortedPeriods.findIndex(
        (p) => p.month === currentPeriodData.month,
      );
      // Kalo ga ketemu atau dia data pertama (ga ada sebelumnya)
      if (currIdx <= 0) {
        const val = getMetricValue(currentPeriodData, metric);
        return { val, pct: 0, diff: 0, up: true };
      }
      // Ambil data bulan sebelumnya
      const prevData = sortedPeriods[currIdx - 1];
      // Tarik nilai masing-masing
      const currVal = getMetricValue(currentPeriodData, metric);
      const prevVal = getMetricValue(prevData, metric);
      // Hitung selisih
      const diff = currVal - prevVal;
      // Hitung persentase
      const pct = prevVal === 0 ? (diff > 0 ? 100 : 0) : (diff / prevVal) * 100;

      // Balikin objek stat
      return { val: currVal, pct: Math.abs(pct), diff, up: diff >= 0 };
    };

    // Kumpulin semua metrik
    return {
      rev: calcSingle("rev"),
      pnl: calcSingle("pnl"),
      cost: calcSingle("cost"),
      tvr: calcSingle("tvr"),
      share: calcSingle("share"),
      views: calcSingle("views"),
    };
  }, [currentPeriodData, sortedPeriods]);

  // Memo buat nyimpen hasil hitungan statistik tren buat semua metrik
  const trendStats = useMemo(
    () => ({
      rev: calculateTrend("rev"),
      pnl: calculateTrend("pnl"),
      cost: calculateTrend("cost"),
      tvr: calculateTrend("tvr"),
      share: calculateTrend("share"),
      views: calculateTrend("views"),
    }),
    [filteredTrendPeriods],
  );

  // Memo buat susun struktur data grafik garis tren
  const trendLineChartData = useMemo<ChartData<"line"> | null>(() => {
    // Kalo ga ada data, balikin null
    if (filteredTrendPeriods.length === 0) return null;
    // Balikin objek data chart line dengan bantuan utilitas helper
    return {
      labels: filteredTrendPeriods.map((p) => p.month),
      datasets: [
        // Panggil rakitan dataset fungsi helper buat garis metrik net pnl
        {
          ...createLineDataset(
            "Net PNL",
            filteredTrendPeriods.map((p) => p.financials.pnl),
            "#16a34a",
            "#16a34a",
          ),
          yAxisID: "y",
          tension: 0.4,
          hidden: false,
        } as ChartDataset<"line", number[]>,
        // Sisipkan dataset hasil helper buat tren revenue riil
        {
          ...createLineDataset(
            "Capaian Revenue",
            filteredTrendPeriods.map((p) => p.financials.revenueActual),
            "#1f77b4",
            "#1f77b4",
          ),
          yAxisID: "y",
          tension: 0.4,
          hidden: true,
        } as ChartDataset<"line", number[]>,
        // Masukin rakitan line cost direct
        {
          ...createLineDataset(
            "Cost Direct",
            filteredTrendPeriods.map((p) => p.financials.costDirect),
            "#ff7f0e",
            "#ff7f0e",
          ),
          yAxisID: "y",
          tension: 0.4,
          hidden: true,
        } as ChartDataset<"line", number[]>,
        // Tambahin garis tren jumlah view konten sosmed
        {
          ...createLineDataset(
            "Digital Views",
            filteredTrendPeriods.map((p) => p.performanceDigital.views),
            "#8b5cf6",
            "#8b5cf6",
          ),
          yAxisID: "y",
          tension: 0.4,
          hidden: true,
        } as ChartDataset<"line", number[]>,
        // Jejelin dataset capaian tvr tv
        {
          ...createLineDataset(
            "TVR",
            filteredTrendPeriods.map((p) => p.performanceTV.actualTVR),
            "#ec4899",
            "#ec4899",
          ),
          yAxisID: "y1",
          tension: 0.4,
          hidden: false,
        } as ChartDataset<"line", number[]>,
        // Kunci penutup dataset share audiens
        {
          ...createLineDataset(
            "Share",
            filteredTrendPeriods.map((p) => p.performanceTV.actualShare),
            "#06b6d4",
            "#06b6d4",
          ),
          yAxisID: "y1",
          tension: 0.4,
          hidden: false,
        } as ChartDataset<"line", number[]>,
      ],
    };
  }, [filteredTrendPeriods]);

  // Konfigurasi opsi chart line biar interaktif
  const trendLineChartOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index",
      intersect: false,
    },
    plugins: {
      legend: {
        display: true,
        position: "bottom",
        labels: { usePointStyle: true, boxWidth: 8 },
      },
      tooltip: {
        callbacks: {
          label: function (context: TooltipItem<"line">) {
            const label = context.dataset.label || "";
            const val = context.parsed.y;
            // Kalo tv atau share, ga pake embel2 rupiah
            if (label === "TVR" || label === "Share") {
              return `${label}: ${val}`;
            }
            // Sisanya pake format rupiah
            return `${label}: Rp ${formatNumberIndo(val ?? 0)}`;
          },
        },
      },
      zoom: {
        zoom: {
          mode: "xy",
        },
        pan: {
          enabled: true,
          mode: "xy",
        },
      },
    },
    scales: {
      x: { grid: { display: false } },
      y: {
        type: "linear",
        display: true,
        position: "left",
        title: { display: true, text: "Rupiah / Views" },
        ticks: {
          // Format angka gede biar ga kepanjangan
          callback: function (value: string | number) {
            return formatBigNumber(Number(value));
          },
        },
      },
      y1: {
        type: "linear",
        display: true,
        position: "right",
        title: { display: true, text: "TVR / Share" },
        grid: { drawOnChartArea: false },
        ticks: {
          // Format angka biasa buat tvr share
          callback: function (value: string | number) {
            return Number(value).toLocaleString("id-ID");
          },
        },
      },
    },
  };

  // Memo data grafik bar performa tv
  const tvChartData = useMemo<ChartData<"bar"> | null>(() => {
    // Kalo ga ada data periode balikin null
    if (!currentPeriodData) return null;
    // Balikin objek data bar ngerakit via helper
    return {
      labels: ["TVR", "Share"],
      datasets: [
        // Manfaatin fungsi generator bar
        createBarDataset(
          "Target",
          [
            currentPeriodData.performanceTV?.targetTVR ?? 0,
            currentPeriodData.performanceTV?.targetShare ?? 0,
          ],
          "#4bc0c0",
          10,
        ),
        // Tempelin dataset capaian di sebelahnya
        createBarDataset(
          "Capaian",
          [
            currentPeriodData.performanceTV?.actualTVR ?? 0,
            currentPeriodData.performanceTV?.actualShare ?? 0,
          ],
          "#1f77b4",
          10,
        ),
      ],
    };
  }, [currentPeriodData]);

  // Memo data grafik donat finansial
  // Susun data chart donat finansial pake helper multi metrik baru
  const financeDoughnutChartData = useMemo<ChartData<"doughnut"> | null>(() => {
    // Kondisional cek kalo ga ada data periode balikin null aja biar ga error
    if (!currentPeriodData) return null;

    // Ambil nilai pnl buat nentuin warna ijo penanda untung atau merah tanda rugi
    const pnl = currentPeriodData.financials?.pnl ?? 0;

    // Balikin hasil rakitan chart donat multi metrik dari fungsi helper
    return generateMultiMetricDoughnutData(
      // Masukin objek data periode aktif sebagai sumber penarik nilai
      currentPeriodData,
      // Array konfigurasi list irisan metrik buat diagram donat
      [
        // Objek konfigurasi irisan pertama buat target omset
        {
          // Teks penanda nama potongan target revenue
          label: "Target Rev",
          // Callback narik nilai uang target revenue dari sumber data
          getter: (data) => data.financials?.revenueTarget ?? 0,
          // Kode heksadesimal toska buat warna irisan target
          color: "#4bc0c0",
        },
        // Objek konfigurasi irisan kedua buat omset tv riil
        {
          // Teks penanda nama potongan capaian revenue
          label: "Capaian Rev",
          // Callback penarik nilai capaian revenue tv
          getter: (data) => data.financials?.revenueActual ?? 0,
          // Kode warna biru tua buat potongan capaian tv
          color: "#1f77b4",
        },
        // Objek konfigurasi irisan ketiga buat pengeluaran produksi
        {
          // Teks penanda nama potongan pengeluaran modal
          label: "Cost Direct",
          // Callback narik jumlah duit pengeluaran cost direct
          getter: (data) => data.financials?.costDirect ?? 0,
          // Kode heksadesimal oren buat tanda pengeluaran
          color: "#ff7f0e",
        },
        // Objek konfigurasi irisan keempat buat omset sosmed
        {
          // Teks penanda nama potongan omset digital
          label: "Digital Rev",
          // Callback narik nilai pendapatan dari platform digital
          getter: (data) => data.performanceDigital?.revenue ?? 0,
          // Kode warna ungu buat penanda pundi digital
          color: "#8b5cf6",
        },
        // Objek konfigurasi irisan kelima buat laba rugi bersih pnl
        {
          // Teks penanda nama irisan pnl
          label: "Net PNL",
          // Callback narik nilai keuntungan bersih pnl
          getter: (data) => data.financials?.pnl ?? 0,
          // Kondisional operator penentu warna irisan ijo pas untung dan merah pas rugi
          color: pnl >= 0 ? "#16a34a" : "#d62728",
        },
      ],
    );
    // Array dependensi mantau pembaruan data pas user ganti periode
  }, [currentPeriodData]);

  // Memo konfigurasi tooltip donat
  const financeDoughnutChartOptions: ChartOptions<"doughnut"> = useMemo(
    () => ({
      plugins: {
        tooltip: {
          callbacks: {
            label: function (context: TooltipItem<"doughnut">) {
              const label = context.label || "";
              const value = context.parsed || 0;
              const pnl = currentPeriodData?.financials?.pnl ?? 0;
              // Kalo net pnl minus, kasih tanda minus
              if (label === "Net PNL" && pnl < 0) {
                return `${label}: Rp -${formatNumberIndo(value)}`;
              }
              // Format normal rupiah
              return `${label}: Rp ${formatNumberIndo(value)}`;
            },
          },
        },
      },
    }),
    [currentPeriodData],
  );

  // Lempar balik bungkusan state dan variabel ke komponen utama
  return {
    mounted,
    trendStartMonth,
    setTrendStartMonth,
    trendEndMonth,
    setTrendEndMonth,
    trendFilter,
    setTrendFilter,
    selectedMonth,
    setSelectedMonth,
    activeTab,
    setActiveTab,
    currentPeriodData,
    currentPeriodStats,
    effectiveSelectedMonth,
    trendStats,
    trendLineChartData,
    trendLineChartOptions,
    tvChartData,
    financeDoughnutChartData,
    financeDoughnutChartOptions,
  };
};
