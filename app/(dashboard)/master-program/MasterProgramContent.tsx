"use client";

import React, { useState, useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import {
  RefreshCcw,
  TableProperties,
  Download,
  LayoutList,
  Plus,
  X,
  AlertCircle,
} from "lucide-react";
import { createPortal } from "react-dom";
import { AgGridReact } from "ag-grid-react";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
ModuleRegistry.registerModules([AllCommunityModule]);

import SmartTable from "@/components/shared/SmartTable";
import { useMasterProgram } from "@/hooks/useMasterProgram";
import { ProgramFormData } from "@/schemas/program";
import { ColumnConfig } from "@/components/shared/SmartTable";
// Import page header
import PageHeader from "@/components/shared/PageHeader";
import ProgramDetailModal from "@/components/shared/ProgramDetailModal";
// Import hook sakti khusus urusan kang excel
import { useExportExcel, ExportProgramData } from "@/hooks/useExportExcel";

const emptySubscribe = () => () => {};

export default function MasterProgramContent() {
  const { theme } = useTheme();
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  const [detailProgramData, setDetailProgramData] =
    useState<ProgramFormData | null>(null);

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

  // Tarik fungsi nge-excel dari hook costum biar rapih
  const { exportToExcel } = useExportExcel();

  const handleOpenDetail = (program: ProgramFormData) => {
    setDetailProgramData(program);
  };

  const enhancedTableColumns = (
    tableColumns as ColumnConfig<ProgramFormData>[]
  ).map((col) => {
    if (col.accessorKey === "name") {
      return {
        ...col,
        render: (item: ProgramFormData) => (
          <button
            onClick={() => handleOpenDetail(item)}
            className="text-primary hover:text-primary/80 hover:underline font-bold text-left truncate max-w-full cursor-pointer transition-colors focus:outline-none"
          >
            {item.name}
          </button>
        ),
      };
    }
    return col;
  });

  // Fungsi pemicu narik mutasi excel data master
  const handleExportExcel = () => {
    // Panggil fungsi saktinya langsung dimari
    exportToExcel(
      programs as unknown as ExportProgramData[],
      `Report_Master_Program_${selectedPeriod || "All"}`,
      selectedPeriod,
    );
  };

  return (
    <div className="p-4 md:px-8 md:py-6 space-y-6 max-w-[1800px] mx-auto animate-in fade-in duration-300">
      {/* Sisipin PageHeader rapih di master data */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 border-b border-border/50 pb-6">
        <PageHeader
          icon={LayoutList}
          title="Master Data Program"
          description="Kelola, ubah, dan export data master program TV"
          rightContent={
            <button
              onClick={handleExportExcel}
              disabled={isLoading || programs.length === 0}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-full text-sm font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm w-full sm:w-auto justify-center"
            >
              <Download size={16} /> Export Excel
            </button>
          }
        />
      </div>

      {isLoading ? (
        <div className="p-12 text-center">
          <RefreshCcw className="animate-spin mx-auto text-primary" size={32} />
        </div>
      ) : (
        <>
          <button
            onClick={actions.openAddModal}
            className="fixed bottom-8 right-8 z-[40] flex items-center gap-3 bg-primary text-primary-foreground px-6 py-2.5 rounded-full font-bold hover:opacity-90 transition-all hover:-translate-y-1 hover:shadow-xl cursor-pointer shadow-lg"
          >
            <TableProperties size={20} /> Input
          </button>

          <div className="border border-border bg-card shadow-sm rounded-2xl p-4">
            {/* Komponen smarttable */}
            <SmartTable
              data={programs}
              columns={enhancedTableColumns}
              selectFilters={selectFilters}
              // Tembak array opsi periode biar sejajar
              periodOptions={periodOptions}
              // Tembak state periode aktif
              selectedPeriod={selectedPeriod}
              // Tembak fungsi ubah periode
              onPeriodChange={setSelectedPeriod}
              enableDateRange={false}
              hidePagination={false}
              dateKey={(item: ProgramFormData) => {
                const pItem = item as unknown as ExportProgramData;
                if (selectedPeriod) {
                  const found = pItem.periods?.find(
                    (p) => p.month === selectedPeriod,
                  );
                  if (found) return found.month;
                }
                const sorted = [...(pItem.periods || [])].sort((a, b) =>
                  b.month.localeCompare(a.month),
                );
                return sorted[0]?.month ?? "";
              }}
              searchPlaceholder="Cari program, kategori..."
            />
          </div>
        </>
      )}

      <ProgramDetailModal
        isOpen={!!detailProgramData}
        onClose={() => setDetailProgramData(null)}
        program={detailProgramData}
        initialPeriod={selectedPeriod}
      />

      {isModalOpen &&
        mounted &&
        createPortal(
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9999] flex items-center justify-center p-2 sm:p-4">
            <div className="bg-card w-full max-w-[98vw] h-[95vh] rounded-[28px] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 bg-muted/30 shrink-0">
                <div>
                  <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <TableProperties size={20} className="text-primary" />
                    {editingId ? `Edit Data Program` : "Input Program"}
                  </h2>
                  <span className="text-xs font-medium text-muted-foreground mt-1 block">
                    Mode Entri untuk Periode: {selectedPeriod || "Terbaru"}
                  </span>
                </div>
                <button
                  onClick={actions.closeModal}
                  className="p-2 hover:bg-destructive/10 hover:text-destructive rounded-full cursor-pointer transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 p-4 bg-muted/10 flex flex-col">
                <div
                  className={`flex-1 w-full rounded-xl overflow-hidden border border-border ${
                    theme === "dark"
                      ? "ag-theme-alpine-dark"
                      : "ag-theme-alpine"
                  }`}
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
                <div className="flex gap-3">
                  <button
                    onClick={actions.closeModal}
                    className="px-6 py-2.5 rounded-full font-bold cursor-pointer hover:bg-border/50 transition-colors text-sm"
                  >
                    Batal
                  </button>
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
