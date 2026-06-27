import React, {
  // Import hook state buat kelola data
  useState,
  // Import hook memo buat efisiensi hitungan
  useMemo,
  // Import hook ref buat akses elemen dom
  useRef,
} from "react";
// Import hook query dari tanstack query
import {
  useQuery,
  // Import hook mutation
  useMutation,
  // Import client query
  useQueryClient,
} from "@tanstack/react-query";
// Import ikon edit dari lucide
import {
  Edit2,
  // Import ikon trash dari lucide
  Trash2,
} from "lucide-react";
// Import komponen grid dari ag grid react
import { AgGridReact } from "ag-grid-react";
// Import tipe data dari komunitas ag grid
import {
  ColDef,
  ValueParserParams,
  ICellRendererParams,
  ValueGetterParams,
  ValueSetterParams,
  CellClassParams,
} from "ag-grid-community";
// Import fungsi toast dari sonner buat notifikasi
import { toast } from "sonner";

// Import fungsi fetch program dari service
import {
  fetchProgramsByRange,
  createProgram,
  updateProgram,
  deleteProgram,
} from "@/services/api/programService";
// Import config kolom dari smart table
import {
  ColumnConfig,
  FilterSelectConfig,
} from "@/components/shared/SmartTable";
// Import skema validasi program
import { ProgramFormData, programFormSchema } from "@/schemas/program";

// Fungsi buat dapetin objek periode aktif atau bikin baru kalo gada
const getActivePeriod = (
  // Data program
  data: ProgramFormData | undefined,
  // Periode terpilih
  selectedPeriod?: string | null,
) => {
  // Kalo data gada balikin null
  if (!data) return null;
  // Kalo periods gada atau kosong bikin periode baru
  if (!data.periods || data.periods.length === 0) {
    // Bikin array periode dengan objek default
    data.periods = [
      {
        // Id unik pake timestamp
        id: `d-${Date.now()}`,
        // Bulan sekarang format iso
        month: new Date().toISOString().slice(0, 7),
        // Data performa tv default
        performanceTV: {
          targetTVR: 0,
          targetShare: 0,
          actualTVR: 0,
          actualShare: 0,
        },
        // Data performa digital default
        performanceDigital: { views: 0, revenue: 0 },
        // Data finansial default
        financials: {
          costDirect: 0,
          revenueTarget: 0,
          revenueActual: 0,
          pnl: 0,
        },
        // Data inventori default
        inventory: { spot: 0, adRate: 0 },
        // Status awal normal
        status: "Normal",
      },
    ];
  }
  // Kalo ada periode yang dipilih cari periodenya
  if (selectedPeriod) {
    // Cari periode yang match sama bulan
    const found = data.periods.find((p) => p.month === selectedPeriod);
    // Kalo ketemu balikin
    if (found) return found;
    // Kalo ga ketemu bikin objek periode baru
    const newPeriod = {
      // Id unik random
      id: `d-${Date.now()}-${Math.random()}`,
      // Bulan sesuai pilihan
      month: selectedPeriod,
      // Data performa tv default
      performanceTV: {
        targetTVR: 0,
        targetShare: 0,
        actualTVR: 0,
        actualShare: 0,
      },
      // Data performa digital default
      performanceDigital: { views: 0, revenue: 0 },
      // Data finansial default
      financials: { costDirect: 0, revenueTarget: 0, revenueActual: 0, pnl: 0 },
      // Data inventori default
      inventory: { spot: 0, adRate: 0 },
      // Status awal kosong
      status: "-",
    };
    // Masukin periode baru ke list periode
    data.periods.push(newPeriod);
    // Balikin periode baru
    return newPeriod;
  }
  // Sortir periode dari yang terbaru
  const sorted = [...data.periods].sort((a, b) =>
    b.month.localeCompare(a.month),
  );
  // Balikin periode paling baru
  return sorted[0];
};

