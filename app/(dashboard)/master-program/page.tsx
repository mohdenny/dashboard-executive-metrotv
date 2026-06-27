// Aktivasi mode client buat jalanin hook react
"use client";

// Import react dan hooks buat state
import React, { useState, useSyncExternalStore } from "react";
// Import createPortal buat ngerender modal di atas body
import { createPortal } from "react-dom";
// Import hook tema dari next-themes
import { useTheme } from "next-themes";
// Import kumpulan ikon dari lucide
import {
  Plus,
  X,
  AlertCircle,
  RefreshCcw,
  TableProperties,
} from "lucide-react";
// Import komponen grid dari ag-grid
import { AgGridReact } from "ag-grid-react";
// Import modul registry dan komunitas ag grid
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";
// Import style dasar ag grid
import "ag-grid-community/styles/ag-grid.css";
// Import style tema alpine ag grid
import "ag-grid-community/styles/ag-theme-alpine.css";
// Daftarin modul komunitas ke registry ag grid
ModuleRegistry.registerModules([AllCommunityModule]);

// Import komponen tabel pintar
import SmartTable from "@/components/shared/SmartTable";
// Import hook master program buat logic data
import { useMasterProgram } from "@/hooks/useMasterProgram";
// Import modal detail program
import ProgramDetailModal from "@/components/shared/ProgramDetailModal";
// Import tipe data program
import { ProgramFormData } from "@/schemas/program";
// Import interface konfigurasi kolom
import { ColumnConfig } from "@/components/shared/SmartTable";

// Fungsi buat sinkronisasi store biar aman pas render
const emptySubscribe = () => () => {};

