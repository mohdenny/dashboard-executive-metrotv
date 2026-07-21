import { useState, useMemo } from "react";
// Import hook query dari tanstack buat manage data server
import { useQuery } from "@tanstack/react-query";
// Import fungsi api buat ambil data program sama tipe balesannya
import {
  fetchProgramsByRange,
  FetchProgramsResponse,
} from "@/services/api/programService";
// Import tipe data chart js
import { ChartData } from "chart.js";
// Import skema tipe data program
import { ProgramFormData } from "@/schemas/program";
// Import fungsi helper buat bikin dataset bar
import { createBarDataset } from "@/lib/chartHelpers";
import { formatBigNumber } from "@/lib/formatters";

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
  performanceTV: {
    // Tarjet rating
    targetTVR: 0,
    // Target porsi share
    targetShare: 0,
    // Capaian asli rating
    actualTVR: 0,
    // Capaian asli porsi
    actualShare: 0,
  },
  // Performa digital default nol
  performanceDigital: {
    // Tontonan sosmed
    views: 0,
    // Omset sosmed
    revenue: 0,
  },
  // Finansial default nol
  financials: {
    // Duit modal
    costDirect: 0,
    // Duit target
    revenueTarget: 0,
    // Duit beneran
    revenueActual: 0,
    // Untung bersih
    pnl: 0,
  },
  // Inventori default nol
  inventory: {
    // Sisa slot
    spot: 0,
    // Harga slot
    adRate: 0,
  },
  // Status default strip
  status: "-",
});

