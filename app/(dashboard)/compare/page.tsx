"use client";

import React, { useState, useMemo } from "react";
import {
  GitCompare,
  RefreshCcw,
  ArrowRightLeft,
  TrendingUp,
  Wallet,
  DollarSign,
  Percent,
  Clock,
  Tags,
  Award,
} from "lucide-react";
import { ChartData } from "chart.js";
import BaseChart from "@/components/shared/BaseChart";
import { useQuery } from "@tanstack/react-query";
import { fetchProgramsByRange } from "@/services/api/programService";

export default function CompareProgramPage() {
  // Ambil data program dari API pake useQuery
  // Kalo data belum dapet, defaultnya array kosong []. isLoading bakal true selama proses fetch.
  const { data: programs = [], isLoading } = useQuery({
    // Key unik buat nyimpen cache data ini, ibarat nama map/folder di dalem memori React Query
    queryKey: ["programs", "compare"],
    // Fungsi asinkron buat manggil endpoint API-nya
    queryFn: () => fetchProgramsByRange("", ""),
  });

  // Bikin state buat nyimpen ID program pertama (Program A) yang dipilih user
  const [progAId, setProgAId] = useState<string>("");
  // Bikin state buat nyimpen ID program kedua (Program B) yang dipilih user
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
  const roiA = progA
    ? ((progA.revenueCapaian - progA.costDirect) / (progA.costDirect || 1)) *
      100
    : 0;
  // Itung ROI buat program B juga pake rumus yang sama persis
  const roiB = progB
    ? ((progB.revenueCapaian - progB.costDirect) / (progB.costDirect || 1)) *
      100
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
      labels: ["Target Revenue", "Actual Revenue", "Cost Direct", "Net PNL"],
      datasets: [
        {
          // Data bar kelompok pertama buat Program A
          label: progA.name,
          // Urutan angka ini harus sama persis posisinya kaya urutan 'labels' di atas
          data: [
            progA.revenueTarget,
            progA.revenueCapaian,
            progA.costDirect,
            progA.pnl,
          ],
          // Kasih warna biru buat chart bar Program A
          backgroundColor: "#1f77b4",
        },
        {
          // Data bar kelompok kedua buat Program B
          label: progB.name,
          data: [
            progB.revenueTarget,
            progB.revenueCapaian,
            progB.costDirect,
            progB.pnl,
          ],
          // Kasih warna oranye buat chart bar Program B
          backgroundColor: "#ff7f0e",
        },
      ],
    };
    // Chart cuma di-generate ulang kalo data program A atau B ganti
  }, [progA, progB]);

  // Kalo data masih loading narik dari API, tampilin animasi muter-muter aja
  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center h-[60vh]">
        <RefreshCcw className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    // Bungkus container paling luar, dikasih max-width biar tampilannya ga melebar sampe mentok di layar gede
    <div className="p-4 md:px-8 space-y-6 max-w-[1800px] mx-auto animate-in fade-in duration-300">
      {/* Bagian Header / Judul Halaman */}
      {/* <div className="flex items-center gap-4 border-b border-border/50 pb-6 border-2 border-slate-300">
        <div className="p-3 bg-secondary text-secondary-foreground rounded-2xl">
          <GitCompare size={28} />
        </div>
        <div>
          <h1 className="text-2xl font-normal tracking-tight text-foreground">
            Head-to-Head Comparison
          </h1>
          <p className="text-sm text-muted-foreground font-medium">
            BOD View: Komparasi finansial dan performa dua program secara
            langsung.
          </p>
        </div>
      </div> */}

      {/* AREA FILTER SELECTOR (Bagian milih program) */}
      <div className="bg-card p-6 rounded-2xl shadow-sm border-2 border-purple-700 flex flex-col md:flex-row items-center gap-6 justify-between">
        {/* Kolom Dropdown Program A */}
        <div className="w-full flex-1">
          <label className="text-base font-bold text-primary uppercase tracking-wider mb-2 block">
            Pilih Program
          </label>
          {/* Pas user ganti opsi, masukin ID program yang dipilih ke dalem state progAId */}
          <div className="relative inline-block w-full">
            <select
              value={progAId}
              onChange={(e) => setProgAId(e.target.value)}
              className="appearance-none w-full bg-muted border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">-- Pilih Program Pertama --</option>
              {/* Looping semua data program dari API buat dijadiin opsi di select */}
              {programs.map((p) => (
                <option key={`A-${p.id}`} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>

            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-foreground/70">
              <svg
                xmlns="http://w3.org"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Tombol Swap Buat Nuker Posisi Kiri-Kanan */}
        <button
          onClick={handleSwap}
          title="Tukar Posisi"
          className="shrink-0 p-3 bg-muted hover:bg-primary/20 hover:text-primary transition-colors rounded-full text-muted-foreground mt-4 md:mt-0 cursor-pointer shadow-sm active:scale-95"
        >
          <ArrowRightLeft size={20} />
        </button>

        {/* Kolom Dropdown Program kedua */}
        <div className="w-full flex-1">
          <label className="text-base font-bold text-primary uppercase tracking-wider mb-2 block">
            Pilih Program
          </label>
          {/* Mekanismenya sama kaya Program diatas, tapi nge-set state progBId */}
          <div className="relative inline-block w-full">
            <select
              value={progBId}
              onChange={(e) => setProgBId(e.target.value)}
              className="appearance-none w-full bg-muted border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="">-- Pilih Program Kedua --</option>
              {/* Looping program lagi buat dropdown kedua */}
              {programs.map((p) => (
                <option key={`B-${p.id}`} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>

            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-foreground/70">
              <svg
                xmlns="http://w3.org"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Validasi: Kalo salah satu program belum dipilih, jangan render datanya dulu, kasih tulisan peringatan */}
      {!progA || !progB ? (
        <div className="text-center py-20 text-muted-foreground bg-card rounded-2xl border border-dashed border-border">
          Silakan pilih kedua program di atas untuk melihat komparasi.
        </div>
      ) : (
        // Kalo dua-duanya udah terisi (dipilih), render dashboard komparasinya
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 border-2 border-cyan-700">
          {/* Area chart komparasi (Ngambil porsi 8 dari total 12 kolom layout grid) */}
          <div className="lg:col-span-8 bg-card shadow-sm rounded-2xl border-2 border-red-500 flex flex-col p-2 min-h-[400px]">
            <BaseChart
              // Jenis chartnya batang
              type="bar"
              title={`Komparasi Finansial: ${progA.name} vs ${progB.name}`}
              // Lempar data yang udah dihitung di useMemo atas tadi
              data={comparisonData}
              height={300}
            />
          </div>

          {/* AREA KARTU KPI HIGHLIGHTS (Ngambil sisa porsi 4 kolom di bagian kanan) */}
          <div className="lg:col-span-4 bg-card shadow-sm rounded-2xl border-2 border-blue-500 flex flex-col p-4 gap-4">
            {/* Card 1: Info Pemenang Net PNL */}
            {/* Tembakin nilai PNL ke getCardStyle biar warna background kartunya otomatis berubah */}
            <div
              className={`flex-1 p-5 rounded-2xl border-2 flex flex-col justify-center transition-colors duration-300 ${getCardStyle(progA.pnl, progB.pnl)}`}
            >
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Wallet size={14} /> Pemenang Net PNL
              </span>
              {/* Tembakin juga ke getWinnerTextColor biar teks judulnya nyambung warnanya */}
              <span
                className={`text-2xl font-bold ${getWinnerTextColor(progA.pnl, progB.pnl)}`}
              >
                {/* Logika nampilin siapa yang menang dari perbandingan angka PNL */}
                {progA.pnl > progB.pnl
                  ? progA.name
                  : progB.pnl > progA.pnl
                    ? progB.name
                    : "Seimbang"}
              </span>
              <span className="text-sm font-medium mt-1">
                {/* Math.abs kepake biar angkanya tetep positif pas dikurangin (kalo B lebih gede dari A, ga ada minusnya) */}
                Selisih: Rp{" "}
                {Math.abs(progA.pnl - progB.pnl).toLocaleString("id-ID")}
              </span>
            </div>

            {/* Card 2: Info Pemenang ROI (Efisiensi Modal) */}
            <div
              className={`flex-1 p-5 rounded-2xl border-2 flex flex-col justify-center transition-colors duration-300 ${getCardStyle(roiA, roiB)}`}
            >
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Percent size={14} /> Pemenang ROI (Efisiensi)
              </span>
              <span
                className={`text-2xl font-bold ${getWinnerTextColor(roiA, roiB)}`}
              >
                {roiA > roiB
                  ? progA.name
                  : roiB > roiA
                    ? progB.name
                    : "Seimbang"}
              </span>
              <span className="text-sm font-medium mt-1">
                {/* Cari persentase yang paling gede, terus potong jadi 1 angka di belakang koma pake toFixed() */}
                ROI: {Math.max(roiA, roiB).toFixed(1)}%
              </span>
            </div>

            {/* Card 3: Info Pemenang Performa Capaian */}
            <div
              className={`flex-1 p-5 rounded-2xl border-2 flex flex-col justify-center transition-colors duration-300 ${getCardStyle(progA.performaCapaian, progB.performaCapaian)}`}
            >
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <TrendingUp size={14} /> Pemenang Performa
              </span>
              <span
                className={`text-2xl font-bold ${getWinnerTextColor(progA.performaCapaian, progB.performaCapaian)}`}
              >
                {progA.performaCapaian > progB.performaCapaian
                  ? progA.name
                  : progB.performaCapaian > progA.performaCapaian
                    ? progB.name
                    : "Seimbang"}
              </span>
              <span className="text-sm font-medium mt-1">
                Capaian Maks:{" "}
                {Math.max(progA.performaCapaian, progB.performaCapaian)}%
              </span>
            </div>
          </div>

          {/* AREA DETAIL TABEL (Ngambil full width 12 kolom biar panjang) */}
          <div className="lg:col-span-12 bg-card shadow-sm rounded-2xl border-2 border-teal-500 p-2 mt-2">
            <div className="p-4 border-b border-border bg-muted/20 rounded-t-xl">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <Award size={18} /> Detail Komparasi Metrik Parameter
              </h3>
            </div>
            {/* Bungkus ini biar tabelnya bisa digeser/scroll ke samping pas dibuka lewat HP */}
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-sm whitespace-nowrap">
                {/* Header Tabel */}
                <thead className="bg-muted/50 text-muted-foreground uppercase text-base tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Parameter Spesifik</th>
                    {/* Tarik dinamis dari objek supaya judul tabel sesuai nama yang dipilih */}
                    <th className="px-6 py-4 font-bold text-[#1f77b4]">
                      {progA.name}
                    </th>
                    <th className="px-6 py-4 font-bold text-[#ff7f0e]">
                      {progB.name}
                    </th>
                    <th className="px-6 py-4 text-center">Analisis</th>
                  </tr>
                </thead>
                {/* Isi Data Tabel */}
                <tbody className="divide-y divide-border">
                  {/* Baris Kategori & Jam Tayang */}
                  <tr className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4 text-base font-medium flex items-center gap-2">
                      <Tags size={16} className="text-muted-foreground" />{" "}
                      Kategori & Jam
                    </td>
                    <td className="px-6 py-4 text-base">
                      Kategori {progA.category} ({progA.broadcastTime})
                    </td>
                    <td className="px-6 py-4 text-base">
                      Kategori {progB.category} ({progB.broadcastTime})
                    </td>
                    <td className="px-6 py-4 text-base text-center text-muted-foreground">
                      -
                    </td>
                  </tr>

                  {/* Baris Ketersediaan Slot Iklan (Inventory) */}
                  <tr className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4 text-base font-medium flex items-center gap-2">
                      <Clock size={16} className="text-muted-foreground" />{" "}
                      Inventory Spot
                    </td>
                    <td className="px-6 py-4 text-base">
                      {progA.inventorySpot} Slot @ Rp{" "}
                      {progA.rateIklan.toLocaleString("id-ID")}
                    </td>
                    <td className="px-6 py-4 text-base">
                      {progB.inventorySpot} Slot @ Rp{" "}
                      {progB.rateIklan.toLocaleString("id-ID")}
                    </td>
                    {/* Cek siapa yang punya slot (kapasitas) lebih gede buat nampilin pemenangnya */}
                    <td className="px-6 py-4 text-base text-center">
                      {progA.inventorySpot > progB.inventorySpot ? (
                        <span className="text-[#1f77b4] font-bold">
                          {progA.name} Kapasitas Lebih Besar
                        </span>
                      ) : progB.inventorySpot > progA.inventorySpot ? (
                        <span className="text-[#ff7f0e] font-bold">
                          {progB.name} Kapasitas Lebih Besar
                        </span>
                      ) : (
                        "Kapasitas Sama"
                      )}
                    </td>
                  </tr>

                  {/* Baris Modal Pengeluaran (Cost Direct) */}
                  <tr className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4 text-base font-medium flex items-center gap-2">
                      <Wallet size={16} className="text-muted-foreground" />{" "}
                      Cost Direct (Modal)
                    </td>
                    {/* Gunakan toLocaleString buat kasih titik pemisah ribuan otomatis (format Rupiah) */}
                    <td className="px-6 py-4 text-base">
                      Rp {progA.costDirect.toLocaleString("id-ID")}
                    </td>
                    <td className="px-6 py-4 text-base">
                      Rp {progB.costDirect.toLocaleString("id-ID")}
                    </td>
                    <td className="px-6 py-4 text-base text-center">
                      {/* Khusus cost (pengeluaran), logika berbalik: angka KECIL yang lebih hemat/menang */}
                      {progA.costDirect < progB.costDirect ? (
                        <span className="text-[#1f77b4] font-bold">
                          {progA.name} Lebih Hemat
                        </span>
                      ) : progB.costDirect < progA.costDirect ? (
                        <span className="text-[#ff7f0e] font-bold">
                          {progB.name} Lebih Hemat
                        </span>
                      ) : (
                        "Modal Sama Besar"
                      )}
                    </td>
                  </tr>

                  {/* Baris Pendapatan Bersih (Revenue Aktual) */}
                  <tr className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4 text-base font-medium flex items-center gap-2">
                      <DollarSign size={16} className="text-muted-foreground" />{" "}
                      Revenue Aktual
                    </td>
                    <td className="px-6 py-4">
                      Rp {progA.revenueCapaian.toLocaleString("id-ID")}
                    </td>
                    <td className="px-6 py-4">
                      Rp {progB.revenueCapaian.toLocaleString("id-ID")}
                    </td>
                    <td className="px-6 py-4 text-base text-center">
                      {progA.revenueCapaian > progB.revenueCapaian ? (
                        <span className="text-[#1f77b4] font-bold">
                          {progA.name} Pendapatan Lebih Besar
                        </span>
                      ) : progB.revenueCapaian > progA.revenueCapaian ? (
                        <span className="text-[#ff7f0e] font-bold">
                          {progB.name} Pendapatan Lebih Besar
                        </span>
                      ) : (
                        "Pendapatan Sama"
                      )}
                    </td>
                  </tr>

                  {/* Baris Perbandingan ROI */}
                  <tr className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4 text-base font-medium flex items-center gap-2">
                      <Percent size={16} className="text-muted-foreground" />{" "}
                      ROI (Efisiensi Modal)
                    </td>
                    <td className="px-6 py-4 text-base font-bold">
                      {roiA.toFixed(1)}%
                    </td>
                    <td className="px-6 py-4 text-base font-bold">
                      {roiB.toFixed(1)}%
                    </td>
                    <td className="px-6 py-4 text-base text-center">
                      {roiA > roiB ? (
                        <span className="text-[#1f77b4] font-bold">
                          {progA.name} Margin Lebih Baik
                        </span>
                      ) : roiB > roiA ? (
                        <span className="text-[#ff7f0e] font-bold">
                          {progB.name} Margin Lebih Baik
                        </span>
                      ) : (
                        "Efisiensi Sama"
                      )}
                    </td>
                  </tr>

                  {/* Baris Persentase Kinerja Terhadap Target */}
                  <tr className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4 text-base font-medium flex items-center gap-2">
                      <TrendingUp size={16} className="text-muted-foreground" />{" "}
                      Performa Kinerja
                    </td>
                    <td className="px-6 py-4 text-base">
                      {progA.performaCapaian}%{" "}
                      <span className="text-xs text-muted-foreground">
                        (Target {progA.performaTarget}%)
                      </span>
                    </td>
                    <td className="px-6 py-4 text-base">
                      {progB.performaCapaian}%{" "}
                      <span className="text-xs text-muted-foreground">
                        (Target {progB.performaTarget}%)
                      </span>
                    </td>
                    <td className="px-6 py-4 text-base text-center">
                      {progA.performaCapaian > progB.performaCapaian ? (
                        <span className="text-[#1f77b4] font-bold">
                          {progA.name} Lebih Efektif
                        </span>
                      ) : progB.performaCapaian > progA.performaCapaian ? (
                        <span className="text-[#ff7f0e] font-bold">
                          {progB.name} Lebih Efektif
                        </span>
                      ) : (
                        "Efektivitas Sama"
                      )}
                    </td>
                  </tr>

                  {/* Baris Terakhir: Highlight Net Profit Margin */}
                  {/* Kasih background warna beda (bg-muted/30) biar kerasa kaya bagian totalan kasir */}
                  <tr className="bg-muted/30">
                    <td className="px-6 py-4 font-bold flex items-center gap-2">
                      <GitCompare size={16} className="text-primary" /> Net
                      Profit Margin
                    </td>
                    {/* Cek PNL: Kalo angkanya positif/nol warnanya jadi hijau, kalo negatif (rugi) ganti warna teks jadi merah/destructive */}
                    <td
                      className={`px-6 py-4 font-bold text-lg ${progA.pnl >= 0 ? "text-green-600" : "text-destructive"}`}
                    >
                      Rp {progA.pnl.toLocaleString("id-ID")}
                    </td>
                    <td
                      className={`px-6 py-4 font-bold text-lg ${progB.pnl >= 0 ? "text-green-600" : "text-destructive"}`}
                    >
                      Rp {progB.pnl.toLocaleString("id-ID")}
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-lg">
                      {progA.pnl > progB.pnl ? (
                        <span className="text-[#1f77b4]">
                          WINNER: {progA.name}
                        </span>
                      ) : progB.pnl > progA.pnl ? (
                        <span className="text-[#ff7f0e]">
                          WINNER: {progB.name}
                        </span>
                      ) : (
                        "SERI"
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
