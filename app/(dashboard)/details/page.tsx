"use client";

import React from "react";
import SmartTable from "@/components/shared/SmartTable";
import ProgramDetailModal from "@/components/shared/ProgramDetailModal";
import { useDetailProgram } from "@/hooks/useDetailProgram";
import PeriodFilterBox from "@/components/shared/PeriodFilterBox";

export default function DetailProgramPage() {
  // Tarik data sama kolom tabel dari hook
  // Ga butuh narik data tvchartdata sama financechartdata di sini
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
          <PeriodFilterBox
            selectedPeriod={selectedPeriod}
            setSelectedPeriod={setSelectedPeriod}
            periodOptions={periodOptions}
          />

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

      {/* Panggil komponen modal reusable di sini */}
      <ProgramDetailModal
        isOpen={!!selectedProgram}
        onClose={() => setSelectedProgram(null)}
        program={selectedProgram}
      />
    </div>
  );
}