// Komponen halaman utama master program
export default function MasterProgramPage() {
  // Ambil tema aplikasi dari next themes
  const { theme } = useTheme();
  // Hook buat mastiin komponen render di client
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  // State buat nyimpen detail program yang diklik dari tabel
  const [detailProgramData, setDetailProgramData] =
    useState<ProgramFormData | null>(null);

  // Ambil semua state dan aksi dari hook master program
  const {
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
    mutations,
    actions,
  } = useMasterProgram();

  // Fungsi buat update state detail program
  const handleOpenDetail = (program: ProgramFormData) => {
    setDetailProgramData(program);
  };

  // Bikin kolom tabel baru yang bisa diklik buat buka detail
  const enhancedTableColumns = (
    tableColumns as ColumnConfig<ProgramFormData>[]
  ).map((col) => {
    // Cek kolom yang kuncinya nama
    if (col.accessorKey === "name") {
      // Balikin definisi kolom baru
      return {
        ...col,
        // Override render pake tombol biar clickable
        render: (item: ProgramFormData) => (
          <button
            // Klik buat buka detail modal
            onClick={() => handleOpenDetail(item)}
            // Style tombol buat nama program
            className="text-primary hover:text-primary/80 hover:underline font-bold text-left truncate max-w-full cursor-pointer transition-colors focus:outline-none"
          >
            {item.name}
          </button>
        ),
      };
    }
    // Balikin kolom asli kalo bukan kolom nama
    return col;
  });

  // Render halaman master program
  return (
    // Container utama
    <div className="p-4 md:px-8 md:py-6 space-y-6 max-w-[1800px] mx-auto animate-in fade-in duration-300">
      {/* Tampilan loading muter-muter kalo data masih diambil dari api */}
      {isLoading ? (
        <div className="p-12 text-center">
          <RefreshCcw className="animate-spin mx-auto text-primary" size={32} />
        </div>
      ) : (
        // Fragment buat nampilin konten utama setelah loading
        <>
          {/* Tombol buat tambah data baru */}
          <button
            // Panggil aksi buka modal tambah
            onClick={actions.openAddModal}
            // Style tombol floating
            className="fixed bottom-8 right-8 z-[40] flex items-center gap-3 bg-primary text-primary-foreground px-6 py-2.5 rounded-full font-bold hover:opacity-90 transition-all hover:-translate-y-1 hover:shadow-xl cursor-pointer shadow-lg"
          >
            <TableProperties size={20} /> Input
          </button>

          {/* Container tabel */}
          <div className="bg-card shadow-sm rounded-2xl p-4">
            {/* Filter periode */}
            <div className="flex items-center gap-4 mb-4 px-2">
              <label className="text-sm font-bold text-foreground flex items-center gap-2">
                Filter Tabel Periode:
              </label>
              <select
                // Nilai periode terpilih
                value={selectedPeriod}
                // Update periode saat berubah
                onChange={(e) => setSelectedPeriod(e.target.value)}
                // Style dropdown
                className="bg-muted border border-border rounded-xl px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer w-48 shadow-sm"
              >
                {/* Opsi default */}
                <option value="">Terbaru</option>
                {/* Loop opsi periode */}
                {periodOptions.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              {/* Info periode yang tampil */}
              <span className="text-xs text-muted-foreground font-medium bg-muted/50 px-3 py-1.5 rounded-full border border-border">
                Data Ditampilkan:{" "}
                <span className="font-bold text-foreground">
                  {selectedPeriod || periodOptions[0] || "-"}
                </span>
              </span>
            </div>

            {/* Komponen tabel pintar */}
            <SmartTable
              // Data program
              data={programs}
              // Kolom yang udah dimodif
              columns={enhancedTableColumns}
              // Filter kategori
              selectFilters={selectFilters}
              // Aktifin filter tanggal
              enableDateRange={true}
              // Fungsi key tanggal
              dateKey={(item) => {
                // Cek periode kalo ada
                if (selectedPeriod) {
                  const found = item.periods?.find(
                    (p) => p.month === selectedPeriod,
                  );
                  // Balikin bulan kalo ketemu
                  if (found) return found.month;
                }
                // Urutin periode
                const sorted = [...(item.periods || [])].sort((a, b) =>
                  b.month.localeCompare(a.month),
                );
                // Balikin bulan terbaru
                return sorted[0]?.month ?? "";
              }}
              // Placeholder search
              searchPlaceholder="Cari program, kategori..."
            />
          </div>
        </>
      )}

      {/* Modal Detail Reusable buat nampilin info program */}
      <ProgramDetailModal
        // Cek program ada ga buat modal
        isOpen={!!detailProgramData}
        // Aksi tutup modal
        onClose={() => setDetailProgramData(null)}
        // Data program
        program={detailProgramData}
      />

      {/* Modal Spreadsheet Ag Grid buat input data masal */}
      {isModalOpen &&
        mounted &&
        createPortal(
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9999] flex items-center justify-center p-2 sm:p-4">
            <div className="bg-card w-full max-w-[98vw] h-[95vh] rounded-[28px] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 bg-muted/30 shrink-0">
                <div>
                  <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <TableProperties size={20} className="text-primary" />
                    {/* Judul modal edit atau tambah */}
                    {editingId ? `Edit Data Program` : "Input Program"}
                  </h2>
                  <span className="text-xs font-medium text-muted-foreground mt-1 block">
                    Mode Entri untuk Periode: {selectedPeriod || "Terbaru"}
                  </span>
                </div>
                {/* Tombol tutup modal */}
                <button
                  onClick={actions.closeModal}
                  className="p-2 hover:bg-destructive/10 hover:text-destructive rounded-full cursor-pointer transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Wadah grid */}
              <div className="flex-1 p-4 bg-muted/10 flex flex-col">
                <div
                  // Styling buat tema dark atau light
                  className={`flex-1 w-full rounded-xl overflow-hidden border border-border ${
                    theme === "dark"
                      ? "ag-theme-alpine-dark"
                      : "ag-theme-alpine"
                  }`}
                >
                  {/* Komponen Grid */}
                  <AgGridReact
                    // Ref grid
                    ref={gridRef}
                    // Data row
                    rowData={rowData}
                    // Definisi kolom
                    columnDefs={colDefs}
                    // Tema
                    theme="legacy"
                    // Default opsi kolom
                    defaultColDef={{
                      resizable: true,
                      sortable: true,
                      flex: 1,
                      minWidth: 120,
                      cellStyle: { borderRight: "1px solid var(--border)" },
                      wrapHeaderText: true,
                      autoHeaderHeight: true,
                    }}
                    // Stop edit pas fokus ilang
                    stopEditingWhenCellsLoseFocus={true}
                    // Animasi baris
                    animateRows={true}
                  />
                </div>

                {/* Tombol tambah baris */}
                {!editingId && (
                  <button
                    // Aksi tambah baris
                    onClick={actions.addRow}
                    // Styling tombol
                    className="mt-4 flex items-center gap-2 text-sm font-bold text-primary hover:text-primary/80 hover:bg-primary/10 px-4 py-2 rounded-xl transition-colors cursor-pointer border border-dashed border-primary/40 w-fit"
                  >
                    <Plus size={16} /> Tambah Baris Baru
                  </button>
                )}
              </div>

              {/* Footer modal */}
              <div className="px-6 py-4 border-t border-border/50 bg-muted/30 flex justify-end items-center shrink-0">
                <div className="flex gap-3">
                  {/* Tombol batal */}
                  <button
                    onClick={actions.closeModal}
                    className="px-6 py-2.5 rounded-full font-bold cursor-pointer hover:bg-border/50 transition-colors text-sm"
                  >
                    Batal
                  </button>
                  {/* Tombol save */}
                  <button
                    // Submit bulk data
                    onClick={actions.submitBulkData}
                    // Disable pas lagi proses
                    disabled={
                      mutations.createMut.isPending ||
                      mutations.updateMut.isPending
                    }
                    // Styling tombol submit
                    className="px-8 py-2.5 bg-primary text-primary-foreground font-bold rounded-full cursor-pointer hover:opacity-90 transition-opacity flex items-center gap-2 shadow-sm text-sm"
                  >
                    {/* Tampil spin loading pas mutasi */}
                    {(mutations.createMut.isPending ||
                      mutations.updateMut.isPending) && (
                      <RefreshCcw size={16} className="animate-spin" />
                    )}
                    {/* Teks dinamis edit atau tambah */}
                    {editingId ? "Simpan Perubahan" : `Simpan Data`}
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {/* Modal konfirmasi hapus */}
      {deleteConfirmId &&
        mounted &&
        createPortal(
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
            <div className="bg-card w-full max-w-sm rounded-[28px] p-6 text-center shadow-2xl">
              <AlertCircle
                size={32}
                className="mx-auto text-destructive mb-4"
              />
              <h3 className="text-lg font-bold mb-2">Hapus Program?</h3>
              <p className="text-sm text-muted-foreground">
                Data yang dihapus tidak dapat dikembalikan.
              </p>
              <div className="flex gap-3 w-full mt-6">
                <button
                  // Batal hapus
                  onClick={() => actions.setDeleteConfirmId(null)}
                  // Styling tombol batal
                  className="flex-1 py-3 font-bold bg-muted hover:bg-muted/80 rounded-full transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  // Konfirmasi hapus
                  onClick={() => mutations.deleteMut.mutate(deleteConfirmId)}
                  // Styling tombol hapus
                  className="flex-1 py-3 font-bold bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-full transition-colors cursor-pointer flex justify-center items-center gap-2"
                >
                  {/* Tampil spin loading */}
                  {mutations.deleteMut.isPending && (
                    <RefreshCcw size={16} className="animate-spin" />
                  )}{" "}
                  Ya, Hapus
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
