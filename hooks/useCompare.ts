import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchProgramsByRange } from "@/services/api/programService";
import { ChartData } from "chart.js";

export function useCompare() {
  // Ambil data program dari API pake useQuery
  // Kalo data belum dapet, defaultnya array kosong []. isLoading bakal true selama proses fetch.
  const { data: programs = [], isLoading } = useQuery({
    // Key unik buat nyimpen cache data ini, ibarat nama map/folder di dalem memori React Query
    queryKey: ["programs"],
    // Fungsi asinkron buat manggil endpoint API-nya
    queryFn: () => fetchProgramsByRange("", ""),
  });

  // Bikin state buat nyimpen id program pertama (Program A) yang dipilih user
  const [progAId, setProgAId] = useState<string>("");
  // Bikin state buat nyimpen id program kedua (Program B) yang dipilih user
  const [progBId, setProgBId] = useState<string>("");

  // Pake useMemo biar pencarian objek program A nggak dirender ulang terus-terusan
  // Bakal nyari data ulang cuma kalo isi array 'programs' atau 'progAId' berubah
  const progA = useMemo(
    () => programs.find((p) => p.id === progAId) || null,
    [programs, progAId],
  );
  // Sama kaya di atas, tapi ini buat nyari full data objek program B
  const progB = useMemo(
    () => programs.find((p) => p.id === progBId) || null,
    [programs, progBId],
  );

  // Kalkulasi ROI (Return on Investment) = ((Revenue - Cost) / Cost) * 100
  // Kalo progA ada datanya, itung persentase ROI. Kalo costDirect nol, bagi sama 1 biar ga error 'Infinity'
  const totalRevA = progA
    ? (progA.revenueCapaian || 0) + (progA.digitalRevenue || 0)
    : 0;
  const roiA = progA
    ? ((totalRevA - progA.costDirect) / (progA.costDirect || 1)) * 100
    : 0;

  // Itung ROI buat program B juga pake rumus yang sama persis
  const totalRevB = progB
    ? (progB.revenueCapaian || 0) + (progB.digitalRevenue || 0)
    : 0;
  const roiB = progB
    ? ((totalRevB - progB.costDirect) / (progB.costDirect || 1)) * 100
    : 0;

  // Fungsi buat nuker posisi Program A sama Program B pas tombol swap diklik
  const handleSwap = () => {
    // Kalo dua-duanya kosong, gausah ngapa-ngapain
    if (!progAId && !progBId) return;

    const currentA = progAId;
    const currentB = progBId;

    // Tuker statenya
    setProgAId(currentB);
    setProgBId(currentA);
  };

  // Helper buat ngatur warna background card secara otomatis berdasarkan siapa yang nilainya lebih gede
  // Program A menang = warna biru. Program B menang = warna oranye. Seri = warna standar.
  const getCardStyle = (valA: number, valB: number) => {
    if (valA > valB) return "bg-[#1f77b4]/10 border-[#1f77b4]/30";
    if (valB > valA) return "bg-[#ff7f0e]/10 border-[#ff7f0e]/30";
    // Kalo angkanya persis sama alias Seri / Seimbang
    return "bg-card border-border";
  };

  // Helper buat ngatur warna teks tulisan pemenangnya. Logikanya sama plek kaya fungsi di atas.
  const getWinnerTextColor = (valA: number, valB: number) => {
    if (valA > valB) return "text-[#1f77b4]";
    if (valB > valA) return "text-[#ff7f0e]";
    // Seri / Seimbang
    return "text-foreground";
  };

  // Bikin struktur data buat Grouped Bar Chart yang nampilin komparasi target, revenue, cost, pnl
  const comparisonData = useMemo<ChartData<"bar">>(() => {
    // Kalo salah satu program belum dipilih, balikin data kosong biar chart ga error
    if (!progA || !progB) return { labels: [], datasets: [] };
    return {
      // Label buat sumbu X (kategori di bawah chart)
      labels: [
        "Target Revenue",
        "Actual TV Rev",
        "Digital Rev",
        "Cost Direct",
        "Net PNL",
      ],
      datasets: [
        {
          // Data bar kelompok pertama buat Program A
          label: progA.name,
          // Urutan angka ini harus sama persis posisinya kaya urutan 'labels' di atas
          data: [
            progA.revenueTarget,
            progA.revenueCapaian,
            progA.digitalRevenue || 0,
            progA.costDirect,
            progA.pnl,
          ],
          // Kasih warna biru buat chart bar Program A
          backgroundColor: "#1f77b4",
          minBarLength: 15,
        },
        {
          // Data bar kelompok kedua buat Program B
          label: progB.name,
          data: [
            progB.revenueTarget,
            progB.revenueCapaian,
            progB.digitalRevenue || 0,
            progB.costDirect,
            progB.pnl,
          ],
          // Kasih warna oranye buat chart bar Program B
          backgroundColor: "#ff7f0e",
          minBarLength: 15,
        },
      ],
    };
    // Chart cuma di-generate ulang kalo data program A atau B ganti
  }, [progA, progB]);

  return {
    programs,
    isLoading,
    progAId,
    setProgAId,
    progBId,
    setProgBId,
    progA,
    progB,
    roiA,
    roiB,
    handleSwap,
    getCardStyle,
    getWinnerTextColor,
    comparisonData,
  };
}
