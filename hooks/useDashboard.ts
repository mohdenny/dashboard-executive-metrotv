import { useMemo, useState } from "react";
import { MOCK_PROGRAMS } from "@/constants/programMockData";
import { ChartData, ChartDataset } from "chart.js";
import { formatBigNumber } from "@/lib/formatters";

export default function useDashboard() {
  // Buat tampungan state atau nilai yang diselect berdasarkan kategori
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  // Buat tampungan state atau nilai yang diselect berdasarkan periode
  const [selectedPeriod, setSelectedPeriod] = useState<string | null>(null);
  // Buat tampungan state atau nilai yang diselect di per program
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(
    null,
  );
  const [startMonth, setStartMonth] = useState<string>("");
  const [endMonth, setEndMonth] = useState<string>("");

  // console.log(JSON.stringify(MOCK_PROGRAMS));

  // List option kategori
  const programCategories = useMemo(() => {
    return MOCK_PROGRAMS.reduce(
      (acc, curr) => {
        // Cek, kalau di dalam wadah array belum ada nama kategori si curr
        if (!acc.includes(curr.category)) {
          // Masukkan nama kategorinya saja ke dalam array wadah
          acc.push(curr.category);
        }

        // Balikin wadah array untuk putaran looping berikutnya
        return acc;
      },
      // Modal awalnya berupa wadah array kosong tipe string[]
      [] as string[],
    );
  }, []);

  // Filter data dinamis berdasarkan kategori
  const filteredPrograms = useMemo(() => {
    let result = [...MOCK_PROGRAMS];

    if (startMonth) {
      result = result.filter((p) => p.periodeBulan >= startMonth);
    }

    if (endMonth) {
      result = result.filter((p) => p.periodeBulan <= endMonth);
    }

    // Kalo kategorinya ga ada yang diselect kasih MOCK PROGRAMS semuanya
    if (!selectedCategory) return result;

    // Kalo kategorinya ada yang diselect filter berdasarkan katergori
    return result.filter((p) => p.category === selectedCategory);
  }, [selectedCategory, startMonth, endMonth]);

  // Nilai KPI buat di card dashboard
  const totalKPI = useMemo(() => {
    // Pake reduce buat akumulasi data total dari revenue, cost, pnl
    const totals = filteredPrograms.reduce(
      (acc, curr) => {
        acc.revenue += curr.revenueCapaian + (curr.digitalRevenue || 0);
        acc.cost += curr.costDirect;
        acc.pnl += curr.pnl;
        return acc;
      },
      // Set nilai awal ke nol semua
      { revenue: 0, cost: 0, pnl: 0 },
    );

    // Fungsi buat nyegah error pas bagi angka, biar hasilnya ga jadi "infinity" atau "NaN" pas penyebutnya nol
    // Parameter num itu angka atas, denom angka bawah
    const safeDiv = (num: number, denom: number) =>
      // Klo angka bawah bukan nol, lanjut bagi aja, tapi kalo angka bawahnya nol, langsung sebut hasilnya 0
      denom !== 0 ? num / denom : 0;

    // Fungsi pembantu baru buat rapihin persenan biar kaga nulis toFixed dan replace berulang-ulang
    const formatPct = (val: number) => val.toFixed(0).replace(".", ",");

    // Biar kaga bingung bahasa akutansi
    // Net = Bersih (Duit sisa akhir yang udah bersih dipotong)
    // Gross = Kotor (Duit yang belom dipotong biaya operasional)
    // Omset / Total Pendapatan / Revenue = Duit masuk utuh, belom dipotong apa2 (totals.revenue)
    // Harga Pokok Penjualan (HPP) / Modal Barang = Duit modal buat bikin produk (totals.cost)
    // Net Profit & Loss = Laba/rugi bersih akhir pas udah dipotong semua biaya (totals.pnl)

    // Itung persentase profit bersih dari revenue
    // Rumusnya, Net Profit Margin = (Profit Bersih / Total Pendapatan) * 100
    // "Dari total omset, berapa persen yang jadi profit bersih?"
    const profitMarginPct = safeDiv(totals.pnl, totals.revenue) * 100;

    // Cari program penyumbang PNL terbesar
    const topContributor =
      filteredPrograms.length > 0
        ? [...filteredPrograms].sort((a, b) => b.pnl - a.pnl)[0]
        : null;

    // Mapping konfigurasi cardnya buat dirender di komponen
    return {
      // Pake objek totals buat dibalikin totalsnya
      totals,

      // Array cardnya
      cards: [
        {
          title: "Total Revenue",

          // Total duit masuk dari seluruh program
          value: `Rp ${formatBigNumber(totals.revenue)}`,

          // Revenue harusnya positif
          isPositive: totals.revenue > 0,

          // Total pendapatan bisnis berapa?
          label: "Pendapatan",
        },

        {
          title: "Net Profit",

          // Duit sisa setelah dipotong semua biaya
          value: `Rp ${formatBigNumber(totals.pnl)}`,

          // Untung hijau, rugi merah
          isPositive: totals.pnl >= 0,

          // Bisnis untung atau rugi?
          label: totals.pnl >= 0 ? "Profit Bersih" : "Rugi Bersih",
        },

        {
          title: "Profit Margin",

          // Persentase profit bersih terhadap revenue
          value: `${formatPct(profitMarginPct)}%`,

          // Margin positif dianggap sehat
          isPositive: profitMarginPct >= 0,

          // Dari seluruh revenue, berapa persen jadi profit?
          label: profitMarginPct >= 0 ? "Margin Sehat" : "Margin Negatif",
        },

        {
          title: "Top Contributor Program",

          // Program penyumbang profit terbesar
          value: topContributor?.name || "-",

          // Kalo penyumbangnya profit dianggap positif
          isPositive: (topContributor?.pnl || 0) >= 0,

          // Program mana yang paling nyumbang ke bisnis?
          label: topContributor
            ? `Rp ${formatBigNumber(topContributor.pnl)}`
            : "-",
        },
      ],
    };
  }, [filteredPrograms]);

  // Aktif per program berdasarkan filter kategori diatas
  const activeProgramId = useMemo(() => {
    // Kalo ada program yang lagi diselect dan program tersebut ada dikategori yang udah difilter diatas
    if (
      selectedProgramId &&
      // some cuma boolean true atau false, bukan array baru kaya filter/find
      filteredPrograms.some((p) => p.id === selectedProgramId)
    ) {
      // Kalo ada, tetep pake program yang diselect
      return selectedProgramId;
    }

    // Kalo block if itu false, masuk ke return ini
    // Ini cuma buat fallback biar ga error
    // Ambil id program pertama buat fallback atau kasih kosong
    return filteredPrograms.length > 0 ? filteredPrograms[0].id : "";
  }, [filteredPrograms, selectedProgramId]);

  // PNL All Program
  // Biar optimal dibungkus pake useMemo biar react ga usah render ulang kalo ga ada perubahan di data
  // Data pake Tipe/Ts bawaan ChartJS tipe bar
  // useMemo bakal nyimpen di ram memori browser
  const allProgramData = useMemo<ChartData<"bar">>(() => {
    // Rapihin data yang berantakan berdasarkan group 'grouped'
    // Pake reduce buat loop sekalian kumpulin data ke satu wadah acc
    // acc = ini wadah sementara buat isi objeknya yang udah jadi atau udah diproses
    // curr = data mentah sekarang pas antrian dilooping satu2
    const grouped = MOCK_PROGRAMS.reduce(
      (acc, curr) => {
        // Cek, kalo di dalem wadah belom ada properti nama kategori si curr
        // Bikin kategorinya terus set angkanya awalnya mulai dari 0
        if (!acc[curr.category]) acc[curr.category] = 0;

        // Kalo kategorinya udah ada, tambahin properti nilai pnl yamg sekarang ke total katergori
        acc[curr.category] += curr.pnl;

        // Balikin wadah yang udah diupdate biar dibaca ke puteran lopping berikutnya
        // Ivaratnya tongkat estafet buat looping berikutnya

        return acc;
      },
      // Set initialvalue si reduce, modal awalnya bikin wadah objek kosong tipe ts objek record<key=string, value=number>
      // Syarat reduce, .reduce( fungsiProses, ModalAwalnya )
      {} as Record<string, number>,
    );

    // Ambil key sebagai labelnya
    const labels = Object.keys(grouped);
    // Ambil value sebagai datanya
    const data = Object.values(grouped);
    // Buat background pas lagi select kategorinya
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

    // Mapping returnnya
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

  // Detail Per-Program
  // Pake useMemo juga biar chart donat ini cuma kerender ulang kalo nilai selectedProgramId (dari dropdown) berubah
  // Kalo milih program yang sama, react tinggal ambil data dari memori browser, ga perlu mikir ulang
  // Cari data program spesifik dari array MOCK_PROGRAMS yang id-nya sama persis kaya yang lagi dipilih di state
  // Pake || MOCK_PROGRAMS[0] buat fallback aja misal id-nya ga ketemu, biar chart ga nge-blank atau error
  const detailProgramData = useMemo<ChartData<"doughnut">>(() => {
    const prog =
      MOCK_PROGRAMS.find((p) => p.id === activeProgramId) || MOCK_PROGRAMS[0];

    // Kalo prog ga ada balikin label dan datasetnya array kosong []
    if (!prog) return { labels: [], datasets: [] };

    // Balikin format datanya sesuai aturan struktur ChartJS, masukin angka capaian, cost, sama targetnya berurutan sesuai label
    return {
      labels: ["Revenue Capaian", "Cost Direct", "Target Revenue"],
      datasets: [
        {
          data: [
            prog.revenueCapaian + (prog.digitalRevenue || 0),
            prog.costDirect,
            prog.revenueTarget,
          ],
        },
      ],
    };
  }, [activeProgramId]);

  // Top PNL
  // Dibungkus useMemo dengan dependensi kosong [] soalnya ini datanya statis buat nampilin ranking, biar diitung sekali aja
  // Pake spread operator [...filteredPrograms] buat nge-copy array aslinya dulu
  // Soalnya fungsi .sort() itu ngerubah array aslinya (mutating). Kalo ga dicopy, data utama bakal ikutan berantakan
  const topPnlData = useMemo<ChartData<"bar">>(() => {
    // .sort((a, b) => b.pnl - a.pnl) ini rumus buat ngurutin dari PNL paling gede ke paling kecil (descending)
    // Abis diurutin, arraynya dipotong pake .slice(0, 5) buat ambil 5 data teratas aja
    const sorted = [...filteredPrograms]
      .sort((a, b) => b.pnl - a.pnl)
      .slice(0, 5);

    return {
      labels: sorted.map((p) => p.name),
      datasets: [
        {
          label: "Positif (Rp)",
          data: sorted.map((p) => p.pnl),
          minBarLength: 15,
        },
      ],
    };
  }, [filteredPrograms]);

  // Bottom PNL
  // Konsepnya sama kaya Top PNL, dicopy dulu biar array asli ga mutasi, trus diitung sekali aja pas render pertama
  const bottomPnlData = useMemo<ChartData<"bar">>(() => {
    // Bedanya cuma di rumus cara ngurutinnya
    // .sort((a, b) => a.pnl - b.pnl) ini rumus buat ngurutin dari PNL paling minus ke paling gede (ascending)
    // Jadi urutan program yang paling boncos ada di pucuk atas
    // Trus dipotong pake .slice(0, 5) buat ngambil 5 peringkat paling bawah
    const sorted = [...filteredPrograms]
      .sort((a, b) => a.pnl - b.pnl)
      .slice(0, 5);

    return {
      labels: sorted.map((p) => p.name),
      datasets: [
        {
          label: "Minus (Rp)",
          // Kalo nilainya di bawah 0, sisanya null
          data: sorted.map((p) => (p.pnl < 0 ? p.pnl : null)),
          backgroundColor: "#ff0000", // Merah Terang
          minBarLength: 15,
        },
        {
          label: "Terendah (Rp)",
          // Kalo nilainya 0 atao lebih, sisanya null
          data: sorted.map((p) => (p.pnl >= 0 ? p.pnl : null)),
          minBarLength: 15,
        },
      ],
    };
  }, [filteredPrograms]);

  // Top Revenue Digital
  const topRevenueDigitalData = useMemo<ChartData<"bar">>(() => {
    const sorted = [...filteredPrograms]
      .sort((a, b) => (b.digitalRevenue || 0) - (a.digitalRevenue || 0))
      .slice(0, 5);

    return {
      labels: sorted.map((p) => p.name),
      datasets: [
        {
          label: "Revenue (Rp)",
          data: sorted.map((p) => p.digitalRevenue || 0),
          minBarLength: 15,
        },
        {
          label: "Views",
          data: sorted.map((p) => p.digitalViews || 0),
          backgroundColor: "#9467bd",
          minBarLength: 15,
        },
      ],
    };
  }, [filteredPrograms]);

  // Bottom Revenue Digital
  const bottomRevenueDigitalData = useMemo<ChartData<"bar">>(() => {
    const sorted = [...filteredPrograms]
      .sort((a, b) => (a.digitalRevenue || 0) - (b.digitalRevenue || 0))
      .slice(0, 5);

    return {
      labels: sorted.map((p) => p.name),
      datasets: [
        {
          label: "Revenue (Rp)",
          data: sorted.map((p) => p.digitalRevenue || 0),
          minBarLength: 15,
        },
        {
          label: "Views",
          data: sorted.map((p) => p.digitalViews || 0),
          backgroundColor: "#9467bd",
          minBarLength: 15,
        },
      ],
    };
  }, [filteredPrograms]);

  // All Program berdasarkan kategori, chart combo
  const comboTargetActualData = useMemo<ChartData<"bar">>(() => {
    return {
      // Program yang difilter berdasarkan kategori dimap satu2
      // Urutan labels sama datasets sesuai urutan indeks
      labels: filteredPrograms.map((p) => p.name),
      datasets: [
        {
          type: "bar",
          label: "Target Revenue (Rp)",
          data: filteredPrograms.map((p) => p.revenueTarget),
          minBarLength: 15,
        },
        {
          type: "bar",
          label: "Actual Revenue (Rp)",
          data: filteredPrograms.map((p) => p.revenueCapaian),
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
          // Rumus persentase: Aktual / Target * 100
          // Kalo target 0 fallback ke 0 biar ga infinity
          data: filteredPrograms.map((p) =>
            p.targetTVR ? (p.capaianTVR / p.targetTVR) * 100 : 0,
          ),
          backgroundColor: "#1f77b4",
          minBarLength: 15,
        },
        {
          label: "Pencapaian Share (%)",
          data: filteredPrograms.map((p) =>
            p.targetShare ? (p.capaianShare / p.targetShare) * 100 : 0,
          ),
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
  };
}
