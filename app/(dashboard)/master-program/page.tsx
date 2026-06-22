"use client";

import React, { useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { useTheme } from "next-themes";
import {
  Plus,
  X,
  Database,
  AlertCircle,
  RefreshCcw,
  TableProperties,
  CheckCircle2,
} from "lucide-react";

// Setup AG Grid
import { AgGridReact } from "ag-grid-react";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
ModuleRegistry.registerModules([AllCommunityModule]);

import SmartTable from "@/components/shared/SmartTable";
import { useMasterProgram } from "@/hooks/useMasterProgram";

const emptySubscribe = () => () => {};

export default function MasterProgramPage() {
  const { theme } = useTheme();
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  // Panggil semua state dan fungsi dari custom hook
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
    mutations,
    actions,
  } = useMasterProgram();

  return (
    <div className="p-4 md:px-8 space-y-6 max-w-[1800px] mx-auto animate-in fade-in duration-300">
      {/* Title page */}
      {/* <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/50 pb-6 border-2 border-slate-300">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-secondary text-secondary-foreground rounded-2xl">
            <Database size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-normal tracking-tight text-foreground">
              Master Data Program
            </h1>
            <p className="text-sm text-muted-foreground font-medium">
              Pusat Kendali Master Data Program.
            </p>
          </div>
        </div>
      </div> */}

      {/* Tampilan muter-muter kalo data dari API lagi difetch */}
      {isLoading ? (
        <div className="p-12 text-center">
          <RefreshCcw className="animate-spin mx-auto text-primary" size={32} />
        </div>
      ) : (
        <>
          <button
            onClick={actions.openAddModal}
            className="fixed bottom-8 right-8 z-[40] flex items-center gap-3 bg-primary text-primary-foreground px-4 py-2 rounded-full font-bold hover:opacity-90 transition-all hover:-translate-y-1 hover:shadow-xl cursor-pointer shadow-lg"
          >
            <TableProperties size={20} /> Input
          </button>
          <div className="bg-card shadow-sm rounded-2xl border border-border p-4">
            <SmartTable
              data={programs}
              columns={tableColumns}
              selectFilters={selectFilters}
              enableDateRange={true}
              dateKey="periodeBulan"
              searchPlaceholder="Cari program, kategori..."
            />
          </div>
        </>
      )}

      {/* Modal buat nampilin AG Grid */}
      {isModalOpen &&
        mounted &&
        createPortal(
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9999] flex items-center justify-center p-2 sm:p-4">
            <div className="bg-card w-full max-w-[98vw] h-[95vh] rounded-[28px] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-border">
              <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 bg-muted/30 shrink-0">
                <div>
                  <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <TableProperties size={20} className="text-primary" />
                    {editingId ? "Edit Data Program" : "Input Program"}
                  </h2>
                  {/* <p className="text-xs text-muted-foreground mt-0.5">
                    Dukung Copy-Paste langsung dari file Excel/Sheet.
                  </p> */}
                </div>
                <button
                  onClick={actions.closeModal}
                  className="p-2 hover:bg-destructive/10 hover:text-destructive rounded-full cursor-pointer transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Wadah utama buat ngerender AG Grid-nya, pastiin settingan colDefs udah sinkron sama schema Zod */}
              <div className="flex-1 p-4 bg-muted/10 flex flex-col">
                <div
                  className={`flex-1 w-full rounded-xl overflow-hidden border border-border ${theme === "dark" ? "ag-theme-alpine-dark" : "ag-theme-alpine"}`}
                >
                  <AgGridReact
                    ref={gridRef}
                    rowData={rowData}
                    columnDefs={colDefs}
                    theme="legacy"
                    defaultColDef={{
                      resizable: true,
                      sortable: true,
                      flex: 1,
                      minWidth: 120,
                      cellStyle: { borderRight: "1px solid var(--border)" },
                      wrapHeaderText: true,
                      autoHeaderHeight: true,
                    }}
                    stopEditingWhenCellsLoseFocus={true}
                    animateRows={true}
                  />
                </div>

                {/* Cuma tampilin tombol tambah baris kalo lagi mode bulk insert, bukan mode edit */}
                {!editingId && (
                  <button
                    onClick={actions.addRow}
                    className="mt-4 flex items-center gap-2 text-sm font-bold text-primary hover:text-primary/80 hover:bg-primary/10 px-4 py-2 rounded-xl transition-colors cursor-pointer border border-dashed border-primary/40 w-fit"
                  >
                    <Plus size={16} /> Tambah Baris Baru
                  </button>
                )}
              </div>

              <div className="px-6 py-4 border-t border-border/50 bg-muted/30 flex justify-end items-center shrink-0">
                {/* <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-green-500" /> AG Grid
                  Engine Active. Baris kosong akan diabaikan.
                </span> */}
                <div className="flex gap-3">
                  <button
                    onClick={actions.closeModal}
                    className="px-6 py-2.5 rounded-full font-bold cursor-pointer hover:bg-border/50 transition-colors text-sm"
                  >
                    Batal
                  </button>
                  {/* Tombol submit bakal manggil mutasi buat nembak APIm AG Gridnya harus tervalidasi Zod sebelum disave */}
                  <button
                    onClick={actions.submitBulkData}
                    disabled={
                      mutations.createMut.isPending ||
                      mutations.updateMut.isPending
                    }
                    className="px-8 py-2.5 bg-primary text-primary-foreground font-bold rounded-full cursor-pointer hover:opacity-90 transition-opacity flex items-center gap-2 shadow-sm text-sm"
                  >
                    {(mutations.createMut.isPending ||
                      mutations.updateMut.isPending) && (
                      <RefreshCcw size={16} className="animate-spin" />
                    )}
                    {editingId ? "Simpan Perubahan" : `Simpan Data`}
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {/* Modal konfirmasi pas user kepencet tombol hapus data */}
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
                  onClick={() => actions.setDeleteConfirmId(null)}
                  className="flex-1 py-3 font-bold bg-muted hover:bg-muted/80 rounded-full transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  onClick={() => mutations.deleteMut.mutate(deleteConfirmId)}
                  className="flex-1 py-3 font-bold bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-full transition-colors cursor-pointer flex justify-center items-center gap-2"
                >
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