// Hook buat handle logic bandingin dua program
export function useCompare() {
  // Ambil koper data program dari api pake usequery
  const {
    // Koper balesan dari api
    data: fetchResult,
    // Status loading
    isLoading,
  } = useQuery<FetchProgramsResponse>({
    // Key cache disamain persis kaya dashboard biar ngirit narik data
    queryKey: ["programsDashboard"],
    // Fungsi panggil api tanpa parameter
    queryFn: () => fetchProgramsByRange(),
  });

  // Ekstrak array program dari dalem koper result atau lepehin array kosong
  const programs = fetchResult?.data || [];

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
      // Tarik bulannya
      (p: ProgramFormData) => p.periods?.map((x) => x.month) || [],
    );
    // Hapus duplikat terus urutin dari yang terbaru
    return Array.from(new Set(all)).sort().reverse();
    // Pantau array programs
  }, [programs]);

  // Cari objek program pertama berdasarkan id
  const progA = useMemo(
    // Cari program yang match sama id pilihan
    () => programs.find((p: ProgramFormData) => p.id === progAId) || null,
    // Dependency list
    [programs, progAId],
  );

  // Cari objek program kedua berdasarkan id
  const progB = useMemo(
    // Cari program yang match sama id pilihan kedua
    () => programs.find((p: ProgramFormData) => p.id === progBId) || null,
    // Dependency list
    [programs, progBId],
  );

  // Ambil data periode aktif program pertama
  const pA = useMemo(() => {
    // Kondisional ngecek kelengkapan balikin null kalo beneran kosong, ato lanjut proses kalo nyata ada
    if (!progA?.periods?.length) return null;
    // Kondisional stop kalo belom milih mending balikin null
    if (!selectedPeriodA) return null;
    // Balikin wujud periode inceran
    return (
      // Gali pake fungsi find
      progA.periods.find((p) => p.month === selectedPeriodA) ||
      // Lempar objek kopong
      emptyPeriod(selectedPeriodA)
    );
    // Pantau
  }, [progA, selectedPeriodA]);

  // Ambil data periode aktif program kedua
  const pB = useMemo(() => {
    // Kondisional ngecek laci kosong balikin null kalo bener kopong, ato eksekusi lanjut kalo beneran isi
    if (!progB?.periods?.length) return null;
    // Kondisional serok periode inceran balikin wujud asli pas nemu, ato cetak null pas belom milih
    if (!selectedPeriodB) return null;
    // Lemparan balik
    return (
      // Gali nyari
      progB.periods.find((p) => p.month === selectedPeriodB) ||
      // Lempar kosong
      emptyPeriod(selectedPeriodB)
    );
    // Pantau
  }, [progB, selectedPeriodB]);

  // Hitung total revenue program pertama
  // Kondisional ngecek ketersediaan data p a balikin gabungan duit tv ama sosmed pas bener ada, ato lempar nol pas kaga nemu
  const totalRevA = pA
    ? // Eksekusi jalan bener
      (pA.financials?.revenueActual ?? 0) +
      (pA.performanceDigital?.revenue ?? 0)
    : // Eksekusi jalur gagal
      0;

  // Hitung roi program pertama
  // Kondisional nentuin hitungan roi a balikin wujud pembagian persenan pas nyata nemu data dan modal ga nol, ato lepehin nol pas palsu
  const roiA =
    pA && (pA.financials?.costDirect ?? 0) > 0
      ? // Hitungan jalan pas beneran ada dan modal nyata
        ((totalRevA - (pA.financials?.costDirect ?? 0)) /
          (pA.financials?.costDirect ?? 0)) *
        100
      : // Tolakan gagal ato modal kosong biar persenan ga meledak
        0;

  // Hitung total revenue program kedua
  // Kondisional nyari cuan b balikin tambeman omset dobel pas data ada, ato kasih nol pas nyatanya kopong
  const totalRevB = pB
    ? // Jalan tol bener
      (pB.financials?.revenueActual ?? 0) +
      (pB.performanceDigital?.revenue ?? 0)
    : // Jalan tolakan
      0;

  // Hitung roi program kedua
  // Kondisional perakit roi b balikin ulikan matematika persen pas komplit dan modal ada, ato sembur angka nol pas kosong
  const roiB =
    pB && (pB.financials?.costDirect ?? 0) > 0
      ? // Rakitan jalan pas modal aman
        ((totalRevB - (pB.financials?.costDirect ?? 0)) /
          (pB.financials?.costDirect ?? 0)) *
        100
      : // Rakitan mati ato ongkos nol biar angka ga bengkak
        0;

  // Fungsi buat swap posisi program dan periodenya
  const handleSwap = () => {
    // Kondisional ngecek posisi ga valid balikin setopan pas dua2nya kosong, ato jalan ampe kelar pas valid
    if (!progAId && !progBId) return;
    // Deklarasi temp swap pake array
    const [currentA, currentB, currentPerA, currentPerB] = [
      // Elemen a
      progAId,
      // Elemen b
      progBId,
      // Elemen periode a
      selectedPeriodA,
      // Elemen periode b
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
    // Kondisional cek dominasi balikin wujud biru pas a juara
    if (valA > valB) return "bg-[#1f77b4]/10 border-[#1f77b4]/30";
    // Kondisional cek lempar warna oren pas b yang juara
    if (valB > valA) return "bg-[#ff7f0e]/10 border-[#ff7f0e]/30";
    // Default style pas kaga ada yang menang netral
    return "bg-card border-border";
  };

  // Fungsi buat atur warna teks pemenang
  const getWinnerTextColor = (
    // Nilai A
    valA: number,
    // Nilai B
    valB: number,
  ) => {
    // Kondisional urusan pewarnaan teks balikin biru spesifik pas a bener nangkring di atas
    if (valA > valB) return "text-[#1f77b4]";
    // Kondisional tiban warna lempar oren pas si b ngerajain klasemen
    if (valB > valA) return "text-[#ff7f0e]";
    // Default teks kalem
    return "text-foreground";
  };

  // Memo buat susun data chart perbandingan
  const comparisonData = useMemo<ChartData<"bar">>(() => {
    // Kondisional penyetop langkah balikin wujud chart json kosong pas salah satu peserta ga nampil
    if (!progA || !progB) return { labels: [], datasets: [] };

    // Balikin objek data buat bar chart
    return {
      // Label sumbu x
      labels: [
        // Label pertama
        "Target Revenue",
        // Label kedua
        "Actual TV Rev",
        // Label ketiga
        "Digital Rev",
        // Label keempat
        "Cost Direct",
        // Label kelima
        "Net PNL",
      ],
      // Dataset buat perbandingan
      datasets: [
        // Dataset program pertama
        createBarDataset(
          // Kirim nama program
          progA.name,
          // Buka array susunan duit
          [
            // Pancing duit target
            pA?.financials?.revenueTarget ?? 0,
            // Pancing cuan nyata
            pA?.financials?.revenueActual ?? 0,
            // Pancing duwit sosmed
            pA?.performanceDigital?.revenue ?? 0,
            // Pancing modal ongkos
            pA?.financials?.costDirect ?? 0,
            // Pancing bersih untung
            pA?.financials?.pnl ?? 0,
          ],
          // biru
          "#1f77b4",
        ),
        // Dataset program kedua
        createBarDataset(
          // Panggil nametag
          progB.name,
          // Susun array kepingan uang
          [
            // Incer untung di depan
            pB?.financials?.revenueTarget ?? 0,
            // Pancing masuk duit beneran
            pB?.financials?.revenueActual ?? 0,
            // Tarik fulus jejaring digital
            pB?.performanceDigital?.revenue ?? 0,
            // Buka ongkos
            pB?.financials?.costDirect ?? 0,
            // Ulik untung bersih
            pB?.financials?.pnl ?? 0,
          ],
          // oren
          "#ff7f0e",
        ),
      ],
    };
    // Pantau variabel
  }, [progA, progB, pA, pB]);

  // Return data dan fungsi buat dipake ui
  return {
    // Array program
    programs,
    // Loader boolean
    isLoading,
    // Id acara a
    progAId,
    // Setter id a
    setProgAId,
    // Id acara b
    progBId,
    // Setter id b
    setProgBId,
    // Obyek utuh acara a
    progA,
    // Obyek utuh acara b
    progB,
    // Periode bulan a
    pA,
    // Periode bulan b
    pB,
    // Hitungan roi a
    roiA,
    // Hitungan roi b
    roiB,
    // Simpanan bulan a
    selectedPeriodA,
    // Setter bulan a
    setSelectedPeriodA,
    // Simpanan bulan b
    selectedPeriodB,
    // Setter bulan b
    setSelectedPeriodB,
    // Array menu dropdown
    periodOptions,
    // Helper bolak balik wujud
    handleSwap,
    // Helper poles tampilan bodi
    getCardStyle,
    // Helper warna tulisan
    getWinnerTextColor,
    // Bungkusan json buat masuk mesin grafik
    comparisonData,
  };
}
