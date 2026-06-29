"use client";

// Import react bawaan ama hook usememo
import React, { useMemo } from "react";
// Import kumpulan icon kece dari lucide react
import {
  GitCompare,
  ArrowRightLeft,
  TrendingUp,
  Wallet,
  DollarSign,
  Percent,
  Clock,
  Tags,
  Award,
  Tv,
  MonitorPlay,
  RefreshCcw,
} from "lucide-react";
// Import komponen pembungkus chart
import ChartCard from "@/components/shared/ChartCard";
// Import hook khusus buat urusan komparasi
import { useCompare } from "@/hooks/useCompare";
// Import helper spesialis nyingkat angka
import { formatBigNumber } from "@/lib/formatters";
// Import dropdown kustom
import CustomSelect from "@/components/shared/CustomSelect";

// Bikin trus ekspor fungsi halaman compare
export default function CompareProgramPage() {
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
        // Id performa
        id: "performa_tv",
        // Icon tv
        icon: Tv,
        // Teks label
        label: "Performa TV (TVR / Share)",
        // Teks gabungan tvr ama share program a
        valA: `TVR: ${pA?.performanceTV?.actualTVR ?? 0} (Target: ${pA?.performanceTV?.targetTVR ?? 0}) | Share: ${capaianShareA} (Target: ${pA?.performanceTV?.targetShare ?? 0})`,
        // Teks gabungan tvr ama share program b
        valB: `TVR: ${pB?.performanceTV?.actualTVR ?? 0} (Target: ${pB?.performanceTV?.targetTVR ?? 0}) | Share: ${capaianShareB} (Target: ${pB?.performanceTV?.targetShare ?? 0})`,
        // Rumus nentuin siapa yang menang
        analysis: (
          <div className="text-center">
            {/* Filter cek kalo a menang */}
            {capaianShareA > capaianShareB ? (
              <span className="text-[#1f77b4] font-bold">
                {progA.name} penonton TV nya lebih banyak
              </span>
            ) : capaianShareB > capaianShareA ? (
              /* Filter cek kalo b yang menang */
              <span className="text-[#ff7f0e] font-bold">
                {progB.name} penonton TV nya lebih banyak
              </span>
            ) : (
              "Penonton TV sama banyak"
            )}
          </div>
        ),
        // Matiin highlight
        isHighlight: false,
      },
      {
        // Id performa digital
        id: "performa_digital",
        // Icon komputer
        icon: MonitorPlay,
        // Judul baris
        label: "Performa Digital",
        // Gabung teks views ama rev a
        valA: `${formatBigNumber(digitalViewsA)} Views | Rp ${formatBigNumber(pA?.performanceDigital?.revenue ?? 0)}`,
        // Gabung teks views ama rev b
        valB: `${formatBigNumber(digitalViewsB)} Views | Rp ${formatBigNumber(pB?.performanceDigital?.revenue ?? 0)}`,
        // Analisa digital
        analysis: (
          <div className="text-center">
            {/* Cek kalo a ramean */}
            {digitalViewsA > digitalViewsB ? (
              <span className="text-[#1f77b4] font-bold">
                {progA.name} penonton sosmed nya lebih rame
              </span>
            ) : digitalViewsB > digitalViewsA ? (
              /* Cek kalo b ramean */
              <span className="text-[#ff7f0e] font-bold">
                {progB.name} penonton sosmed nya lebih rame
              </span>
            ) : (
              "Penonton sosmed sama rame"
            )}
          </div>
        ),
        // Kaga highlight
        isHighlight: false,
      },
      {
        // Id inventory
        id: "inventory",
        // Icon jam
        icon: Clock,
        // Label inventory
        label: "Inventory Spot",
        // Gabung slot ama harga a
        valA: `${inventorySpotA} Slot @ Rp ${formatBigNumber(pA?.inventory?.adRate ?? 0)}`,
        // Gabung slot ama harga b
        valB: `${inventorySpotB} Slot @ Rp ${formatBigNumber(pB?.inventory?.adRate ?? 0)}`,
        // Analisa slot
        analysis: (
          <div className="text-center">
            {/* Kalo a banyakan */}
            {inventorySpotA > inventorySpotB ? (
              <span className="text-[#1f77b4] font-bold">
                {progA.name} slot iklannya lebih banyak
              </span>
            ) : inventorySpotB > inventorySpotA ? (
              /* Kalo b banyakan */
              <span className="text-[#ff7f0e] font-bold">
                {progB.name} slot iklannya lebih banyak
              </span>
            ) : (
              "Slot iklan sama banyak"
            )}
          </div>
        ),
        // No highlight
        isHighlight: false,
      },
      {
        // Id cost
        id: "cost",
        // Icon dompet
        icon: Wallet,
        // Label dompet
        label: "Cost Direct (Modal)",
        // Rupiahin cost a
        valA: `Rp ${formatBigNumber(costDirectA)}`,
        // Rupiahin cost b
        valB: `Rp ${formatBigNumber(costDirectB)}`,
        // Analisa makin kecil makin ciamik
        analysis: (
          <div className="text-center">
            {/* Cek kalo a lebih murah dari b */}
            {costDirectA < costDirectB ? (
              <span className="text-[#1f77b4] font-bold">
                {progA.name} modalnya lebih murah
              </span>
            ) : costDirectB < costDirectA ? (
              /* Cek kalo b lebih murah dari a */
              <span className="text-[#ff7f0e] font-bold">
                {progB.name} modalnya lebih murah
              </span>
            ) : (
              "Modalnya sama aja"
            )}
          </div>
        ),
        // Mati
        isHighlight: false,
      },
      {
        // Id revenue
        id: "revenue",
        // Icon dollar
        icon: DollarSign,
        // Label tulisan
        label: "Revenue Aktual",
        // Duit aslinya a
        valA: `Rp ${formatBigNumber(revenueCapaianA)}`,
        // Duit aslinya b
        valB: `Rp ${formatBigNumber(revenueCapaianB)}`,
        // Cek banyakan mana cuannya
        analysis: (
          <div className="text-center">
            {/* Kalo a gede */}
            {revenueCapaianA > revenueCapaianB ? (
              <span className="text-[#1f77b4] font-bold">
                {progA.name} dapet duit lebih gede
              </span>
            ) : revenueCapaianB > revenueCapaianA ? (
              /* Kalo b gede */
              <span className="text-[#ff7f0e] font-bold">
                {progB.name} dapet duit lebih gede
              </span>
            ) : (
              "Pemasukannya sama"
            )}
          </div>
        ),
        // Mati
        isHighlight: false,
      },
      {
        // Id roi
        id: "roi",
        // Icon persen
        icon: Percent,
        // Tulisan labelnya
        label: "ROI (Efisiensi Modal)",
        // Render angka roi a terus potong komanya sisa satu
        valA: <span className="font-bold">{roiA.toFixed(1)}%</span>,
        // Render angka roi b potong satu koma
        valB: <span className="font-bold">{roiB.toFixed(1)}%</span>,
        // Analisanya
        analysis: (
          <div className="text-center">
            {/* Cek persentase gedean a */}
            {roiA > roiB ? (
              <span className="text-[#1f77b4] font-medium">
                {progA.name} persentase untungnya lebih gede
              </span>
            ) : roiB > roiA ? (
              /* Cek banyakan b */
              <span className="text-[#ff7f0e] font-bold">
                {progB.name} persentase untungnya lebih gede
              </span>
            ) : (
              "Untungnya seimbang"
            )}
          </div>
        ),
        // Off
        isHighlight: false,
      },
      {
        // Id pnl paling krusial
        id: "pnl",
        // Icon compare
        icon: GitCompare,
        // Label mantap
        label: "Net Profit Margin",
        // Nilai pnl a
        valA: (
          <span
            className={`text-lg font-bold ${pnlA >= 0 ? "text-green-600" : "text-destructive"}`}
          >
            {/* Rupiahin angka pnl a */}
            Rp {formatBigNumber(pnlA)}
          </span>
        ),
        // Nilai pnl b
        valB: (
          <span
            className={`text-lg font-bold ${pnlB >= 0 ? "text-green-600" : "text-destructive"}`}
          >
            {/* Rupiahin angka b */}
            Rp {formatBigNumber(pnlB)}
          </span>
        ),
        // Analisa akhir siapa yang paling best
        analysis: (
          <div className="text-center text-lg font-bold">
            {/* Filter cek kalo a cuan lebih */}
            {pnlA > pnlB ? (
              <span className="text-[#1f77b4]">
                {pnlA < 0
                  ? // Kalo minus bilang ruginya dikit
                    `${progA.name} ruginya lebih dikit`
                  : // Kalo plus bilang paling cuan
                    `${progA.name} Paling Cuan!`}
              </span>
            ) : pnlB > pnlA ? (
              /* Kalo b cuan lebih */
              <span className="text-[#ff7f0e]">
                {pnlB < 0
                  ? // Ruginya dikitan b
                    `${progB.name} ruginya lebih dikit`
                  : // Kalo positif cuan abis b
                    `${progB.name} Paling Cuan!`}
              </span>
            ) : pnlA < 0 ? (
              // Jelasin rugi bareng
              "Sama sama rugi"
            ) : (
              // Cuannya kembar
              "Cuannya Seri"
            )}
          </div>
        ),
        // Sorot baris ini nyalain highlight
        isHighlight: true,
      },
    ];
  }, [progA, progB, pA, pB, roiA, roiB]);

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
      {/* Kotak khusus saringan dropdown di pucuk atas */}
      <div className="bg-card p-6 rounded-2xl shadow-sm flex flex-col md:flex-row items-end gap-6 justify-between">
        {/* Bungkus barisan dropdown pihak a */}
        <div className="w-full flex-1 flex flex-col gap-2">
          {/* Judul kecil milih program */}
          <label className="text-sm font-medium text-muted-foreground block">
            Pilih Program
          </label>
          {/* Kotak deret flex */}
          <div className="flex flex-col sm:flex-row gap-2">
            {/* Panggil select kustom milih nama a */}
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
              placeholder="-- Program Pertama --"
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
              // Kalo kosong suruh pilih terbaru
              placeholder="Periode Terbaru"
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
          {/* Icon panah bolak balik */}
          <ArrowRightLeft size={18} />
        </button>

        {/* Bungkus barisan dropdown pihak b */}
        <div className="w-full flex-1 flex flex-col gap-2">
          {/* Judulnya */}
          <label className="text-sm font-medium text-muted-foreground block">
            Pilih Program
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
              placeholder="-- Program Kedua --"
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
              // Info kosong
              placeholder="Periode Terbaru"
              // Lebar setengah kalo lega
              className="w-full sm:w-1/2"
            />
          </div>
        </div>
      </div>

      {/* Kotak kapsul nampilin teks diadu periode berapa */}
      <div className="w-full text-center">
        {/* Span daleman bulet */}
        <span className="text-sm text-muted-foreground font-medium bg-muted/30 px-4 py-1.5 rounded-full">
          {/* Teks ngadu */}
          Komparasi Periode: {/* Span nebelin tanggal */}
          <span className="font-bold text-foreground">
            {/* Render tgl a ato terbaru */}
            {pA?.month || selectedPeriodA || "Terbaru"}
          </span>{" "}
          {/* Teks versus */}
          vs {/* Span tebel b */}
          <span className="font-bold text-foreground">
            {/* Render tgl b */}
            {pB?.month || selectedPeriodB || "Terbaru"}
          </span>
        </span>
      </div>

      {/* Filter cek kalo user belom milih dua duanya */}
      {!progA || !progB ? (
        // Kasih kotak peringatan doang nyuruh milih
        <div className="text-center py-20 text-sm font-medium text-muted-foreground bg-card rounded-2xl border border-dashed border-border">
          {/* Teks peringatannya */}
          Silakan pilih kedua program di atas untuk melihat komparasi.
        </div>
      ) : (
        // Seksi utama komparasi wujud grid
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Panggil kotak chart gedenya di sebelah kiri */}
          <ChartCard
            // Batang
            type="bar"
            // Judul dinamis ngikut nama
            title={`Komparasi Finansial: ${progA.name} vs ${progB.name}`}
            // Masukin data perbandingan dari hook
            data={comparisonData}
            // Tingginya tiga ratus
            height={300}
            // Classnya ambil jatah sembilan kotak grid
            className="lg:col-span-9 bg-card shadow-sm rounded-2xl flex flex-col p-2 min-h-[400px]"
          />

          {/* Area kartu2 kpi pameran the best siapa */}
          <div className="lg:col-span-3 bg-card shadow-sm rounded-2xl flex flex-col p-4 gap-4">
            {/* Kartu pertama urusan siapa yang tajir pnl */}
            <div
              // Atur warna classnya dinamis narik pnl a vs b
              className={`flex-1 p-5 rounded-2xl border-2 flex flex-col justify-center transition-colors duration-300 ${getCardStyle(pA?.financials?.pnl ?? 0, pB?.financials?.pnl ?? 0)}`}
            >
              {/* Teks tipis di atasnya */}
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1.5">
                {/* Icon dompet */}
                <Wallet size={14} /> Pemenang Net PNL
              </span> */}

              <span className="text-sm md:text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Wallet className="md:size-[14] size-[20]" /> Pemenang Net PNL
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
                Selisih, Rp {/* Absolutein kurangan a b terus rupiahin */}
                {formatBigNumber(
                  Math.abs(
                    (pA?.financials?.pnl ?? 0) - (pB?.financials?.pnl ?? 0),
                  ),
                )}
              </span>
            </div>

            {/* Kotak kedua urusan performa share */}
            <div
              // Kasih warna dinamis cek sharenya
              className={`flex-1 p-5 rounded-2xl border-2 flex flex-col justify-center transition-colors duration-300 ${getCardStyle(pA?.performanceTV?.actualShare ?? 0, pB?.performanceTV?.actualShare ?? 0)}`}
            >
              {/* Teks cilik atas */}
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1.5">
                {/* Grafik naik icon */}
                <TrendingUp size={14} /> Pemenang Share TV
              </span> */}

              <span className="text-sm md:text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <TrendingUp className="md:size-[14] size-[20]" /> Pemenang Share TV
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
                Share Maks, {/* Hitung nilai maks */}
                {Math.max(
                  pA?.performanceTV?.actualShare ?? 0,
                  pB?.performanceTV?.actualShare ?? 0,
                )}
              </span>
            </div>

            {/* Kotak ketiga jagoan internet */}
            <div
              // Warna gaya digital
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
                Views Maks, {/* Potong angka gede siapa pemenangnya */}
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
            {/* Kotak judul tabel */}
            <div className="p-4 border-b border-border bg-muted/20">
              {/* H3 judul tabel parameter detail */}
              <h3 className="text-xl font-semibold flex items-center gap-2">
                {/* Icon bintang award */}
                <Award size={18} /> Detail Komparasi Metrik Parameter
              </h3>
            </div>

            {/* Bikin bisa digeser horizontal tabelnya */}
            <div className="overflow-x-auto custom-scrollbar">
              {/* Bikin tabel html murni memanjang ke samping */}
              <table className="w-full text-left text-sm whitespace-nowrap">
                {/* Kepala tabel */}
                <thead className="bg-muted/50 border-b border-border text-muted-foreground">
                  {/* Baris isi th */}
                  <tr>
                    {/* Th metrik */}
                    <th className="px-6 py-4 font-bold uppercase tracking-wider text-[11px]">
                      {/* Judul th pertama */}
                      Parameter Spesifik
                    </th>
                    {/* Th buat nama program a */}
                    <th className="px-6 py-4 font-bold uppercase tracking-wider text-[11px] text-[#1f77b4]">
                      {/* Tulis dinamis nama program a */}
                      {progA.name}
                    </th>
                    {/* Th buat nama b oren */}
                    <th className="px-6 py-4 font-bold uppercase tracking-wider text-[11px] text-[#ff7f0e]">
                      {/* Tulis dinamis b */}
                      {progB.name}
                    </th>
                    {/* Th nulis analisa */}
                    <th className="px-6 py-4 font-bold uppercase tracking-wider text-[11px] text-center">
                      {/* Judul */}
                      Analisis
                    </th>
                  </tr>
                </thead>
                {/* Bodi tabel isinya misah baris pake border */}
                <tbody className="divide-y divide-border">
                  {/* Loop wadah tabel yang udah dibikin dari usememo di atas */}
                  {tableRows.map((row) => (
                    // Tr baris ngikutin data loop
                    <tr
                      // Key mutlak id
                      key={row.id}
                      // Warnain background kalo disorot ama dibikin beda pas disorot hover
                      className={`transition-colors ${row.isHighlight ? "bg-muted/30" : "hover:bg-muted/30"}`}
                    >
                      {/* Kolom data parameter */}
                      <td className="px-6 py-4 font-medium flex items-center gap-2">
                        {/* Pasang icon parameter */}
                        <row.icon
                          // Size tetep
                          size={16}
                          // Warnain icon pas dapet jatah sorot
                          className={
                            row.isHighlight
                              ? "text-primary"
                              : "text-muted-foreground"
                          }
                        />
                        {/* Tulisan namanya parameter */}
                        {row.label}
                      </td>
                      {/* Kolom data hasil itung2an a */}
                      <td className="px-6 py-4">{row.valA}</td>
                      {/* Kolom data itungan b */}
                      <td className="px-6 py-4">{row.valB}</td>
                      {/* Kolom baca hasil analisa */}
                      <td className="px-6 py-4">{row.analysis}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
