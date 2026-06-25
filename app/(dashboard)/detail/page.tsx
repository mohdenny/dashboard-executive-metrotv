"use client";

import React from "react";
import SmartTable from "@/components/shared/SmartTable";
import ProgramDetailModal from "@/components/shared/ProgramDetailModal";
import { useDetailProgram } from "@/hooks/useDetailProgram";

export default function DetailProgramPage() {
  // Tarik data dan kolom tabel dari hook
  // Kita udah nggak butuh narik tvChartData & financeChartData di sini
  const {
    programs,
    isLoading,
    selectedProgram,
    setSelectedProgram,
    selectFilters,
    columns,
    selectedPeriod,
    setSelectedPeriod,
    periodOptions,
  } = useDetailProgram();

  return (
    <div className="p-4 md:px-8 md:py-6 space-y-6 max-w-[1800px] mx-auto animate-in fade-in duration-300">
      {isLoading ? (
        <div className="p-12 text-center text-muted-foreground font-medium">
          Memuat data program...
        </div>
      ) : (
        <div className="bg-card shadow-sm rounded-2xl p-4">
          <div className="flex items-center gap-4 mb-4 px-2">
            <label className="text-sm font-bold text-foreground flex items-center gap-2">
              Filter Tabel Periode:
            </label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="bg-muted border border-border rounded-xl px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer w-48 shadow-sm"
            >
              <option value="">Terbaru</option>
              {periodOptions.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            <span className="text-xs text-muted-foreground font-medium bg-muted/50 px-3 py-1.5 rounded-full border border-border">
              Data ditunjukkan untuk:{" "}
              <span className="font-bold text-foreground">
                {selectedPeriod || "Periode Terakhir"}
              </span>
            </span>
          </div>

          <SmartTable
            data={programs}
            columns={columns}
            selectFilters={selectFilters}
            enableDateRange={true}
            dateKey={(item) => {
              if (selectedPeriod) {
                const found = item.periods?.find(
                  (p) => p.month === selectedPeriod,
                );
                if (found) return found.month;
              }
              const sorted = [...(item.periods || [])].sort((a, b) =>
                b.month.localeCompare(a.month),
              );
              return sorted[0]?.month ?? "";
            }}
            searchPlaceholder="Cari nama program..."
          />
        </div>
      )}

      {/* Panggil komponen modal reusable-nya di sini */}
      <ProgramDetailModal
        isOpen={!!selectedProgram}
        onClose={() => setSelectedProgram(null)}
        program={selectedProgram}
      />
    </div>
  );
}
