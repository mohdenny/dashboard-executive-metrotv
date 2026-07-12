"use client";

import React, { useMemo } from "react";
// Import icon dari lucide react
import {
  GitCompare,
  TrendingUp,
  Wallet,
  Banknote,
  Percent,
  Clock,
  Tags,
  Award,
  Tv,
  MonitorPlay,
  RefreshCcw,
  ArrowRightLeft,
  ArrowUpRight,
  ArrowDownRight,
  Download,
} from "lucide-react";
// Import komponen pembungkus chart
import ChartCard from "@/components/shared/ChartCard";
// Import hook khusus buat urusan komparasi
import { useCompare } from "@/hooks/useCompare";
// Import helper spesialis nyingkat angka
import { formatBigNumber } from "@/lib/formatters";
// Import dropdown costum
import CustomSelect from "@/components/shared/CustomSelect";
// Import komponen judul page
import PageHeader from "@/components/shared/PageHeader";
// Import komponen smarttable
import SmartTable from "@/components/shared/SmartTable";
// Import kang excel buat export
import * as XLSX from "xlsx";

// Helper kang ekstrak teks polosan dari daleman node react
const extractText = (node: any): string => {
  // Kalo kosong balikin string hampa
  if (node == null) return "";
  // Kalo wujudnya udah string ato angka langsung balikin
  if (typeof node === "string" || typeof node === "number") return String(node);
  // Kalo bentuknya array, urai terus gabungin
  if (Array.isArray(node)) return node.map(extractText).join("");
  // Kalo bentuknya objek react (ada props.children), gali terus ke dalem
  if (node.props && node.props.children)
    return extractText(node.props.children);
  // Sisanya balikin kosong aja
  return "";
};

