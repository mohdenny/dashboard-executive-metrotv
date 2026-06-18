import { useMemo, useState } from "react";
import { MOCK_PROGRAMS } from "@/constants/programMockData";
import { ChartData, ChartDataset } from "chart.js";
import { formatBigNumber } from "@/lib/formatters";

export default function useDashboard() {
  // Buat tampungan state atau nilai yang diselect berdasarkan kategori
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  // Buat tampungan state atau nilai yang diselect di per program
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(
    null,
  );

  // Filter data dinamis berdasarkan kategori
  const filteredPrograms = useMemo(() => {
    // Kalo kategorinya ga ada yang diselect kasih MOCK PROGRAMS semuanya
    if (!selectedCategory) return MOCK_PROGRAMS;

    // Kalo kategorinya ada yang diselect filter berdasarkan katergori
    return MOCK_PROGRAMS.filter((p) => p.category === selectedCategory);
  }, [selectedCategory, MOCK_PROGRAMS]);

  // Nilai KPI buat di card dashboard
  const totalKPI = useMemo(() => {
    // Pake reduce buat akumulasi data total dari revenue, cost, pnl
    const totals = filteredPrograms.reduce(
      (acc, curr) => {
        acc.revenue += curr.revenueCapaian;
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
    const formatPct = (val: number) => val.toFixed(1).replace(".", ",");

    // Biar kaga bingung bahasa akutansi
    // Net = Bersih (Duit sisa akhir yang udah bersih dipotong)
    // Gross = Kotor (Duit yang belom dipotong biaya operasional)
    // Omset / Total Pendapatan / Revenue = Duit masuk utuh, belom dipotong apa2 (totals.revenue)
    // Harga Pokok Penjualan (HPP) / Modal Barang = Duit modal buat bikin produk (totals.cost)
    // Laba Kotor / Gross Profit = Duit sisa pas omset dikurang modal barang (grossProfit)
    // Net Profit & Loss = Laba/rugi bersih akhir pas udah dipotong semua biaya (totals.pnl)

    // Itung laba kotor / gross profit (omset - biaya)
    // Rumusnya, Laba Kotor = Total Pendapatan - Harga Pokok Penjualan (HPP)
    const grossProfit = totals.revenue - totals.cost;

    // Itung persentase margin laba kotor dari revenue
    // Rumusnya, Gross Profit Margin = (Laba Kotor / Total Pendapatan) * 100
    // "Dari total omset, berapa persen yang jadi keuntungan kotornya?"
    const grossProfitMarginPct = safeDiv(grossProfit, totals.revenue) * 100;

    // Pake perbandingan buat cek cost gedean dari revenue atau gak
    // Rumusnya, apa si Total Biaya > Total Pendapatan?
    const isOverCost = totals.cost > totals.revenue;

    // Pake pembagian safeDiv buat cari rasio cost dibanding revenue
    // Rumusnya, Cost-to-Revenue Ratio = (Total Biaya / Total Pendapatan) * 100
    // "Berapa persen sih omset yang abis kemakan sama biaya?"
    const costToRevenueRatio = safeDiv(totals.cost, totals.revenue) * 100;

    // Mapping konfigurasi cardnya buat dirender di komponen
    return {
      // Pake objek totals buat dibalikin totalsnya
      totals,
      // Array cardnya
      cards: [
        {
          title: "Total Capaian Revenue",
          value: `Rp ${formatBigNumber(totals.revenue)}`,
          // Pake boolean buat buat style di tailwindnya di clasname komponennya
          isPositive: totals.revenue > 0,
          // Pake fungsi formatPct yang baru biar lebih rapi
          label: `${formatPct(grossProfitMarginPct)}% Capaian`,
        },
        {
          title: "Total Cost Direct",
          value: `Rp ${formatBigNumber(totals.cost)}`,
          // Pake kebalikan isOverCost buat status positif aman atau kaga
          // Biaya aman kalo ga ngelebihin revenue dan disinkronkan dengan batas sehat rasio 60%
          isPositive: !isOverCost && costToRevenueRatio <= 60,
          // Pake ternary buat nentuin textnya over atau under budget berdasarkan rasio serapan omset
          label: isOverCost
            ? `Over Budget ${formatPct(costToRevenueRatio - 100)}%`
            : `Under Budget (Memakan ${formatPct(costToRevenueRatio)}% Omset)`,
        },
        {
          title: "Net Profit & Loss",
          value: `Rp ${formatBigNumber(totals.pnl)}`,
          isPositive: totals.pnl >= 0,
          label: totals.pnl >= 0 ? "Margin Aktual" : "Defisit Aktual",
        },
        {
          title: "Cost-to-Revenue Ratio",
          value: `${formatPct(costToRevenueRatio)}%`,
          // Pake batas maksimal 60 persen buat indikator positif
          isPositive: costToRevenueRatio <= 60,
          // Pake ternary buat set label terkendali atau boros
          label:
            costToRevenueRatio <= 60
              ? "Biaya Terkendali"
              : "Boros / Over Budget",
        },
      ],
    };
  }, [filteredPrograms]);

  // Aktif per program berdasarkan filter kategori diatas
  const activeProgramId = useMemo(() => {
    // Kalo ada program yang lagi diselect dan program tersebut ada dikategori yang udah difilter diatas
    if (
      selectedProgramId &&
      // disini some cuma boolean true atau false, bukan array baru kaya filter/find
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
    const bgColors = labels.map((label) =>
      !selectedCategory || label === selectedCategory
        ? "#1f77b4"
        : "rgba(31, 119, 180, 0.15)",
    );

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
  }, [MOCK_PROGRAMS, selectedCategory]);

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
        { data: [prog.revenueCapaian, prog.costDirect, prog.revenueTarget] },
      ],
    };
  }, [MOCK_PROGRAMS, activeProgramId]);

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
      datasets: [{ label: "Positif (Rp)", data: sorted.map((p) => p.pnl) }],
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
          backgroundColor: "#8b0000", // Merah Gelap tunggal
        },
        {
          label: "Terendah (Rp)",
          // Kalo nilainya 0 atao lebih, sisanya null
          data: sorted.map((p) => (p.pnl >= 0 ? p.pnl : null)),
          backgroundColor: "#ff0000", // Merah Terang tunggal
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
        },
        {
          type: "bar",
          label: "Actual Revenue (Rp)",
          data: filteredPrograms.map((p) => p.revenueCapaian),
        },
        {
          type: "line",
          label: "Performa Kinerja (%)",
          data: filteredPrograms.map((p) => p.performaCapaian * 2000000),
          borderColor: "#FFFFFF",
          borderWidth: 2,
          tension: 0.3,
        } as unknown as ChartDataset<"bar">,
      ],
    };
  }, [filteredPrograms]);

  return {
    selectedProgramId,
    setSelectedProgramId,
    selectedCategory,
    setSelectedCategory,
    activeProgramId,
    allProgramData,
    detailProgramData,
    topPnlData,
    bottomPnlData,
    filteredPrograms,
    comboTargetActualData,
    totalKPI,
  };
}
