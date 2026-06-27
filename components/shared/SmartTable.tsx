"use client";

// Import React buat bikin komponen
import React, {
  // Import hook useState buat simpen state internal
  useState,
  // Import hook useMemo buat optimalisasi hitungan
  useMemo,
} from "react";
// Import ikon panah kiri dari lucide react
import {
  ChevronLeft,
  // Import ikon panah kanan dari lucide react
  ChevronRight,
  // Import ikon panah double kiri dari lucide react
  ChevronsLeft,
  // Import ikon panah double kanan dari lucide react
  ChevronsRight,
  // Import ikon search dari lucide react
  Search,
  // Import ikon panah atas bawah dari lucide react
  ArrowUpDown,
  // Import ikon filterx dari lucide react
  FilterX,
} from "lucide-react";
// Import modul utama buat tabel dari tanstack react table
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  SortingState,
  Row,
  CellContext,
} from "@tanstack/react-table";
// Import fungsi cn biar bisa gabungin classname dengan rapi
import { cn } from "@/lib/utils";

// Interface buat konfigurasi kolom tabel
export interface ColumnConfig<T> {
  // Teks judul kolom
  header: string;
  // Key data buat akses properti objek
  accessorKey?: string;
  // Fungsi akses buat ngolah data sebelum tampil
  accessorFn?: (item: T) => unknown;
  // Fungsi render buat nampilin elemen kustom di sel
  render: (item: T) => React.ReactNode;
  // Classname tambahan buat styling kolom
  className?: string;
}

// Interface buat pilihan filter
export interface FilterOption {
  // Label buat teks pilihan
  label: string;
  // Nilai yang dipake buat saring data
  value: string;
}

// Interface buat konfigurasi dropdown filter
export interface FilterSelectConfig {
  // Key buat identifikasi filter
  key: string;
  // Label judul filter
  label: string;
  // Array pilihan opsi filter
  options: FilterOption[];
}

// Interface buat props komponen smart table
interface SmartTableProps<T> {
  // Array data yang mau ditampilin
  data: T[];
  // Konfigurasi kolom tabel
  columns: ColumnConfig<T>[];
  // Opsi filter dropdown
  selectFilters?: FilterSelectConfig[];
  // Status buat ngaktifin filter rentang tanggal
  enableDateRange?: boolean;
  // Key data tanggal atau fungsi buat ngambil tanggal
  dateKey?: string | ((item: T) => string);
  // Teks placeholder di input search
  searchPlaceholder?: string;
  // Classname tambahan buat kontainer utama
  className?: string;
}

// Fungsi filter global biar pencarian bisa tembus semua kolom
const globalFilterFn = <T,>(
  row: Row<T>,
  columnId: string,
  filterValue: unknown,
): boolean => {
  // Ubah query pencarian jadi huruf kecil biar ga sensitif case
  const query = String(filterValue).toLowerCase();
  // Stringify objek baris terus cek apakah mengandung query tadi
  return JSON.stringify(row.original).toLowerCase().includes(query);
};

