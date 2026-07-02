// Import hook state buat kelola data
import {
  useState,
  // Import hook memo buat efisiensi hitungan
  useMemo,
} from "react";
// Import hook useQuery dari tanstack buat ambil data
import { useQuery } from "@tanstack/react-query";
// Import fungsi api buat ambil data program
import { fetchProgramsByRange } from "@/services/api/programService";
// Import interface config kolom dari smart table
import { ColumnConfig } from "@/components/shared/SmartTable";
// Import formatter angka biar tampilan data rapi
import { formatNumberIndo } from "@/lib/formatters";
// Import skema tipe data buat program
import { ProgramFormData } from "@/schemas/program";

// Fungsi custom hook buat handle data detail program
export function useDetailProgram() {
  // Ambil data program pake useQuery dengan key programs
  const {
    // Data hasil fetching
    data: programs = [],
    // Status loading data
    isLoading,
  } = useQuery({
    // Key query buat caching
    queryKey: ["programs"],
    // Fungsi buat fetch data dari backend
    queryFn: () => fetchProgramsByRange("", ""),
  });

  // State buat simpen program yang dipilih user
  const [selectedProgram, setSelectedProgram] =
    // Inisialisasi awal null
    useState<ProgramFormData | null>(null);

  // State buat simpen periode yang lagi aktif
  const [selectedPeriod, setSelectedPeriod] = useState<string>("");

  // Memo buat dapetin semua opsi periode yang ada
  const periodOptions = useMemo(() => {
    // Bongkar semua periode dari semua program
    const all = programs.flatMap(
      (p: ProgramFormData) => p.periods?.map((x) => x.month) || [],
    );
    // Hapus duplikat terus urutin dari yang terbaru
    return Array.from(new Set(all)).sort().reverse();
  }, [programs]);

  // Memo buat bikin opsi filter kategori dari data yang ada
  const categoryOptions = useMemo(() => {
    // Ambil kategori unik terus filter yang kosong
    const uniqueCategories = Array.from(
      new Set(programs.map((p) => p.category)),
    ).filter(Boolean);
    // Ubah jadi format label dan value buat dropdown
    return uniqueCategories.map((c) => ({ label: `Kategori ${c}`, value: c }));
  }, [programs]);

  // Array konfigurasi filter untuk dropdown
  const selectFilters = [
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
    // Kalo data ga ada balikin null
    if (!data || !data.periods || data.periods.length === 0) return null;
    // Kalo user milih periode tertentu, cari periodenya
    if (targetPeriod) {
      const found = data.periods.find((p) => p.month === targetPeriod);
      // Kalo ketemu balikin
      if (found) return found;
      // Kalo ga ketemu bikin objek periode kosong buat jaga data
      return {
        // Id dummy unik
        id: `empty-detail`,
        // Bulan target
        month: targetPeriod,
        // Data tv kosong
        performanceTV: {
          targetTVR: 0,
          targetShare: 0,
          actualTVR: 0,
          actualShare: 0,
        },
        // Data digital kosong
        performanceDigital: { views: 0, revenue: 0 },
        // Data finansial kosong
        financials: {
          costDirect: 0,
          revenueTarget: 0,
          revenueActual: 0,
          pnl: 0,
        },
        // Data inventori kosong
        inventory: { spot: 0, adRate: 0 },
        // Status default
        status: "-",
      };
    }
    // Urutin periode buat dapet yang paling baru
    const sorted = [...data.periods].sort((a, b) =>
      b.month.localeCompare(a.month),
    );
    // Balikin periode pertama hasil sortir
    return sorted[0];
  };

  // Memo buat definisikan konfigurasi kolom tabel
  const columns: ColumnConfig<ProgramFormData>[] = useMemo(
    () => [
      {
        // Judul kolom
        header: "Nama Program",
        // Key accessor buat mapping data
        accessorKey: "name",
        // Render buat isi sel
        render: (item) => (
          // Tombol buat buka detail modal
          <button
            // Set program yang diklik ke state
            onClick={() => setSelectedProgram(item)}
            // Styling buat tombol nama
            className="font-bold text-primary hover:underline text-left cursor-pointer focus:outline-none"
          >
            {/* Teks nama program */}
            {item.name}
          </button>
        ),
      },
      {
        // Judul kolom
        header: "Kategori",
        // Key accessor data
        accessorKey: "category",
        // Render label kategori
        render: (item) => (
          // Span buat badge kategori
          <span className="bg-secondary text-secondary-foreground px-2.5 py-1 rounded-md text-[11px] font-bold">
            {/* Teks nama kategori */}
            {item.category}
          </span>
        ),
      },
      {
        // Judul kolom
        header: "Jam Tayang",
        // Key accessor data
        accessorKey: "broadcastTime",
        // Render plain text jam tayang
        render: (item) => item.broadcastTime,
      },
      {
        // Judul kolom
        header: "Target TVR",
        // Fungsi accessor buat ambil data target tvr
        accessorFn: (item) =>
          getActivePeriod(item, selectedPeriod)?.performanceTV?.targetTVR,
        // Id unik buat kolom
        id: "targetTVR",
        // Render nilai target tvr
        render: (item) =>
          getActivePeriod(item, selectedPeriod)?.performanceTV?.targetTVR ?? 0,
      },
      {
        // Judul kolom
        header: "Target Share",
        // Fungsi accessor buat ambil target share
        accessorFn: (item) =>
          getActivePeriod(item, selectedPeriod)?.performanceTV?.targetShare,
        // Id unik kolom
        id: "targetShare",
        // Render nilai target share
        render: (item) =>
          getActivePeriod(item, selectedPeriod)?.performanceTV?.targetShare ??
          0,
      },
      {
        // Judul kolom
        header: "Capaian Share",
        // Fungsi accessor buat ambilcapaian share
        accessorFn: (item) =>
          getActivePeriod(item, selectedPeriod)?.performanceTV?.actualShare,
        // Id unik kolom
        id: "capaianShare",
        // Render nilaicapaian share dengan logic warna
        render: (item) => {
          // Ambil data periode aktif
          const active = getActivePeriod(item, selectedPeriod);
          // Ambil nilaicapaian share
          const actualShare = active?.performanceTV?.actualShare ?? 0;
          // Ambil nilai target share
          const targetShare = active?.performanceTV?.targetShare ?? 0;
          // Render span dengan kondisi warna
          return (
            // Logic warna ijo kalo capai target, merah kalo belom
            <span
              className={
                actualShare >= targetShare
                  ? "text-green-600 font-bold"
                  : "text-destructive font-bold"
              }
            >
              {/* Teks nilai share */}
              {actualShare}
            </span>
          );
        },
      },
      {
        // Judul kolom
        header: "Net PNL",
        // Fungsi accessor pnl
        accessorFn: (item) =>
          getActivePeriod(item, selectedPeriod)?.financials?.pnl,
        // Id unik kolom
        id: "pnl",
        // Render pnl dengan format mata uang
        render: (item) => {
          // Ambil nilai pnl
          const pnl =
            getActivePeriod(item, selectedPeriod)?.financials?.pnl ?? 0;
          // Render span warna sesuai pnl
          return (
            <span
              // Warna ijo kalo untung, merah kalo rugi
              className={
                pnl >= 0
                  ? "text-green-600 font-bold"
                  : "text-destructive font-bold"
              }
            >
              {/* Teks pnl yang diformat */}
              Rp {formatNumberIndo(pnl)}
            </span>
          );
        },
      },
    ],
    // Dependency update kolom
    [selectedPeriod],
  );

  // Return semua data dan fungsi yang bakal dipake di ui
  return {
    programs,
    isLoading,
    selectedProgram,
    setSelectedProgram,
    selectFilters,
    columns,
    selectedPeriod,
    setSelectedPeriod,
    periodOptions,
  };
}
