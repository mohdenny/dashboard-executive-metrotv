"use client";

import React, { useState, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  ArrowUpDown,
  FilterX,
} from "lucide-react";
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

export interface ColumnConfig<T> {
  header: string;
  // Buat nentuin dasar sorting dari key datanya, pastiin key ini selaras sama Zod schema lu ya
  accessorKey?: keyof T;
  render: (item: T) => React.ReactNode;
  className?: string;
}

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterSelectConfig {
  key: string;
  label: string;
  options: FilterOption[];
}

interface SmartTableProps<T> {
  data: T[];
  columns: ColumnConfig<T>[];
  selectFilters?: FilterSelectConfig[];
  enableDateRange?: boolean;
  // Nama kolom buat target filter bulannya (cth: "periodeBulan")
  dateKey?: keyof T;
  searchPlaceholder?: string;
}

// Custom global filter biar nyarinya tembus ke semua daleman value objek
const globalFilterFn = <T,>(
  row: Row<T>,
  columnId: string,
  filterValue: unknown,
) => {
  const query = String(filterValue).toLowerCase();
  return Object.values(row.original as Record<string, unknown>).some((val) =>
    String(val).toLowerCase().includes(query),
  );
};

export default function SmartTable<T>({
  data,
  columns,
  selectFilters = [],
  enableDateRange = false,
  dateKey,
  searchPlaceholder = "Cari data...",
}: SmartTableProps<T>) {
  // Wadah state bawaannya Tanstack buat ngurus sorting sama ngetik search global
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  // Wadah filter dinamis yang dihandle manual sebelum datanya masuk ke Tanstack biar lebih luwes
  const [dynamicFilters, setDynamicFilters] = useState<Record<string, string>>(
    {},
  );
  const [startMonth, setStartMonth] = useState("");
  const [endMonth, setEndMonth] = useState("");

  // Potong atau filter datanya duluan sebelum diserahin ke Tanstack buat urusan dropdown sama rentang tanggal
  const preFilteredData = useMemo(() => {
    let result = [...data];

    // Cek kalo fitur tanggalnya aktif dan key-nya valid, saring datanya berdasarkan rentang bulan
    if (enableDateRange && dateKey) {
      if (startMonth) {
        result = result.filter((item) => String(item[dateKey]) >= startMonth);
      }
      if (endMonth) {
        result = result.filter((item) => String(item[dateKey]) <= endMonth);
      }
    }

    // Loop buat nyaring data pake dropdown filter yang dipasang dinamis
    Object.keys(dynamicFilters).forEach((key) => {
      const filterValue = dynamicFilters[key];
      if (filterValue) {
        result = result.filter((item) => {
          const itemValue = (item as Record<string, unknown>)[key];
          return String(itemValue) === filterValue;
        });
      }
    });

    return result;
  }, [data, dynamicFilters, startMonth, endMonth, enableDateRange, dateKey]);

  // Mapping format kolom dari props lu biar cocok sama standarnya objek Tanstack
  const tanstackColumns = useMemo(() => {
    return columns.map((col) => ({
      id: col.accessorKey ? String(col.accessorKey) : col.header,
      accessorKey: col.accessorKey,
      header: col.header,
      cell: (info: CellContext<T, unknown>) => col.render(info.row.original),
      // Nyalain fitur sorting cuma kalo kolomnya punya accessorKey yang jelas
      enableSorting: !!col.accessorKey,
      meta: {
        // Titip class custom di meta propertinya Tanstack biar gampang pas styling Tailwind-nya
        className: col.className,
      },
    }));
  }, [columns]);

  // Nyalain mesin Tanstack Table-nya pake semua amunisi di atas
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

  // Fungsi sapu jagat buat ngebersihin semua filter balik ke kondisi awal/kosong
  const handleClearFilters = () => {
    setGlobalFilter("");
    setDynamicFilters({});
    setStartMonth("");
    setEndMonth("");
    // Balikin paksa ke halaman pertama biar ga nyasar kalo sisa datanya dikit
    table.setPageIndex(0);
  };

  // Ngecek apakah ada filter yang lagi jalan buat nentuin tombol reset nongol apa engga
  const isFiltered =
    globalFilter ||
    Object.values(dynamicFilters).some(Boolean) ||
    startMonth ||
    endMonth;

  return (
    <div className="space-y-4 w-full">
      <div className="bg-card p-4 rounded-2xl border border-border flex flex-col gap-4 lg:flex-row lg:items-center justify-between shadow-sm">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative w-full sm:w-[260px]">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              size={16}
            />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={globalFilter ?? ""}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-9 pr-4 py-2 bg-muted/40 border border-border text-foreground rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary w-full transition-all"
            />
          </div>

          {selectFilters.map((filter) => (
            <div key={filter.key} className="w-full sm:w-[160px]">
              <select
                value={dynamicFilters[filter.key] || ""}
                onChange={(e) => {
                  setDynamicFilters((prev) => ({
                    ...prev,
                    [filter.key]: e.target.value,
                  }));
                  // Paksa balik ke halaman satu tiap kali user ganti filter dropdown
                  table.setPageIndex(0);
                }}
                className="w-full bg-muted/40 border border-border text-foreground rounded-xl px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary cursor-pointer"
              >
                <option value="" className="bg-card text-foreground">
                  {filter.label}
                </option>
                {filter.options.map((opt) => (
                  <option
                    key={opt.value}
                    value={opt.value}
                    className="bg-card text-foreground"
                  >
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          ))}

          {enableDateRange && (
            <div className="flex items-center gap-2 w-full sm:w-auto">
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

          {isFiltered && (
            <button
              onClick={handleClearFilters}
              className="flex items-center gap-1.5 text-xs bg-destructive/10 text-destructive px-3 py-2 rounded-xl font-bold hover:bg-destructive/20 transition-colors cursor-pointer"
            >
              <FilterX size={14} /> Reset
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 self-end lg:self-auto">
          <span className="text-xs text-muted-foreground font-medium">
            Baris per halaman:
          </span>
          <select
            value={table.getState().pagination.pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
            className="bg-muted/40 border border-border text-foreground rounded-xl px-2 py-1.5 text-xs outline-none cursor-pointer"
          >
            {[5, 10, 25, 50].map((size) => (
              <option
                key={size}
                value={size}
                className="bg-card text-foreground"
              >
                {size}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-card shadow-sm rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-muted/50 border-b border-border text-muted-foreground">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      onClick={header.column.getToggleSortingHandler()}
                      className={`px-6 py-4 font-bold uppercase tracking-wider text-[11px] ${
                        header.column.getCanSort()
                          ? "cursor-pointer hover:bg-muted transition-colors select-none"
                          : ""
                      } ${(header.column.columnDef.meta as Record<string, string>)?.className || ""}`}
                    >
                      <div className="flex items-center gap-1">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
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
            <tbody className="divide-y divide-border">
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="text-center py-12 font-medium text-muted-foreground"
                  >
                    Data tidak ditemukan berdasarkan kriteria filter.
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className={`px-6 py-4 ${(cell.column.columnDef.meta as Record<string, string>)?.className || ""}`}
                      >
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

        <div className="px-6 py-4 border-t border-border bg-muted/10 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
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

          <div className="flex items-center gap-1">
            <button
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              className="p-2 border border-border rounded-lg bg-card text-muted-foreground disabled:opacity-40 hover:bg-muted transition-colors cursor-pointer"
            >
              <ChevronsLeft size={16} />
            </button>
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="p-2 border border-border rounded-lg bg-card text-muted-foreground disabled:opacity-40 hover:bg-muted transition-colors cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>

            <div className="px-4 text-xs font-bold text-foreground">
              Halaman {table.getState().pagination.pageIndex + 1} dari{" "}
              {table.getPageCount() || 1}
            </div>

            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="p-2 border border-border rounded-lg bg-card text-muted-foreground disabled:opacity-40 hover:bg-muted transition-colors cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
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