// Komponen utama smart table buat nampilin data secara interaktif
export default function SmartTable<T>({
  // Ambil data dari props
  data,
  // Ambil konfigurasi kolom dari props
  columns,
  // Ambil filter dropdown dari props
  selectFilters = [],
  // Ambil status date range dari props
  enableDateRange = false,
  // Ambil date key dari props
  dateKey,
  // Ambil placeholder dari props
  searchPlaceholder = "Cari data...",
  // Ambil classname dari props
  className,
}: SmartTableProps<T>) {
  // State buat nyimpen status sortir
  const [sorting, setSorting] = useState<SortingState>([]);
  // State buat nyimpen string pencarian
  const [globalFilter, setGlobalFilter] = useState("");

  // State buat nyimpen nilai filter dinamis dari dropdown
  const [dynamicFilters, setDynamicFilters] = useState<Record<string, string>>(
    {},
  );
  // State buat nyimpen bulan mulai filter
  const [startMonth, setStartMonth] = useState("");
  // State buat nyimpen bulan akhir filter
  const [endMonth, setEndMonth] = useState("");

  // Memo buat saring data awal sebelum masuk mesin tanstack
  const preFilteredData = useMemo(() => {
    // Copy data awal
    let result = [...data];

    // Cek kalo fitur rentang tanggal aktif dan key ada
    if (enableDateRange && dateKey) {
      // Saring berdasarkan bulan mulai
      if (startMonth) {
        result = result.filter((item) => {
          // Ambil nilai tanggal dari item
          const val =
            typeof dateKey === "function"
              ? dateKey(item)
              : String((item as Record<string, unknown>)[dateKey as string]);
          // Cek kalo bulan lebih gede atau sama dengan bulan mulai
          return val >= startMonth;
        });
      }
      // Saring berdasarkan bulan akhir
      if (endMonth) {
        result = result.filter((item) => {
          // Ambil nilai tanggal dari item
          const val =
            typeof dateKey === "function"
              ? dateKey(item)
              : String((item as Record<string, unknown>)[dateKey as string]);
          // Cek kalo bulan lebih kecil atau sama dengan bulan akhir
          return val <= endMonth;
        });
      }
    }

    // Saring data berdasarkan filter dropdown dinamis
    Object.keys(dynamicFilters).forEach((key) => {
      // Ambil nilai filter
      const filterValue = dynamicFilters[key];
      // Kalo ada nilainya, filter data
      if (filterValue) {
        result = result.filter((item) => {
          // Ambil nilai dari item sesuai key
          const itemValue = (item as Record<string, unknown>)[key];
          // Cek kecocokan nilai
          return String(itemValue) === filterValue;
        });
      }
    });

    // Balikin data yang udah disaring
    return result;
  }, [data, dynamicFilters, startMonth, endMonth, enableDateRange, dateKey]);

  // Memo buat susun format kolom sesuai standar tanstack
  const tanstackColumns = useMemo(() => {
    // Mapping kolom dari props ke kolom tabel
    return columns.map((col) => ({
      id: col.accessorKey || col.header,
      accessorKey: col.accessorKey,
      accessorFn: col.accessorFn,
      header: col.header,
      cell: (info: CellContext<T, unknown>) => col.render(info.row.original),
      // Aktifin fitur sortir
      enableSorting: !!col.accessorKey || !!col.accessorFn,
      meta: {
        // Simpen class kustom di meta
        className: col.className,
      },
    }));
  }, [columns]);

  // Inisialisasi instance tabel tanstack
  const table = useReactTable({
    data: preFilteredData,
    columns: tanstackColumns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: globalFilterFn,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  // Fungsi buat reset filter ke kondisi awal
  const handleClearFilters = () => {
    // Reset pencarian
    setGlobalFilter("");
    // Reset filter dinamis
    setDynamicFilters({});
    // Reset bulan mulai
    setStartMonth("");
    // Reset bulan akhir
    setEndMonth("");
    // Reset ke halaman pertama
    table.setPageIndex(0);
  };

  // Cek apakah ada filter yang lagi aktif
  const isFiltered =
    globalFilter ||
    Object.values(dynamicFilters).some(Boolean) ||
    startMonth ||
    endMonth;

  // Render komponen tabel
  return (
    // Div pembungkus utama
    <div className={cn("space-y-4 w-full", className)}>
      {/* Box kontrol filter */}
      <div className="bg-card p-4 rounded-2xl border border-border flex flex-col gap-4 lg:flex-row lg:items-center justify-between shadow-sm">
        {/* Kontainer area kontrol kiri */}
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Box pencarian */}
          <div className="relative w-full sm:w-[260px]">
            {/* Ikon search */}
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              size={16}
            />
            {/* Input pencarian */}
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={globalFilter ?? ""}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-9 pr-4 py-2 bg-muted/40 border border-border text-foreground rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary w-full transition-all"
            />
          </div>

          {/* Mapping filter dropdown */}
          {selectFilters.map((filter) => (
            <div key={filter.key} className="w-full sm:w-[160px]">
              {/* Select filter dropdown */}
              <select
                value={dynamicFilters[filter.key] || ""}
                onChange={(e) => {
                  setDynamicFilters((prev) => ({
                    ...prev,
                    [filter.key]: e.target.value,
                  }));
                  // Reset halaman pertama tiap ada perubahan filter
                  table.setPageIndex(0);
                }}
                className="w-full bg-muted/40 border border-border text-foreground rounded-xl px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary cursor-pointer"
              >
                {/* Opsi default filter */}
                <option value="" className="bg-card text-foreground">
                  {filter.label}
                </option>
                {/* Mapping pilihan opsi filter */}
                {filter.options.map((opt) => (
                  <option
                    key={opt.value}
                    value={opt.value}
                    className="bg-background text-foreground"
                  >
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          ))}

          {/* Kondisi render filter tanggal */}
          {enableDateRange && (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              {/* Input bulan mulai */}
              <input
                type="month"
                value={startMonth}
                onChange={(e) => {
                  setStartMonth(e.target.value);
                  table.setPageIndex(0);
                }}
                className="bg-muted/40 border border-border text-foreground rounded-xl px-3 py-2 text-xs outline-none cursor-pointer"
              />
              <span className="text-muted-foreground text-xs">s/d</span>
              {/* Input bulan akhir */}
              <input
                type="month"
                value={endMonth}
                onChange={(e) => {
                  setEndMonth(e.target.value);
                  table.setPageIndex(0);
                }}
                className="bg-muted/40 border border-border text-foreground rounded-xl px-3 py-2 text-xs outline-none cursor-pointer"
              />
            </div>
          )}

          {/* Tombol reset kalo ada filter aktif */}
          {isFiltered && (
            <button
              onClick={handleClearFilters}
              className="flex items-center gap-1.5 text-xs bg-destructive/10 text-destructive px-3 py-2 rounded-xl font-bold hover:bg-destructive/20 transition-colors cursor-pointer"
            >
              <FilterX size={14} /> Reset
            </button>
          )}
        </div>

        {/* Kontainer baris per halaman */}
        <div className="flex items-center gap-2 self-end lg:self-auto">
          <span className="text-xs text-muted-foreground font-medium">
            Baris per halaman:
          </span>
          {/* Select buat nentuin jumlah baris */}
          <select
            value={table.getState().pagination.pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
            className="bg-muted/40 border border-border text-foreground rounded-xl px-2 py-1.5 text-xs outline-none cursor-pointer"
          >
            {/* Opsi jumlah baris */}
            {[5, 10, 25, 50].map((size) => (
              <option
                key={size}
                value={size}
                className="bg-background text-foreground"
              >
                {size}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Kontainer utama tabel */}
      <div className="bg-card shadow-sm rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          {/* Elemen tabel html */}
          <table className="w-full text-left text-sm whitespace-nowrap">
            {/* Header tabel */}
            <thead className="bg-muted/50 border-b border-border text-muted-foreground">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    // Header sel
                    <th
                      key={header.id}
                      onClick={header.column.getToggleSortingHandler()}
                      className={cn(
                        "px-6 py-4 font-bold uppercase tracking-wider text-[11px]",
                        header.column.getCanSort()
                          ? "cursor-pointer hover:bg-muted transition-colors select-none"
                          : "",
                        (header.column.columnDef.meta as Record<string, string>)
                          ?.className,
                      )}
                    >
                      {/* Div buat layout header */}
                      <div className="flex items-center gap-1">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                        {/* Cek fitur sort aktif */}
                        {header.column.getCanSort() && (
                          <ArrowUpDown
                            size={12}
                            className={`transition-colors ${
                              header.column.getIsSorted()
                                ? "text-primary"
                                : "text-muted-foreground/70"
                            }`}
                          />
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            {/* Body tabel */}
            <tbody className="divide-y divide-border">
              {/* Kondisi kalo data kosong */}
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="text-center py-12 font-medium text-muted-foreground"
                  >
                    Data tidak ditemukan berdasarkan kriteria filter
                  </td>
                </tr>
              ) : (
                // Mapping baris tabel
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    {/* Mapping cell tabel */}
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className={cn(
                          "px-6 py-4",
                          (cell.column.columnDef.meta as Record<string, string>)
                            ?.className,
                        )}
                      >
                        {/* Render konten cell */}
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer tabel buat navigasi */}
        <div className="px-6 py-4 border-t border-border bg-muted/10 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
          {/* Info jumlah data */}
          <div className="text-xs text-muted-foreground font-medium">
            Menampilkan{" "}
            <span className="text-foreground font-bold">
              {table.getFilteredRowModel().rows.length === 0
                ? 0
                : table.getState().pagination.pageIndex *
                    table.getState().pagination.pageSize +
                  1}
            </span>{" "}
            sampai{" "}
            <span className="text-foreground font-bold">
              {Math.min(
                (table.getState().pagination.pageIndex + 1) *
                  table.getState().pagination.pageSize,
                table.getFilteredRowModel().rows.length,
              )}
            </span>{" "}
            dari{" "}
            <span className="text-foreground font-bold">
              {table.getFilteredRowModel().rows.length}
            </span>{" "}
            entri
          </div>

          {/* Kontainer navigasi halaman */}
          <div className="flex items-center gap-1">
            {/* Tombol ke halaman paling awal */}
            <button
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              className="p-2 border border-border rounded-lg bg-card text-muted-foreground disabled:opacity-40 hover:bg-muted transition-colors cursor-pointer"
            >
              <ChevronsLeft size={16} />
            </button>
            {/* Tombol ke halaman sebelumnya */}
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="p-2 border border-border rounded-lg bg-card text-muted-foreground disabled:opacity-40 hover:bg-muted transition-colors cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>

            {/* Info nomor halaman */}
            <div className="px-4 text-xs font-bold text-foreground">
              Halaman {table.getState().pagination.pageIndex + 1} dari{" "}
              {table.getPageCount() || 1}
            </div>

            {/* Tombol ke halaman berikutnya */}
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="p-2 border border-border rounded-lg bg-card text-muted-foreground disabled:opacity-40 hover:bg-muted transition-colors cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
            {/* Tombol ke halaman terakhir */}
            <button
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
              className="p-2 border border-border rounded-lg bg-card text-muted-foreground disabled:opacity-40 hover:bg-muted transition-colors cursor-pointer"
            >
              <ChevronsRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