// Hook utama buat manage master program
export function useMasterProgram() {
  // Inisialisasi query client
  const queryClient = useQueryClient();
  // Ref buat akses api ag grid
  const gridRef = useRef<AgGridReact>(null);

  // State buka tutup modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  // State id data yang lagi diedit
  const [editingId, setEditingId] = useState<string | null>(null);
  // State konfirmasi hapus data
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  // State isi data row di modal
  const [rowData, setRowData] = useState<ProgramFormData[]>([]);
  // State periode yang lagi dipilih
  const [selectedPeriod, setSelectedPeriod] = useState<string>("");

  // Ambil data program dari server
  const { data: programs = [], isLoading } = useQuery<ProgramFormData[]>({
    // Key cache data
    queryKey: ["programs"],
    // Fungsi panggil api
    queryFn: () => fetchProgramsByRange("", ""),
  });

  // Memo buat daftar periode unik yang ada
  const periodOptions = useMemo(() => {
    // Bongkar semua periode dari program
    const all = programs.flatMap(
      (p: ProgramFormData) => p.periods?.map((x) => x.month) || [],
    );
    // Hapus duplikat terus urutin
    return Array.from(new Set(all)).sort().reverse();
  }, [programs]);

  // Mutasi buat tambah data baru
  const createMut = useMutation({ mutationFn: createProgram });

  // Mutasi buat update data lama
  const updateMut = useMutation({
    // Fungsi panggil api update
    mutationFn: ({ id, data }: { id: string; data: ProgramFormData }) =>
      updateProgram(id, data),
  });

  // Mutasi buat hapus data
  const deleteMut = useMutation({
    // Fungsi panggil api hapus
    mutationFn: deleteProgram,
    // Aksi setelah sukses
    onSuccess: () => {
      // Invalidate data biar update otomatis
      queryClient.invalidateQueries({ queryKey: ["programs"] });
      // Reset id konfirmasi hapus
      setDeleteConfirmId(null);
      // Notif sukses
      toast.success("Data program berhasil dihapus!");
    },
  });

  // Data baris kosong default buat nambah program
  const defaultEmptyRow: ProgramFormData = {
    // Nama kosong
    name: "",
    // Kategori default
    category: "A",
    // Deskripsi kategori
    descriptionCategory: "General",
    // Broadcast time kosong
    broadcastTime: "",
    // List periode awal
    periods: [
      {
        // Id unik
        id: `new-${Date.now()}`,
        // Bulan sekarang
        month: selectedPeriod || new Date().toISOString().slice(0, 7),
        // Data performa default
        performanceTV: {
          targetTVR: 0,
          targetShare: 0,
          actualTVR: 0,
          actualShare: 0,
        },
        // Data performa digital default
        performanceDigital: { views: 0, revenue: 0 },
        // Data finansial default
        financials: {
          costDirect: 0,
          revenueTarget: 0,
          revenueActual: 0,
          pnl: 0,
        },
        // Data inventori default
        inventory: { spot: 0, adRate: 0 },
        // Status awal
        status: "Normal",
      },
    ],
  };

  // Fungsi buat buka modal mode tambah
  const openAddModal = () => {
    // Reset id edit
    setEditingId(null);
    // Setup data kosong 5 baris
    setRowData(
      Array(5)
        .fill(null)
        .map(() => JSON.parse(JSON.stringify(defaultEmptyRow))),
    );
    // Buka modal
    setIsModalOpen(true);
  };

  // Fungsi buka modal mode edit
  const openEditModal = (prog: ProgramFormData) => {
    // Pisah id dari data
    const { id, ...formData } = prog as ProgramFormData & {
      id?: string;
      createdAt?: string;
      updatedAt?: string;
    };
    // Set id edit
    setEditingId(id ?? null);
    // Set row data buat diedit
    setRowData([formData as ProgramFormData]);
    // Buka modal
    setIsModalOpen(true);
  };

  // Fungsi buat nutup modal
  const closeModal = () => {
    // Tutup modal
    setIsModalOpen(false);
    // Reset id edit
    setEditingId(null);
    // Bersihin row data
    setRowData([]);
  };

  // Fungsi buat nambah baris kosong di tabel
  const addRow = () => {
    // Gabung data lama sama baris baru
    const newData = [...rowData, JSON.parse(JSON.stringify(defaultEmptyRow))];
    // Update state row
    setRowData(newData);
    // Update grid api
    gridRef.current?.api.setGridOption("rowData", newData);
  };

  // Fungsi submit data bulk ke backend
  const submitBulkData = async () => {
    // Kalo grid kosong balikin
    if (!gridRef.current) return;

    // Array buat nampung payload
    const rawPayload: ProgramFormData[] = [];

    // Loop tiap baris di grid
    gridRef.current.api.forEachNode((node) => {
      // Kalo ada data dan nama program diisi
      if (node.data && node.data.name) {
        // Ambil periode terbaru buat hitung pnl
        const latestPeriod = getActivePeriod(node.data, selectedPeriod);
        // Kalo ada periode hitung pnl otomatis
        if (latestPeriod) {
          latestPeriod.financials.pnl =
            (latestPeriod.financials.revenueActual || 0) +
            (latestPeriod.performanceDigital.revenue || 0) -
            (latestPeriod.financials.costDirect || 0);
        }
        // Masukin ke payload
        rawPayload.push(node.data);
      }
    });

    // Array buat payload valid
    const validPayload: ProgramFormData[] = [];
    // Array buat nampung error
    const errors: string[] = [];

    // Validasi tiap data pake zod
    rawPayload.forEach((data, index) => {
      // Cek validasi
      const validation = programFormSchema.safeParse(data);
      // Kalo sukses masukin payload
      if (validation.success) {
        validPayload.push(validation.data);
      } else {
        // Kalo gagal ambil pesan error
        const firstErrorMsg = validation.error.issues[0].message;
        const fieldPath = validation.error.issues[0].path.join(".");
        // Masukin ke array error
        errors.push(
          `Baris ${index + 1} (${data.name || "Tanpa Nama"}) - Kolom '${fieldPath}', ${firstErrorMsg}`,
        );
      }
    });

    // Kalo ada error tampilkan notif
    if (errors.length > 0) {
      toast.error("Gagal Menyimpan Data", {
        description: (
          <div className="flex flex-col gap-1 mt-1 text-sm">
            {errors.map((err, i) => (
              <span key={i}>• {err}</span>
            ))}
          </div>
        ),
        duration: 5000,
      });
      return;
    }

    // Log payload yang bakal dikirim
    console.log("Payload submit:", validPayload);

    // Kalo edit panggil update mutasi
    if (editingId && validPayload.length > 0) {
      await updateMut.mutateAsync({ id: editingId, data: validPayload[0] });
      toast.success("Perubahan data berhasil disimpan!");
    } else {
      // Kalo create panggil mutasi create buat tiap item
      await Promise.all(
        validPayload.map((prog) => createMut.mutateAsync(prog)),
      );
      toast.success(
        `${validPayload.length} Data program berhasil ditambahkan!`,
      );
    }

    // Refresh data dan tutup modal
    queryClient.invalidateQueries({ queryKey: ["programs"] });
    closeModal();
  };

  // Memo konfigurasi kolom buat tabel read only
  const tableColumns = useMemo<ColumnConfig<ProgramFormData>[]>(
    () => [
      {
        header: "Nama Program",
        accessorKey: "name",
        render: (item) => (
          <span className="font-semibold text-foreground">{item.name}</span>
        ),
      },
      {
        header: "Kategori",
        accessorKey: "category",
        render: (item) => (
          <span className="bg-secondary text-secondary-foreground px-2.5 py-1 rounded-md text-[11px] font-bold">
            {item.category}
          </span>
        ),
      },
      {
        header: "Jam Tayang",
        accessorKey: "broadcastTime",
        render: (item) => (
          <span className="font-medium text-foreground">
            {item.broadcastTime}
          </span>
        ),
      },
      {
        header: "Target/Cap. Rev",
        render: (item) => {
          const latest = getActivePeriod(item, selectedPeriod);
          return (
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">
                Target, Rp{" "}
                {(latest?.financials?.revenueTarget ?? 0).toLocaleString(
                  "id-ID",
                )}
              </span>
              <span className="font-medium text-primary">
                Actual, Rp{" "}
                {(latest?.financials?.revenueActual ?? 0).toLocaleString(
                  "id-ID",
                )}
              </span>
            </div>
          );
        },
      },
      {
        header: "PNL",
        accessorFn: (item) => {
          return getActivePeriod(item, selectedPeriod)?.financials?.pnl;
        },
        render: (item) => {
          const pnl =
            getActivePeriod(item, selectedPeriod)?.financials?.pnl ?? 0;
          return (
            <span
              className={`font-bold ${pnl < 0 ? "text-destructive" : "text-green-600"}`}
            >
              Rp {pnl.toLocaleString("id-ID")}
            </span>
          );
        },
      },
      {
        header: "Aksi",
        className: "text-right",
        render: (item) => (
          <div className="space-x-2 text-right">
            <button
              onClick={() => openEditModal(item)}
              className="p-2 bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 transition-colors rounded-xl cursor-pointer inline-flex"
            >
              <Edit2 size={16} />
            </button>
            <button
              onClick={() => setDeleteConfirmId(item.id ?? null)}
              className="p-2 bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors rounded-xl cursor-pointer inline-flex"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ),
      },
    ],
    [selectedPeriod],
  );

  // Memo konfigurasi filter
  const selectFilters = useMemo<FilterSelectConfig[]>(
    () => [
      {
        key: "category",
        label: "Semua Kategori",
        options: [
          { label: "A", value: "A" },
          { label: "B", value: "B" },
          { label: "C", value: "C" },
          { label: "Signature", value: "Signature" },
          { label: "Others", value: "Others" },
        ],
      },
    ],
    [],
  );

  // Fungsi parser angka buat input grid
  const numberParser = (params: ValueParserParams<ProgramFormData, number>) =>
    Number(params.newValue) || 0;

  // Memo definisi kolom buat ag grid modal
  const colDefs = useMemo<ColDef<ProgramFormData>[]>(
    () => [
      {
        // Judul header
        headerName: "Aksi",
        // Field data
        field: "name",
        // Lebar kolom
        width: 65,
        // Lebar minimum
        minWidth: 65,
        // Lebar maksimum
        maxWidth: 65,
        // Pin kolom di kiri
        pinned: "left",
        // Jangan sesuaikan ukuran
        suppressSizeToFit: true,
        // Style centering sel
        cellStyle: {
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        },
        // Render tombol hapus
        cellRenderer: (
          params: ICellRendererParams<ProgramFormData, string>,
        ) => {
          // Kalo lagi edit jangan tampilin tombol hapus
          if (editingId) return null;
          return (
            <button
              // Aksi hapus baris
              onClick={() => {
                // Copy data row
                const currentData = [...rowData];
                // Hapus satu item
                currentData.splice(params.node!.rowIndex!, 1);
                // Update state
                setRowData(currentData);
                // Update grid api
                gridRef.current?.api.setGridOption("rowData", currentData);
              }}
              // Style tombol
              className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded cursor-pointer transition-colors"
            >
              {/* Ikon trash */}
              <Trash2 size={16} />
            </button>
          );
        },
        // Disable edit buat kolom ini
        editable: false,
        // Disable sort
        sortable: false,
        // Disable filter
        filter: false,
      },
      {
        // Judul kolom
        headerName: "Periode",
        // Lebar kolom
        width: 120,
        // Aktifin edit
        editable: true,
        // Ambil data periode
        valueGetter: (params: ValueGetterParams<ProgramFormData, string>) =>
          getActivePeriod(params.data, selectedPeriod)?.month ?? "",
        // Set data periode
        valueSetter: (params: ValueSetterParams<ProgramFormData, string>) => {
          const period = getActivePeriod(params.data, selectedPeriod);
          // Kalo ada periode dan nilai baru set bulan
          if (period && params.newValue) {
            period.month = params.newValue;
            return true;
          }
          return false;
        },
      },
      {
        // Field nama program
        field: "name",
        // Judul header
        headerName: "Nama Program",
        // Lebar kolom
        width: 220,
        // Aktifin edit
        editable: true,
      },
      {
        // Field kategori
        field: "category",
        // Judul header
        headerName: "Kategori",
        // Lebar kolom
        width: 120,
        // Aktifin edit
        editable: true,
        // Editor pakai dropdown
        cellEditor: "agSelectCellEditor",
        // Opsi dropdown kategori
        cellEditorParams: {
          values: ["A", "B", "C", "Signature", "Blocking Reguler", "Others"],
        },
      },
      {
        // Field jam tayang
        field: "broadcastTime",
        // Judul header
        headerName: "Jam Tayang",
        // Lebar kolom
        width: 120,
        // Aktifin edit
        editable: true,
      },
      {
        // Judul header
        headerName: "Target TVR",
        // Lebar kolom
        width: 130,
        // Aktifin edit
        editable: true,
        // Parser angka
        valueParser: numberParser,
        // Ambil data target tvr
        valueGetter: (params: ValueGetterParams<ProgramFormData, number>) =>
          getActivePeriod(params.data, selectedPeriod)?.performanceTV
            ?.targetTVR ?? 0,
        // Setter target tvr
        valueSetter: (params: ValueSetterParams<ProgramFormData, number>) => {
          const period = getActivePeriod(params.data, selectedPeriod);
          // Kalo periode ada set target tvr
          if (period) {
            period.performanceTV.targetTVR = params.newValue ?? 0;
            return true;
          }
          return false;
        },
      },
      {
        // Judul header
        headerName: "Actual TVR",
        // Lebar kolom
        width: 130,
        // Aktifin edit
        editable: true,
        // Parser angka
        valueParser: numberParser,
        // Ambil data actual tvr
        valueGetter: (params: ValueGetterParams<ProgramFormData, number>) =>
          getActivePeriod(params.data, selectedPeriod)?.performanceTV
            ?.actualTVR ?? 0,
        // Setter actual tvr
        valueSetter: (params: ValueSetterParams<ProgramFormData, number>) => {
          const period = getActivePeriod(params.data, selectedPeriod);
          // Kalo periode ada set actual tvr
          if (period) {
            period.performanceTV.actualTVR = params.newValue ?? 0;
            return true;
          }
          return false;
        },
      },
      {
        // Judul header
        headerName: "Target Share (%)",
        // Lebar kolom
        width: 140,
        // Aktifin edit
        editable: true,
        // Parser angka
        valueParser: numberParser,
        // Ambil data target share
        valueGetter: (params: ValueGetterParams<ProgramFormData, number>) =>
          getActivePeriod(params.data, selectedPeriod)?.performanceTV
            ?.targetShare ?? 0,
        // Setter target share
        valueSetter: (params: ValueSetterParams<ProgramFormData, number>) => {
          const period = getActivePeriod(params.data, selectedPeriod);
          // Kalo periode ada set target share
          if (period) {
            period.performanceTV.targetShare = params.newValue ?? 0;
            return true;
          }
          return false;
        },
      },
      {
        // Judul header
        headerName: "Actual Share (%)",
        // Lebar kolom
        width: 140,
        // Aktifin edit
        editable: true,
        // Parser angka
        valueParser: numberParser,
        // Ambil data actual share
        valueGetter: (params: ValueGetterParams<ProgramFormData, number>) =>
          getActivePeriod(params.data, selectedPeriod)?.performanceTV
            ?.actualShare ?? 0,
        // Setter actual share
        valueSetter: (params: ValueSetterParams<ProgramFormData, number>) => {
          const period = getActivePeriod(params.data, selectedPeriod);
          // Kalo periode ada set actual share
          if (period) {
            period.performanceTV.actualShare = params.newValue ?? 0;
            return true;
          }
          return false;
        },
      },
      {
        // Judul header
        headerName: "Digital Views",
        // Lebar kolom
        width: 140,
        // Aktifin edit
        editable: true,
        // Parser angka
        valueParser: numberParser,
        // Ambil data views
        valueGetter: (params: ValueGetterParams<ProgramFormData, number>) =>
          getActivePeriod(params.data, selectedPeriod)?.performanceDigital
            ?.views ?? 0,
        // Setter views
        valueSetter: (params: ValueSetterParams<ProgramFormData, number>) => {
          const period = getActivePeriod(params.data, selectedPeriod);
          // Kalo periode ada set views
          if (period) {
            period.performanceDigital.views = params.newValue ?? 0;
            return true;
          }
          return false;
        },
      },
      {
        // Judul header
        headerName: "Digital Revenue (Rp)",
        // Lebar kolom
        width: 160,
        // Aktifin edit
        editable: true,
        // Parser angka
        valueParser: numberParser,
        // Ambil data rev digital
        valueGetter: (params: ValueGetterParams<ProgramFormData, number>) =>
          getActivePeriod(params.data, selectedPeriod)?.performanceDigital
            ?.revenue ?? 0,
        // Setter rev digital
        valueSetter: (params: ValueSetterParams<ProgramFormData, number>) => {
          const period = getActivePeriod(params.data, selectedPeriod);
          // Kalo periode ada set rev digital
          if (period) {
            period.performanceDigital.revenue = params.newValue ?? 0;
            return true;
          }
          return false;
        },
      },
      {
        // Judul header
        headerName: "Cost Direct (Rp)",
        // Lebar kolom
        width: 160,
        // Aktifin edit
        editable: true,
        // Parser angka
        valueParser: numberParser,
        // Ambil data cost direct
        valueGetter: (params: ValueGetterParams<ProgramFormData, number>) =>
          getActivePeriod(params.data, selectedPeriod)?.financials
            ?.costDirect ?? 0,
        // Setter cost direct
        valueSetter: (params: ValueSetterParams<ProgramFormData, number>) => {
          const period = getActivePeriod(params.data, selectedPeriod);
          // Kalo periode ada set cost direct
          if (period) {
            period.financials.costDirect = params.newValue ?? 0;
            return true;
          }
          return false;
        },
      },
      {
        // Judul header
        headerName: "Target Rev (Rp)",
        // Lebar kolom
        width: 160,
        // Aktifin edit
        editable: true,
        // Parser angka
        valueParser: numberParser,
        // Ambil data target rev
        valueGetter: (params: ValueGetterParams<ProgramFormData, number>) =>
          getActivePeriod(params.data, selectedPeriod)?.financials
            ?.revenueTarget ?? 0,
        // Setter target rev
        valueSetter: (params: ValueSetterParams<ProgramFormData, number>) => {
          const period = getActivePeriod(params.data, selectedPeriod);
          // Kalo periode ada set target rev
          if (period) {
            period.financials.revenueTarget = params.newValue ?? 0;
            return true;
          }
          return false;
        },
      },
      {
        // Judul header
        headerName: "Actual Rev (Rp)",
        // Lebar kolom
        width: 160,
        // Aktifin edit
        editable: true,
        // Parser angka
        valueParser: numberParser,
        // Ambil data actual rev
        valueGetter: (params: ValueGetterParams<ProgramFormData, number>) =>
          getActivePeriod(params.data, selectedPeriod)?.financials
            ?.revenueActual ?? 0,
        // Setter actual rev
        valueSetter: (params: ValueSetterParams<ProgramFormData, number>) => {
          const period = getActivePeriod(params.data, selectedPeriod);
          // Kalo periode ada set actual rev
          if (period) {
            period.financials.revenueActual = params.newValue ?? 0;
            return true;
          }
          return false;
        },
      },
      {
        // Judul header
        headerName: "Auto PNL (Rp)",
        // Lebar kolom
        width: 160,
        // Disable edit
        editable: false,
        // Getter pnl otomatis
        valueGetter: (params: ValueGetterParams<ProgramFormData, number>) => {
          const latest = getActivePeriod(params.data, selectedPeriod);
          const rev = latest?.financials?.revenueActual ?? 0;
          const digRev = latest?.performanceDigital?.revenue ?? 0;
          const cost = latest?.financials?.costDirect ?? 0;
          return rev + digRev - cost;
        },
        // Style buat sel pnl
        cellStyle: (params: CellClassParams<ProgramFormData, number>) => {
          const val = params.value ?? 0;
          return {
            // Bold tebal
            fontWeight: "bold",
            // Warna merah kalo rugi, ijo kalo untung
            color: val < 0 ? "#dc2626" : val > 0 ? "#16a34a" : "inherit",
            // Background dikit
            backgroundColor: "rgba(0,0,0,0.03)",
          };
        },
      },
      {
        // Judul header
        headerName: "Inventory Spot",
        // Lebar kolom
        width: 140,
        // Aktifin edit
        editable: true,
        // Parser angka
        valueParser: numberParser,
        // Ambil data inventory spot
        valueGetter: (params: ValueGetterParams<ProgramFormData, number>) =>
          getActivePeriod(params.data, selectedPeriod)?.inventory?.spot ?? 0,
        // Setter inventory spot
        valueSetter: (params: ValueSetterParams<ProgramFormData, number>) => {
          const period = getActivePeriod(params.data, selectedPeriod);
          // Kalo periode ada set inventory spot
          if (period) {
            period.inventory.spot = params.newValue ?? 0;
            return true;
          }
          return false;
        },
      },
      {
        // Judul header
        headerName: "Rate Iklan (Rp)",
        // Lebar kolom
        width: 150,
        // Aktifin edit
        editable: true,
        // Parser angka
        valueParser: numberParser,
        // Ambil data rate iklan
        valueGetter: (params: ValueGetterParams<ProgramFormData, number>) =>
          getActivePeriod(params.data, selectedPeriod)?.inventory?.adRate ?? 0,
        // Setter rate iklan
        valueSetter: (params: ValueSetterParams<ProgramFormData, number>) => {
          const period = getActivePeriod(params.data, selectedPeriod);
          // Kalo periode ada set rate iklan
          if (period) {
            period.inventory.adRate = params.newValue ?? 0;
            return true;
          }
          return false;
        },
      },
      {
        // Judul header
        headerName: "Status",
        // Lebar kolom
        width: 150,
        // Aktifin edit
        editable: true,
        // Editor dropdown status
        cellEditor: "agSelectCellEditor",
        // Ambil status periode
        valueGetter: (params: ValueGetterParams<ProgramFormData, string>) =>
          getActivePeriod(params.data, selectedPeriod)?.status ?? "",
        // Setter status
        valueSetter: (params: ValueSetterParams<ProgramFormData, string>) => {
          const period = getActivePeriod(params.data, selectedPeriod);
          // Kalo periode dan status ada set status
          if (period && params.newValue) {
            period.status = params.newValue;
            return true;
          }
          return false;
        },
        // Opsi status
        cellEditorParams: {
          values: [
            "Overachieve",
            "Sesuai Target",
            "Stabil",
            "Underperform",
            "Rugi",
            "Normal",
          ],
        },
      },
    ],
    [editingId, rowData, selectedPeriod],
  );

  // Balikin semua fungsi dan state
  return {
    programs,
    isLoading,
    gridRef,
    isModalOpen,
    editingId,
    deleteConfirmId,
    rowData,
    tableColumns,
    selectFilters,
    colDefs,
    selectedPeriod,
    setSelectedPeriod,
    periodOptions,
    mutations: { createMut, updateMut, deleteMut },
    actions: {
      openAddModal,
      openEditModal,
      closeModal,
      addRow,
      submitBulkData,
      setDeleteConfirmId,
    },
  };
}
