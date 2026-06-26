import React from "react";
import { cn } from "@/lib/utils";

interface PeriodFilterBoxProps {
  selectedPeriod: string;
  setSelectedPeriod: (val: string) => void;
  periodOptions: string[];
  className?: string;
}

// Wadah filter tabel periode biar gampang panggil
export default function PeriodFilterBox({
  selectedPeriod,
  setSelectedPeriod,
  periodOptions,
  className,
}: PeriodFilterBoxProps) {
  return (
    // Pake cn biar prop classname luar masuk dengan rapi
    <div className={cn("flex items-center gap-4 mb-4 px-2", className)}>
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
        Data Ditampilkan:{" "}
        <span className="font-bold text-foreground">
          {selectedPeriod || periodOptions[0] || "-"}
        </span>
      </span>
    </div>
  );
}
