"use client";

import React, { useState, useMemo, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Edit2, Trash2 } from "lucide-react";
import { AgGridReact } from "ag-grid-react";
import {
  ColDef,
  ValueParserParams,
  ICellRendererParams,
  ValueGetterParams,
  CellClassParams,
} from "ag-grid-community";
import { toast } from "sonner";

import {
  fetchProgramsByRange,
  createProgram,
  updateProgram,
  deleteProgram,
} from "@/services/api/programService";
import {
  ColumnConfig,
  FilterSelectConfig,
} from "@/components/shared/SmartTable";
import { ProgramFormData, programFormSchema } from "@/schemas/program";

export function useMasterProgram() {
  const queryClient = useQueryClient();
  const gridRef = useRef<AgGridReact>(null);

  // Kumpulan state buat ngatur buka-tutup modal dan nyimpen data sementara
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [rowData, setRowData] = useState<ProgramFormData[]>([]);

  // Narik data dari server pas komponen pertama kali dirender
  const { data: programs = [], isLoading } = useQuery({
    queryKey: ["programs", "all"],
    queryFn: () => fetchProgramsByRange("", ""),
  });

  // Kurir khusus buat ngirim data baru (Create)
  const createMut = useMutation({ mutationFn: createProgram });

  // Kurir khusus buat nimpa data lama (Update)
  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ProgramFormData }) =>
      updateProgram(id, data),
  });

  // Kurir khusus buat ngebuang data (Delete)
  const deleteMut = useMutation({
    mutationFn: deleteProgram,
    onSuccess: () => {
      // Kalo sukses ngapus, paksa React Query buat narik data terbaru lagi dari server
      queryClient.invalidateQueries({ queryKey: ["programs"] });
      setDeleteConfirmId(null);
      toast.success("Data program berhasil dihapus!");
    },
  });

  // Cetakan standar buat baris baru di AG Grid biar ga pada undefined/kosong
  const defaultEmptyRow: ProgramFormData = {
    periodeBulan: "",
    name: "",
    category: "A",
    // Kasih default biar ga ditolak Zod
    descriptionCategory: "General",
    broadcastTime: "",
    capaianTVR: 0,
    capaianShare: 0,
    targetTVR: 0,
    targetShare: 0,
    digitalViews: 0,
    digitalRevenue: 0,
    costDirect: 0,
    revenueTarget: 0,
    revenueCapaian: 0,
    pnl: 0,
    inventorySpot: 0,
    rateIklan: 0,
    keterangan: "Normal",
  };

  // Fungsi buka modal mode "Tambah Data"
  const openAddModal = () => {
    setEditingId(null);
    // Langsung tembakin 5 baris kosong ke dalem tabel pas modal baru dibuka
    setRowData(
      Array(5)
        .fill(null)
        .map(() => ({ ...defaultEmptyRow })),
    );
    setIsModalOpen(true);
  };

  // Fungsi buka modal mode "Edit Data Spesifik"
  const openEditModal = (prog: ProgramFormData) => {
    // Pisahin id sama tanggalan, cuma butuh data mentahnya buat di form
    const { id, createdAt, updatedAt, ...formData } = prog;
    setEditingId(prog.id ?? null);
    setRowData([formData]);
    setIsModalOpen(true);
  };

  // Fungsi bersih-bersih pas modal ditutup biar datanya ga bocor ke render berikutnya
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setRowData([]);
  };

  // Fungsi buat nambah satu baris kosong baru di ujung bawah tabel AG Grid
  const addRow = () => {
    const newData = [...rowData, { ...defaultEmptyRow }];
    setRowData(newData);
    // Pake API bawannya AG Grid buat maksa update tampilannya
    gridRef.current?.api.setGridOption("rowData", newData);
  };

  // Eksekusi pas tombol save diklik, disini Zod bakal validasi
  const submitBulkData = async () => {
    if (!gridRef.current) return;

    const rawPayload: ProgramFormData[] = [];

    // Loop semua baris yang ada di AG Grid
    gridRef.current.api.forEachNode((node) => {
      // Cuma ambil baris yang minimal kolom namanya diisi, ngabaikan baris kosong
      if (node.data && node.data.name) {
        // Otomatis itung PNL dari revenue dikurang cost biar ga usah ngitung manual
        node.data.pnl =
          (node.data.revenueCapaian || 0) +
          (node.data.digitalRevenue || 0) -
          (node.data.costDirect || 0);
        rawPayload.push(node.data);
      }
    });

    // Validasi zod
    const validPayload: ProgramFormData[] = [];
    const errors: string[] = [];

    // Cek satu-satu barisnya pake schema Zod
    rawPayload.forEach((data, index) => {
      const validation = programFormSchema.safeParse(data);
      if (validation.success) {
        // Kalo aman, masukin ke array payload yang siap dikirim
        validPayload.push(validation.data);
      } else {
        // Kalo ada yang langgar aturan, ambil pesan error pertamanya buat ditampilin
        const firstErrorMsg = validation.error.issues[0].message;
        const fieldPath = validation.error.issues[0].path.join(".");
        errors.push(
          `Baris ${index + 1} (${data.name || "Tanpa Nama"}) - Kolom '${fieldPath}': ${firstErrorMsg}`,
        );
      }
    });

    // Kalo array error ada isinya, cegat proses save dan tembak alert ke user
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
    // End validasi zod

    console.log("Payload submit:", validPayload);

    // Kalo mode edit (cuma 1 baris), lempar ke mutasi update
    if (editingId && validPayload.length > 0) {
      await updateMut.mutateAsync({ id: editingId, data: validPayload[0] });
      toast.success("Perubahan data berhasil disimpan!");
    } else {
      // Kalo mode bulk insert, loop payloadnya trus tembak mutasi create barengan pake Promise.all
      await Promise.all(
        validPayload.map((prog) => createMut.mutateAsync(prog)),
      );
      toast.success(
        `${validPayload.length} Data program berhasil ditambahkan!`,
      );
    }

    // Refresh data di background trus tutup modalnya
    queryClient.invalidateQueries({ queryKey: ["programs"] });
    closeModal();
  };

  // Setup kolom buat tabel utama pas cuma baca data
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
        header: "Periode",
        accessorKey: "periodeBulan",
        render: (item) => (
          <span className="font-medium">{item.periodeBulan}</span>
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
        render: (item) => (
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">
              Target: Rp {item.revenueTarget.toLocaleString("id-ID")}
            </span>
            <span className="font-medium text-primary">
              Actual: Rp {item.revenueCapaian.toLocaleString("id-ID")}
            </span>
          </div>
        ),
      },
      {
        header: "PNL",
        accessorKey: "pnl",
        render: (item) => (
          <span
            className={`font-bold ${item.pnl < 0 ? "text-destructive" : "text-green-600"}`}
          >
            Rp {item.pnl.toLocaleString("id-ID")}
          </span>
        ),
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
    [],
  );

  // Setup dropdown filter di atas tabel utama
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

  // Config
  // Fungsi kecil buat ngubah inputan cell AG Grid jadi angka murni (fallback ke 0 kalo error)
  const numberParser = (params: ValueParserParams<ProgramFormData>) =>
    Number(params.newValue) || 0;

  // Setup definisi kolom buat modal spreadsheet AG Grid
  const colDefs = useMemo<ColDef<ProgramFormData>[]>(
    () => [
      {
        headerName: "Aksi",
        field: "name" as keyof ProgramFormData,
        width: 65,
        minWidth: 65,
        maxWidth: 65,
        pinned: "left",
        suppressSizeToFit: true,
        cellStyle: {
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        },
        cellRenderer: (params: ICellRendererParams<ProgramFormData>) => {
          // Tombol hapus baris disembunyiin kalo lagi mode edit data spesifik
          if (editingId) return null;
          return (
            <button
              onClick={() => {
                const currentData = [...rowData];
                currentData.splice(params.node!.rowIndex!, 1);
                setRowData(currentData);
                gridRef.current?.api.setGridOption("rowData", currentData);
              }}
              className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded cursor-pointer transition-colors"
            >
              <Trash2 size={16} />
            </button>
          );
        },
        editable: false,
        sortable: false,
        filter: false,
      },
      {
        field: "periodeBulan",
        headerName: "Periode",
        width: 120,
        editable: true,
      },
      { field: "name", headerName: "Nama Program", width: 220, editable: true },
      {
        field: "category",
        headerName: "Kategori",
        width: 120,
        editable: true,
        cellEditor: "agSelectCellEditor",
        cellEditorParams: {
          values: ["A", "B", "C", "Signature", "Blocking Reguler", "Others"],
        },
      },
      {
        field: "broadcastTime",
        headerName: "Jam Tayang",
        width: 120,
        editable: true,
      },
      {
        field: "targetTVR",
        headerName: "Target TVR",
        width: 130,
        editable: true,
        valueParser: numberParser,
      },
      {
        field: "capaianTVR",
        headerName: "Actual TVR",
        width: 130,
        editable: true,
        valueParser: numberParser,
      },
      {
        field: "targetShare",
        headerName: "Target Share (%)",
        width: 140,
        editable: true,
        valueParser: numberParser,
      },
      {
        field: "capaianShare",
        headerName: "Actual Share (%)",
        width: 140,
        editable: true,
        valueParser: numberParser,
      },
      {
        field: "digitalViews",
        headerName: "Digital Views",
        width: 140,
        editable: true,
        valueParser: numberParser,
      },
      {
        field: "digitalRevenue",
        headerName: "Digital Revenue (Rp)",
        width: 160,
        editable: true,
        valueParser: numberParser,
      },
      {
        field: "costDirect",
        headerName: "Cost Direct (Rp)",
        width: 160,
        editable: true,
        valueParser: numberParser,
      },
      {
        field: "revenueTarget",
        headerName: "Target Rev (Rp)",
        width: 160,
        editable: true,
        valueParser: numberParser,
      },
      {
        field: "revenueCapaian",
        headerName: "Actual Rev (Rp)",
        width: 160,
        editable: true,
        valueParser: numberParser,
      },
      {
        headerName: "Auto PNL (Rp)",
        width: 160,
        editable: false,
        // Ngambil nilai PNL secara live dari kalkulasi revenue dikurang cost
        // Kalo ada rumus pake properti valueGetter ini
        // Editable harus false biar cellnya ga bisa diketik manual
        valueGetter: (params: ValueGetterParams<ProgramFormData>) => {
          const rev = params.data?.revenueCapaian || 0;
          const digRev = params.data?.digitalRevenue || 0;
          const cost = params.data?.costDirect || 0;
          return rev + digRev - cost;
        },
        cellStyle: (params: CellClassParams<ProgramFormData>) => {
          const val = params.value;
          return {
            fontWeight: "bold",
            // Kalo rugi warna merah, kalo untung warna ijo
            color: val < 0 ? "#dc2626" : val > 0 ? "#16a34a" : "inherit",
            backgroundColor: "rgba(0,0,0,0.03)",
          };
        },
      },
      {
        field: "inventorySpot",
        headerName: "Inventory Spot",
        width: 140,
        editable: true,
        valueParser: numberParser,
      },
      {
        field: "rateIklan",
        headerName: "Rate Iklan (Rp)",
        width: 150,
        editable: true,
        valueParser: numberParser,
      },
      {
        field: "keterangan",
        headerName: "Status",
        width: 150,
        editable: true,
        cellEditor: "agSelectCellEditor",
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
    [editingId, rowData],
  );

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
