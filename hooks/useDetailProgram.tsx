"use client";

import { useState, useMemo } from "react";
// Import hook usequery dari tanstack buat ambil data
import { useQuery } from "@tanstack/react-query";
// Import fungsi api buat ambil data program sama tipe balasannya
import {
  fetchProgramsByRange,
  FetchProgramsResponse,
} from "@/services/api/programService";
// Import interface config kolom dari smart table
import { ColumnConfig } from "@/components/shared/SmartTable";
// Import formatter angka biar tampilan data rapi
import { formatNumberIndo } from "@/lib/formatters";
// Import skema tipe data buat program
import { ProgramFormData } from "@/schemas/program";

// Fungsi custom hook buat handle data detail program
export function useDetailProgram() {
  // Ambil data program pake usequery dengan key programs dashboard biar irit
  const {
    // Data hasil fetching koper murni
    data: fetchResult,
    // Status loading data
    isLoading,
  } = useQuery<FetchProgramsResponse>({
    // Key query buat caching disamain biar bagi2 rejeki cache
    queryKey: ["programsDashboard"],
    // Fungsi buat fetch data dari backend tanpa param murni
    queryFn: () => fetchProgramsByRange(),
  });

  // Ekstrak array program dari dalem koper result atau lepehin array kosong
  const programs = fetchResult?.data || [];

  // State buat simpen program yang dipilih user
  const [selectedProgram, setSelectedProgram] =
    // Inisialisasi awal null murni
    useState<ProgramFormData | null>(null);

  // State buat simpen periode yang lagi aktif
  const [selectedPeriod, setSelectedPeriod] = useState<string>("");

  // Memo buat dapetin semua opsi periode yang ada
  const periodOptions = useMemo(() => {
    // Bongkar semua periode dari semua program murni
    const all = programs.flatMap(
      // Map pencari wujud string
      (p: ProgramFormData) => p.periods?.map((x) => x.month) || [],
    );
    // Hapus duplikat terus urutin dari yang terbaru murni
    return Array.from(new Set(all)).sort().reverse();
    // Pantau variabel murni
  }, [programs]);

  // Memo buat bikin opsi filter kategori dari data yang ada
  const categoryOptions = useMemo(() => {
    // Ambil kategori unik terus filter yang kosong murni
    const uniqueCategories = Array.from(
      // Buka penampung set
      new Set(programs.map((p) => p.category)),
    ).filter(Boolean);
    // Ubah jadi format label dan value buat dropdown
    return uniqueCategories.map((c) => ({
      // Rakit string label
      label: `${c}`,
      // Tancepin isian aslinya murni
      value: c,
    }));
    // Pantau murni
  }, [programs]);

  // Array konfigurasi filter untuk dropdown
  const selectFilters = [
    // Objek laci saringan pertama
    {
      // Key filter
      key: "category",
      // Label buat placeholder dropdown
      label: "Semua Kategori",
      // Daftar opsi kategori
      options: categoryOptions,
    },
  ];

  // Fungsi pembantu buat ambil data periode aktif
  const getActivePeriod = (
    // Data program input
    data: ProgramFormData | undefined,
    // Target bulan periode
    targetPeriod: string,
  ) => {
    // Kondisional gerbang nyegat balikin nihil pas kerangka emang kosong beneran, ato jalanin inspeksi pas nyata ketemu
    if (!data || !data.periods || data.periods.length === 0) return null;
    // Kondisional cari periode spesifik nyelam nyari yang pas nargetin kecantol, ato buatin kerangka dummy pas ga nyata nemu
    if (targetPeriod) {
      // Nyari bongkahan murni
      const found = data.periods.find((p) => p.month === targetPeriod);
      // Kondisional pelempar balik balikin temuan pas bener nemu, ato biarin nyari alternatif
      if (found) return found;
      // Kalo ga ketemu bikin objek periode kosong buat jaga data
      return {
        // Id dummy unik
        id: `empty-detail`,
        // Bulan target
        month: targetPeriod,
        // Data tv kosong
        performanceTV: {
          // Tarjet nol
          targetTVR: 0,
          // Porsi nol
          targetShare: 0,
          // Asli nol
          actualTVR: 0,
          // Nyata nol murni
          actualShare: 0,
        },
        // Data digital kosong
        performanceDigital: {
          // Penonton nol
          views: 0,
          // Uang nol murni
          revenue: 0,
        },
        // Data finansial kosong
        financials: {
          // Modal kopong
          costDirect: 0,
          // Patokan meleset
          revenueTarget: 0,
          // Dompet kering
          revenueActual: 0,
          // Laba ambyar murni
          pnl: 0,
        },
        // Data inventori kosong
        inventory: {
          // Iklan kandas
          spot: 0,
          // Harga lenyap murni
          adRate: 0,
        },
        // Status default
        status: "-",
      };
    }
    // Urutin periode buat dapet yang paling baru
    const sorted = [...data.periods].sort((a, b) =>
      // Adu string
      b.month.localeCompare(a.month),
    );
    // Balikin periode pertama hasil sortir
    return sorted[0];
  };

  // Memo buat rekap hitungan program cuan dan tekor murni
  const programSummary = useMemo(() => {
    // Wadah jumlah program untung
    let profitCount = 0;
    // Wadah duit untung
    let profitSum = 0;
    // Wadah jumlah program rugi
    let lossCount = 0;
    // Wadah duit rugi
    let lossSum = 0;

    // Loop semua program buat disaring murni
    programs.forEach((p) => {
      // Tarik periode aktifnya murni
      const active = getActivePeriod(p, selectedPeriod);
      // Kondisional cek kalo datanya ada murni
      if (active && active.financials) {
        // Ambil nominal
        const pnl = active.financials.pnl;
        // Kondisional pisah nasib program
        if (pnl >= 0) {
          // Tambah angka untung murni
          profitCount++;
          // Tambah duit untung murni
          profitSum += pnl;
        } else {
          // Tambah angka tekor murni
          lossCount++;
          // Tambah duit tekor murni
          lossSum += pnl;
        }
      }
    });

    // Balikin objek rekap utuh murni
    return {
      // Kirim jumlah untung
      profitCount,
      // Kirim duit untung
      profitSum,
      // Kirim jumlah rugi
      lossCount,
      // Kirim duit rugi
      lossSum,
    };
    // Pantau array dan periode murni
  }, [programs, selectedPeriod]);

  // Memo buat definisikan konfigurasi kolom tabel
  const columns: ColumnConfig<ProgramFormData>[] = useMemo(
    () => [
      // Kolom nama tayangan
      {
        // Judul kolom
        header: "Nama Program",
        // Key accessor buat mapping data
        accessorKey: "name",
        // Render buat isi sel
        render: (item) => (
          // Buka tombol buat buka detail modal
          <button
            // Set program yang diklik ke state
            onClick={() => setSelectedProgram(item)}
            // Styling buat tombol nama murni
            className="font-bold text-primary hover:underline text-left cursor-pointer focus:outline-none"
          >
            {/* Teks nama program */}
            {item.name}
          </button>
        ),
      },
      // Kolom pembagian rupa
      {
        // Judul kolom
        header: "Kategori",
        // Key accessor data
        accessorKey: "category",
        // Render label kategori
        render: (item) => (
          // Span buat badge kategori
          <span
            // Rupa kelas murni
            className="bg-secondary text-secondary-foreground px-2.5 py-1 rounded-md text-[11px] font-bold"
          >
            {/* Teks nama kategori */}
            {item.category}
          </span>
        ),
      },
      // Pilar ngasih tau slot tayang
      {
        // Judul kolom
        header: "Jam Tayang",
        // Key accessor data
        accessorKey: "broadcastTime",
        // Render plain text jam tayang
        render: (item) => item.broadcastTime,
      },
      // Pilar ngasih tau sasaran nembak tontonan
      {
        // Judul kolom
        header: "Target TVR",
        // Fungsi accessor buat ambil data target tvr murni
        accessorFn: (item) =>
          // Ekstrak rupa dari laci
          getActivePeriod(item, selectedPeriod)?.performanceTV?.targetTVR,
        // Id unik buat kolom
        id: "targetTVR",
        // Render nilai target tvr
        render: (item) =>
          // Tempelin angka
          getActivePeriod(item, selectedPeriod)?.performanceTV?.targetTVR ?? 0,
      },
      // Pilar patokan porsi tv
      {
        // Judul kolom
        header: "Target Share",
        // Fungsi accessor buat ambil target share murni
        accessorFn: (item) =>
          // Gedor lacinya murni
          getActivePeriod(item, selectedPeriod)?.performanceTV?.targetShare,
        // Id unik kolom
        id: "targetShare",
        // Render nilai target share murni
        render: (item) =>
          // Tempelin angkanya murni
          getActivePeriod(item, selectedPeriod)?.performanceTV?.targetShare ??
          0,
      },
      // Kolom ngintip berhasil kaga nutup porsi tayangan
      {
        // Judul kolom
        header: "Capaian Share",
        // Fungsi accessor buat ambil actual share murni
        accessorFn: (item) =>
          // Cari ampe dapet
          getActivePeriod(item, selectedPeriod)?.performanceTV?.actualShare,
        // Id unik kolom
        id: "capaianShare",
        // Render nilai actual share dengan logic warna
        render: (item) => {
          // Ambil data periode aktif murni
          const active = getActivePeriod(item, selectedPeriod);
          // Ambil nilai actual share
          const actualShare = active?.performanceTV?.actualShare ?? 0;
          // Ambil nilai target share
          const targetShare = active?.performanceTV?.targetShare ?? 0;
          // Render span dengan kondisi warna
          return (
            // Buka elemen span pembungkus
            <span
              // Kondisional pewarnaan teks balikin kelir daun pas bener tembus di atas batas, ato sembur warna kramat pas jeblok di bawah
              className={
                actualShare >= targetShare
                  ? // Warna lolos kpi
                    "text-green-600 font-bold"
                  : // Warna keok kpi
                    "text-destructive font-bold"
              }
            >
              {/* Teks nilai share */}
              {actualShare}
            </span>
          );
        },
      },
      // Kolom hitung ajaib cuan ruginya angka bener
      {
        // Judul kolom
        header: "Net PNL",
        // Fungsi accessor pnl
        accessorFn: (item) =>
          // Cari angka duit
          getActivePeriod(item, selectedPeriod)?.financials?.pnl,
        // Id unik kolom
        id: "pnl",
        // Render pnl dengan format mata uang
        render: (item) => {
          // Ambil nilai pnl
          const pnl =
            // Nyomot beneran murni
            getActivePeriod(item, selectedPeriod)?.financials?.pnl ?? 0;
          // Render span warna sesuai pnl murni
          return (
            // Buka span kelir duit
            <span
              // Kondisional pelabelan rupa teks nempelin ijo pas dompetnya isi positif, ato tancep merah merona pas nyata isinya melompong tekor
              className={
                pnl >= 0
                  ? // Lulus
                    "text-green-600 font-bold"
                  : // Hancur
                    "text-destructive font-bold"
              }
            >
              {/* Teks pnl yang diformat */}
              Rp {formatNumberIndo(pnl)}
            </span>
          );
        },
      },
    ],
    // Dependency update kolom murni
    [selectedPeriod],
  );

  // Return semua data dan fungsi yang bakal dipake di ui murni
  return {
    // Array program
    programs,
    // Spinner boolean
    isLoading,
    // Program terpilih
    selectedProgram,
    // Pengubah program
    setSelectedProgram,
    // Jajaran dropdown filter
    selectFilters,
    // Arsitektur pilar murni
    columns,
    // Simpanan periode
    selectedPeriod,
    // Pengubah periode
    setSelectedPeriod,
    // Rentetan pilihan bulan
    periodOptions,
    // Rekap data cuan rugi murni
    programSummary,
  };
}