// Bikin trus ekspor fungsi page compare
export default function CompareContent() {
  // Bongkar semua state ama fungsi dari wadah hook usecompare
  const {
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
  } = useCompare();

  // Bikin wadah memori buat nyimpen susunan baris2 tabel komparasi
  const tableRows = useMemo(() => {
    // Filter kalo program a ato b belom kepilih mending balikin array kosong
    if (!progA || !progB) return [];

    // Tarik capaian share program a ato nol kalo kosong
    const capaianShareA = pA?.performanceTV?.actualShare ?? 0;
    // Tarik capaian share program b ato nol kalo kosong
    const capaianShareB = pB?.performanceTV?.actualShare ?? 0;

    // Tarik jumlah views digital program a
    const digitalViewsA = pA?.performanceDigital?.views ?? 0;
    // Tarik jumlah views digital program b
    const digitalViewsB = pB?.performanceDigital?.views ?? 0;

    // Tarik sisa slot iklan program a
    const inventorySpotA = pA?.inventory?.spot ?? 0;
    // Tarik sisa slot iklan program b
    const inventorySpotB = pB?.inventory?.spot ?? 0;

    // Tarik total modal yang dikeluarin program a
    const costDirectA = pA?.financials?.costDirect ?? 0;
    // Tarik total modal yang dikeluarin program b
    const costDirectB = pB?.financials?.costDirect ?? 0;

    // Tarik duit masuk aslinya program a
    const revenueCapaianA = pA?.financials?.revenueActual ?? 0;
    // Tarik duit masuk aslinya program b
    const revenueCapaianB = pB?.financials?.revenueActual ?? 0;

    // Tarik untung rugi pnl program a
    const pnlA = pA?.financials?.pnl ?? 0;
    // Tarik untung rugi pnl program b
    const pnlB = pB?.financials?.pnl ?? 0;

    // Balikin array utuh isi baris2 tabel
    return [
      {
        // Pasang id unik buat key
        id: "kategori",
        // Pasang icon tag
        icon: Tags,
        // Label teks di kolom pertama
        label: "Kategori & Jam",
        // Isi teks buat program a
        valA: `Kategori ${progA.category} (${progA.broadcastTime})`,
        // Isi teks buat program b
        valB: `Kategori ${progB.category} (${progB.broadcastTime})`,
        // Analisis kosongin aja pake strip
        analysis: (
          <span className="text-muted-foreground text-center block">-</span>
        ),
        // Matiin highlight
        isHighlight: false,
      },
      {
        id: "performa_tv",
        icon: Tv,
        label: "Performa TV (TVR / Share)",
        valA: `TVR: ${pA?.performanceTV?.actualTVR ?? 0} (Target: ${pA?.performanceTV?.targetTVR ?? 0}) | Share: ${capaianShareA} (Target: ${pA?.performanceTV?.targetShare ?? 0})`,
        valB: `TVR: ${pB?.performanceTV?.actualTVR ?? 0} (Target: ${pB?.performanceTV?.targetTVR ?? 0}) | Share: ${capaianShareB} (Target: ${pB?.performanceTV?.targetShare ?? 0})`,
        analysis: (
          <div className="text-center">
            {capaianShareA > capaianShareB ? (
              <span className="text-[#1f77b4] font-bold">
                {progA.name} penonton TVnya lebih banyak
              </span>
            ) : capaianShareB > capaianShareA ? (
              <span className="text-[#ff7f0e] font-bold">
                {progB.name} penonton TVnya lebih banyak
              </span>
            ) : (
              "Penonton TV sama banyak"
            )}
          </div>
        ),
        isHighlight: false,
      },
      {
        id: "performa_digital",
        icon: MonitorPlay,
        label: "Performa Digital",
        valA: `${formatBigNumber(digitalViewsA)} Views | Rp ${formatBigNumber(pA?.performanceDigital?.revenue ?? 0)}`,
        valB: `${formatBigNumber(digitalViewsB)} Views | Rp ${formatBigNumber(pB?.performanceDigital?.revenue ?? 0)}`,
        analysis: (
          <div className="text-center">
            {digitalViewsA > digitalViewsB ? (
              <span className="text-[#1f77b4] font-bold">
                {progA.name} penonton sosmednya lebih rame
              </span>
            ) : digitalViewsB > digitalViewsA ? (
              <span className="text-[#ff7f0e] font-bold">
                {progB.name} penonton sosmednya lebih rame
              </span>
            ) : (
              "Penonton sosmed sama rame"
            )}
          </div>
        ),
        isHighlight: false,
      },
      {
        id: "inventory",
        icon: Clock,
        label: "Inventory Spot",
        valA: `${inventorySpotA} Slot @ Rp ${formatBigNumber(pA?.inventory?.adRate ?? 0)}`,
        valB: `${inventorySpotB} Slot @ Rp ${formatBigNumber(pB?.inventory?.adRate ?? 0)}`,
        analysis: (
          <div className="text-center">
            {inventorySpotA > inventorySpotB ? (
              <span className="text-[#1f77b4] font-bold">
                {progA.name} slot iklannya lebih banyak
              </span>
            ) : inventorySpotB > inventorySpotA ? (
              <span className="text-[#ff7f0e] font-bold">
                {progB.name} slot iklannya lebih banyak
              </span>
            ) : (
              "Slot iklan sama banyak"
            )}
          </div>
        ),
        isHighlight: false,
      },
      {
        id: "cost",
        icon: Wallet,
        label: "Cost Direct (Modal)",
        valA: `Rp ${formatBigNumber(costDirectA)}`,
        valB: `Rp ${formatBigNumber(costDirectB)}`,
        analysis: (
          <div className="text-center">
            {costDirectA < costDirectB ? (
              <span className="text-[#1f77b4] font-bold">
                {progA.name} modalnya lebih murah
              </span>
            ) : costDirectB < costDirectA ? (
              <span className="text-[#ff7f0e] font-bold">
                {progB.name} modalnya lebih murah
              </span>
            ) : (
              "Modalnya sama aja"
            )}
          </div>
        ),
        isHighlight: false,
      },
      {
        id: "revenue",
        icon: Banknote,
        label: "Capaian Revenue",
        valA: `Rp ${formatBigNumber(revenueCapaianA)}`,
        valB: `Rp ${formatBigNumber(revenueCapaianB)}`,
        analysis: (
          <div className="text-center">
            {revenueCapaianA > revenueCapaianB ? (
              <span className="text-[#1f77b4] font-bold">
                {progA.name} dapet duit lebih gede
              </span>
            ) : revenueCapaianB > revenueCapaianA ? (
              <span className="text-[#ff7f0e] font-bold">
                {progB.name} dapet duit lebih gede
              </span>
            ) : (
              "Pemasukannya sama"
            )}
          </div>
        ),
        isHighlight: false,
      },
      {
        id: "roi",
        icon: Percent,
        label: "ROI (Efisiensi Modal)",
        valA: <span className="font-bold">{roiA.toFixed(1)}%</span>,
        valB: <span className="font-bold">{roiB.toFixed(1)}%</span>,
        analysis: (
          <div className="text-center">
            {roiA > roiB ? (
              <span className="text-[#1f77b4] font-bold">
                {progA.name} persentase untungnya lebih gede
              </span>
            ) : roiB > roiA ? (
              <span className="text-[#ff7f0e] font-bold">
                {progB.name} persentase untungnya lebih gede
              </span>
            ) : (
              "Untungnya seimbang"
            )}
          </div>
        ),
        isHighlight: false,
      },
      {
        id: "pnl",
        icon: GitCompare,
        label: "Net Profit Margin",
        valA: (
          <span
            className={`text-lg font-bold ${pnlA >= 0 ? "text-green-600" : "text-destructive"}`}
          >
            Rp {formatBigNumber(pnlA)}
          </span>
        ),
        valB: (
          <span
            className={`text-lg font-bold ${pnlB >= 0 ? "text-green-600" : "text-destructive"}`}
          >
            Rp {formatBigNumber(pnlB)}
          </span>
        ),
        analysis: (
          <div className="text-center text-lg font-bold">
            {pnlA > pnlB ? (
              <span className="text-[#1f77b4]">
                {pnlA < 0
                  ? `${progA.name} ruginya lebih dikit`
                  : `${progA.name} Paling Cuan!`}
              </span>
            ) : pnlB > pnlA ? (
              <span className="text-[#ff7f0e]">
                {pnlB < 0
                  ? `${progB.name} ruginya lebih dikit`
                  : `${progB.name} Paling Cuan!`}
              </span>
            ) : pnlA < 0 ? (
              "Sama sama rugi"
            ) : (
              "Cuannya Seri"
            )}
          </div>
        ),
        // Highlight baris ini nyalain highlight
        isHighlight: true,
      },
    ];
  }, [progA, progB, pA, pB, roiA, roiB]);

  // Bikin susunan kolom buat disodorin ke smart table
  const compareColumns = useMemo(() => {
    // Kalo belom ada data program mending balikin array kosong
    if (!progA || !progB) return [];

    // Balikin array tiang kolom
    return [
      {
        // Judul th
        header: "Parameter Spesifik",
        // Key id data
        accessorKey: "label",
        // Render custom biar icon ikut nampil
        render: (item: any) => (
          // Flex row buat icon ama teks
          <div className="font-medium flex items-center gap-2">
            {/* Panggil icon dari data baris */}
            <item.icon
              size={16}
              // Atur warna dinamis ngecek highlight
              className={
                item.isHighlight ? "text-primary" : "text-muted-foreground"
              }
            />
            {/* Teks labelnya */}
            {item.label}
          </div>
        ),
      },
      {
        // Tulis dinamis nama program a
        header: progA.name,
        // Key id data val a
        accessorKey: "valA",
        // Render utuh val a
        render: (item: any) => item.valA,
      },
      {
        // Tulis dinamis b
        header: progB.name,
        // Key id data val b
        accessorKey: "valB",
        // Render utuh val b
        render: (item: any) => item.valB,
      },
      {
        // Judul
        header: "Analisis",
        // Key id data analisis
        accessorKey: "analysis",
        // Render utuh analisa
        render: (item: any) => item.analysis,
      },
    ];
    // Pantau program a ama b
  }, [progA, progB]);

  // Fungsi penarik export excel nyomot tabel komparasi ui
  const handleExport = () => {
    // Kalo data kosong ato acara belom dipilih batalin aja
    if (!progA || !progB || tableRows.length === 0) return;

    // Rakit isi barisan per baris buat jadi data lembaran
    const exportData = tableRows.map((row) => ({
      // Pasang parameter spesifik
      "Parameter Spesifik": row.label,
      // Pasang nilai a ekstrak teksnya
      [progA.name]: extractText(row.valA),
      // Pasang nilai b ekstrak teksnya
      [progB.name]: extractText(row.valB),
      // Pasang string analisa
      Analisis: extractText(row.analysis),
    }));

    // Sulap array of object jadi lembaran worksheet
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    // Bikin buku kerja excel baru
    const workbook = XLSX.utils.book_new();
    // Tempelin lembaran ke buku
    XLSX.utils.book_append_sheet(workbook, worksheet, "Compare_Data");
    // Perintah unduh filenya
    XLSX.writeFile(workbook, `Komparasi_${progA.name}_vs_${progB.name}.xlsx`);
  };

  // Filter kalo state isloading lagi ngegantung narik data
  if (isLoading) {
    // Balikin komponen muter2 aja dulu
    return (
      <div className="p-8 flex items-center justify-center h-[60vh]">
        {/* Panggil icon refresh terus disuruh animasi */}
        <RefreshCcw className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  // Balikin ui utamanya
  return (
    // Wadah bungkus polosan layar
    <div className="p-4 md:px-8 md:py-6 space-y-6 max-w-[1800px] mx-auto animate-in fade-in duration-300">
      {/* Header container dengan flex buat misahin kiri kanan */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 border-b border-border/50 pb-6">
        {/* Sisi kiri, icon dan Judul udah diganti pake komponen PageHeader ditambah tombol donlod */}
        <PageHeader
          icon={GitCompare}
          title="Perbandingan Program"
          description="Analisis komparatif TVR, Share, dan Net PNL"
          // Selipin tombol donlod di area kanan prop
          rightContent={
            <button
              // Lempar ke pawangnya
              onClick={handleExport}
              // Bekuin kalo belom lengkap milihnya
              disabled={!progA || !progB}
              // bentuk tombolnya
              className="flex items-center gap-2 bg-primary text-primary-foreground cursor-pointer px-4 py-2.5 rounded-full text-sm font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm w-full sm:w-auto justify-center"
            >
              {/* Icon panah bawah */}
              <Download size={16} /> Export Excel
            </button>
          }
        />

        {/* Sisi kanan, summery card pnl ala page detail disembunyikan pakai komentar
        <div className="flex flex-col items-start lg:items-end gap-2 w-full lg:w-auto">
          <div className="flex flex-col items-start lg:items-end">
            <span className="text-[11px] font-bold text-muted-foreground tracking-widest uppercase">
              Ringkasan PNL Komparasi
            </span>
          </div>
          <div className="flex w-full lg:w-auto bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
            <div
              className={`flex flex-col flex-1 lg:flex-none p-3 px-5 border-r border-border min-w-[170px] transition-colors ${!progA ? "bg-muted/10" : (pA?.financials?.pnl ?? 0) >= 0 ? "bg-green-500/5 hover:bg-green-500/10" : "bg-destructive/5 hover:bg-destructive/10"}`}
            >
              <span className="text-[11px] font-bold text-muted-foreground flex items-center gap-1 mb-1 truncate max-w-[150px]">
                {progA ? progA.name : "Program Pertama"}
                {progA &&
                  ((pA?.financials?.pnl ?? 0) >= 0 ? (
                    <ArrowUpRight size={14} className="text-green-600" />
                  ) : (
                    <ArrowDownRight size={14} className="text-destructive" />
                  ))}
              </span>
              <span
                className={`text-base font-bold tracking-tight ${!progA ? "text-muted-foreground" : (pA?.financials?.pnl ?? 0) >= 0 ? "text-green-600" : "text-destructive"}`}
              >
                {progA
                  ? ((pA?.financials?.pnl ?? 0) >= 0 ? "+ Rp " : "- Rp ") +
                    formatBigNumber(Math.abs(pA?.financials?.pnl ?? 0))
                  : "-"}
              </span>
            </div>
            <div
              className={`flex flex-col flex-1 lg:flex-none p-3 px-5 min-w-[170px] transition-colors ${!progB ? "bg-muted/10" : (pB?.financials?.pnl ?? 0) >= 0 ? "bg-green-500/5 hover:bg-green-500/10" : "bg-destructive/5 hover:bg-destructive/10"}`}
            >
              <span className="text-[11px] font-bold text-muted-foreground flex items-center gap-1 mb-1 truncate max-w-[150px]">
                {progB ? progB.name : "Program Kedua"}
                {progB &&
                  ((pB?.financials?.pnl ?? 0) >= 0 ? (
                    <ArrowUpRight size={14} className="text-green-600" />
                  ) : (
                    <ArrowDownRight size={14} className="text-destructive" />
                  ))}
              </span>
              <span
                className={`text-base font-bold tracking-tight ${!progB ? "text-muted-foreground" : (pB?.financials?.pnl ?? 0) >= 0 ? "text-green-600" : "text-destructive"}`}
              >
                {progB
                  ? ((pB?.financials?.pnl ?? 0) >= 0 ? "+ Rp " : "- Rp ") +
                    formatBigNumber(Math.abs(pB?.financials?.pnl ?? 0))
                  : "-"}
              </span>
            </div>
          </div>
        </div>
        */}
      </div>

      {/* Box khusus filter dropdown di pucuk atas */}
      <div className="border border-border bg-card p-6 rounded-2xl shadow-sm flex flex-col md:flex-row items-end gap-6 justify-between">
        {/* Bungkus barisan dropdown pihak a */}
        <div className="w-full flex-1 flex flex-col gap-2">
          {/* Judul kecil milih program */}
          <label className="text-sm font-medium text-muted-foreground block">
            Program Pertama
          </label>
          {/* Box deret flex */}
          <div className="flex flex-col sm:flex-row gap-2">
            {/* Panggil select costum milih nama a */}
            <CustomSelect
              // Seting nilai a
              value={progAId}
              // Seting fungsi tiban nilai a
              onChange={setProgAId}
              // Urai array nama program jadi opsi2
              options={programs.map((p) => ({
                // Label nampilnya
                label: p.name,
                // Value dalemnya id
                value: p.id ?? "",
              }))}
              // Teks bayangan
              placeholder="Pilih Program"
              // Lebarin pool
              className="w-full"
            />
            {/* Select tanggalan pihak a */}
            <CustomSelect
              // Set nilai tgl a
              value={selectedPeriodA}
              // Tiban tgl a
              onChange={setSelectedPeriodA}
              // Urai opsi periode
              options={periodOptions.map((opt) => ({ label: opt, value: opt }))}
              // Kalo kosong suruh pilih
              placeholder="Pilih Periode"
              // Lebarin pas layar gede setengah
              className="w-full sm:w-1/2"
            />
          </div>
        </div>

        {/* Bikin tombol swap pencet tengah */}
        <button
          // Pas diklik panggil tukang swep
          onClick={handleSwap}
          // Judul pas kursor nempel
          title="Tukar Posisi"
          // Atur styling bulet kecil di tengah
          className="h-10 w-10 shrink-0 bg-muted hover:bg-primary/20 hover:text-primary transition-colors rounded-full text-muted-foreground cursor-pointer shadow-sm active:scale-95 flex items-center justify-center mb-0 md:mb-0"
        >
          {/* Icon arrow bolak-balik */}
          <ArrowRightLeft size={18} />
        </button>

        {/* Bungkus barisan dropdown pihak b */}
        <div className="w-full flex-1 flex flex-col gap-2">
          {/* Judulnya */}
          <label className="text-sm font-medium text-muted-foreground block">
            Program Kedua
          </label>
          {/* Flex deret select */}
          <div className="flex flex-col sm:flex-row gap-2">
            {/* Select nama b */}
            <CustomSelect
              // Set nilai b
              value={progBId}
              // Tiban nama b
              onChange={setProgBId}
              // Urai opsinya
              options={programs.map((p) => ({
                // Nampil teks
                label: p.name,
                // Simpen value id
                value: p.id ?? "",
              }))}
              // Bayangan
              placeholder="Pilih Program"
              // Lebarin
              className="w-full"
            />
            {/* Select tgl b */}
            <CustomSelect
              // Set tgl b
              value={selectedPeriodB}
              // Tiban tgl b
              onChange={setSelectedPeriodB}
              // Urai opsi tgl
              options={periodOptions.map((opt) => ({ label: opt, value: opt }))}
              // Info kosong suruh pilih
              placeholder="Pilih Periode"
              // Lebar setengah kalo lega
              className="w-full sm:w-1/2"
            />
          </div>
        </div>
      </div>

      {/* Box kapsul nampilin teks diadu periode berapa */}
      <div className="w-full text-center">
        {/* Span daleman bulet */}
        <span className="text-sm text-muted-foreground font-medium bg-muted/30 px-4 py-1.5 rounded-full">
          {/* Teks ngadu */}
          Komparasi Periode: {/* Span nebelin tanggal */}
          <span className="font-bold text-foreground">
            {/* Render tgl a ato strip kosong */}
            {selectedPeriodA || "-"}
          </span>{" "}
          {/* Teks versus */}
          vs {/* Span tebel b */}
          <span className="font-bold text-foreground">
            {/* Render tgl b ato strip kosong */}
            {selectedPeriodB || "-"}
          </span>
        </span>
      </div>

      {/* Filter cek kalo user belom milih komplit berempat */}
      {!progA || !progB || !selectedPeriodA || !selectedPeriodB ? (
        // Kasih box peringatan doang nyuruh milih
        <div className="text-center py-20 text-sm font-medium text-muted-foreground bg-card rounded-2xl border border-dashed border-border">
          {/* Teks peringatannya ditambahin urusan periode */}
          Silakan pilih kedua program dan periodenya di atas untuk melihat
          komparasi.
        </div>
      ) : (
        // Section compare grid
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Panggil box chart gedenya di sebelah kiri */}
          <ChartCard
            // Batang
            type="bar"
            // Judul dinamis ngikut nama
            title={`Komparasi Finansial: ${progA.name} vs ${progB.name}`}
            // Masukin data perbandingan dari hook
            data={comparisonData}
            options={{
              scales: {
                y: {
                  ticks: {
                    callback: function (value) {
                      return formatBigNumber(Number(value));
                    },
                  },
                },
              },
            }}
            // Tingginya tiga ratus
            height={300}
            // Classnya ambil jatah sembilan box grid
            className="lg:col-span-9 bg-card shadow-sm rounded-2xl flex flex-col p-2 min-h-[400px]"
          />

          {/* Area card2 kpi pameran the best siapa */}
          <div className="lg:col-span-3 bg-card shadow-sm rounded-2xl flex flex-col p-4 gap-4">
            {/* Card pertama urusan siapa yang tajir pnl */}
            <div
              // Atur warna classnya dinamis narik pnl a vs b
              className={`flex-1 p-5 rounded-2xl border-2 flex flex-col justify-center transition-colors duration-300 ${getCardStyle(pA?.financials?.pnl ?? 0, pB?.financials?.pnl ?? 0)}`}
            >
              {/* Teks tipis di atasnya */}
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1.5">
                {/* Icon dompet */}
                <Wallet size={14} /> Pemenang Net PNL
              </span>
              {/* Nama the bestnya */}
              <span
                // Kasih warna tebel dinamis
                className={`text-2xl font-bold ${getWinnerTextColor(pA?.financials?.pnl ?? 0, pB?.financials?.pnl ?? 0)}`}
              >
                {/* Filter adu pnlnya siapa gede */}
                {(pA?.financials?.pnl ?? 0) > (pB?.financials?.pnl ?? 0)
                  ? // Tulis a
                    progA.name
                  : // Kalo b menang
                    (pB?.financials?.pnl ?? 0) > (pA?.financials?.pnl ?? 0)
                    ? // Tulis b
                      progB.name
                    : // Seri
                      "Seimbang"}
              </span>
              {/* Tulisan selisih marginnya di bawah */}
              <span className="text-sm font-medium mt-1">
                {/* Teks */}
                Selisih: Rp {/* Absolutein kurangan a b terus rupiahin */}
                {formatBigNumber(
                  Math.abs(
                    (pA?.financials?.pnl ?? 0) - (pB?.financials?.pnl ?? 0),
                  ),
                )}
              </span>
            </div>

            {/* Box kedua urusan performa share */}
            <div
              // Kasih warna dinamis cek sharenya
              className={`flex-1 p-5 rounded-2xl border-2 flex flex-col justify-center transition-colors duration-300 ${getCardStyle(pA?.performanceTV?.actualShare ?? 0, pB?.performanceTV?.actualShare ?? 0)}`}
            >
              {/* Teks cilik atas */}
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1.5">
                {/* Grafik naik icon */}
                <TrendingUp size={14} /> Pemenang Share TV
              </span>
              {/* Teks pemenang */}
              <span
                // Warna teks dinamis
                className={`text-2xl font-bold ${getWinnerTextColor(pA?.performanceTV?.actualShare ?? 0, pB?.performanceTV?.actualShare ?? 0)}`}
              >
                {/* Adu a ama b */}
                {(pA?.performanceTV?.actualShare ?? 0) >
                (pB?.performanceTV?.actualShare ?? 0)
                  ? // Tulis a
                    progA.name
                  : // Adu b
                    (pB?.performanceTV?.actualShare ?? 0) >
                      (pA?.performanceTV?.actualShare ?? 0)
                    ? // Tulis b
                      progB.name
                    : // Seri
                      "Seimbang"}
              </span>
              {/* Span sisa di bawahnya */}
              <span className="text-sm font-medium mt-1">
                {/* Tulis angka maks dari dua pihak */}
                Share: {/* Hitung nilai maks */}
                {Math.max(
                  pA?.performanceTV?.actualShare ?? 0,
                  pB?.performanceTV?.actualShare ?? 0,
                )}
              </span>
            </div>

            {/* Box ketiga jagoan internet */}
            <div
              // Warna style digital
              className={`flex-1 p-5 rounded-2xl border-2 flex flex-col justify-center transition-colors duration-300 ${getCardStyle(pA?.performanceDigital?.views ?? 0, pB?.performanceDigital?.views ?? 0)}`}
            >
              {/* Teks mungil digital */}
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1.5">
                {/* Lepi icon */}
                <MonitorPlay size={14} /> Pemenang Digital
              </span>
              {/* Nama kampiun */}
              <span
                // Warnanya
                className={`text-2xl font-bold ${getWinnerTextColor(pA?.performanceDigital?.views ?? 0, pB?.performanceDigital?.views ?? 0)}`}
              >
                {/* Adu viewsnya */}
                {(pA?.performanceDigital?.views ?? 0) >
                (pB?.performanceDigital?.views ?? 0)
                  ? // Tulis a
                    progA.name
                  : // Kalo b menang views
                    (pB?.performanceDigital?.views ?? 0) >
                      (pA?.performanceDigital?.views ?? 0)
                    ? // Tulis b
                      progB.name
                    : // Seri
                      "Seimbang"}
              </span>
              {/* Span keterangan batas view tertinggi */}
              <span className="text-sm font-medium mt-1">
                {/* Teks max views */}
                Views: {/* Potong angka gede siapa pemenangnya */}
                {formatBigNumber(
                  Math.max(
                    pA?.performanceDigital?.views ?? 0,
                    pB?.performanceDigital?.views ?? 0,
                  ),
                )}
              </span>
            </div>
          </div>

          {/* Wadah tabel di bagian bawah */}
          <div className="lg:col-span-12 bg-card shadow-sm rounded-2xl border border-border overflow-hidden mt-2">
            {/* Box judul tabel nyesuain flex */}
            <div className="p-4 border-b border-border bg-muted/20 flex flex-row items-center justify-between">
              {/* H3 judul tabel parameter detail */}
              <h3 className="text-xl font-semibold flex items-center gap-2">
                {/* Icon bintang award */}
                <Award size={18} /> Detail Komparasi Metrik Parameter
              </h3>
            </div>

            {/* Bikin bisa digeser horizontal tabelnya */}
            <div className="overflow-x-auto custom-scrollbar">
              {/* Panggil smarttablenya trus kasih varian pure biar nampilin bodi doang */}
              <SmartTable
                // Kirim data barisan yang udah dirakit
                data={tableRows}
                // Kirim tiang kolom yang udah disesuaikan
                columns={compareColumns}
                // Pake varian pure biar pencarian ama filter atas bawah mokad
                variant="pure"
                // Matiin pagination sesuai request
                hidePagination={true}
                // Matiin filter tanggal di dalem tabel
                enableDateRange={false}
              />
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
