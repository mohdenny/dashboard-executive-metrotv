"use client";
import React from "react";
import { ArrowUpRight, ArrowDownRight, Activity, Minus } from "lucide-react";
import { formatNumberIndo } from "@/lib/formatters";

interface AdvancedStatCardProps {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  inverse?: boolean;
  periodLabel?: string;
  referenceValue?: number;
}

export default function AdvancedStatCard({
  label,
  value,
  prefix = "",
  suffix = "",
  inverse = false,
  periodLabel = "vs Prev",
  referenceValue,
}: AdvancedStatCardProps) {
  // Set nilai lalu default 0 kalo ga ada data sesuai rikues bos
  const safeRefValue = referenceValue ?? 0;

  // Hitung angka selisih
  const diffValue = value - safeRefValue;

  // Hitung persentase pergerakan
  const percentage =
    safeRefValue === 0
      ? value > 0
        ? 100
        : 0
      : Math.abs((diffValue / Math.abs(safeRefValue)) * 100);

  // Tentuin arah pergerakan buat icon
  const isUp = diffValue >= 0;

  // Logika warna, kalo inverse (misal cost), naik itu merah, turun itu ijo
  const isGood = inverse ? !isUp : isUp;

  // Kalo ga ada perubahan, warnanya dibikin netral aja
  const colorClass =
    diffValue === 0
      ? "text-muted-foreground"
      : isGood
        ? "text-green-600"
        : "text-destructive";

  // Helper buat render angka biar rapi, cek kalo persentase pake toFixed, kalo uang/angka gede pake formatNumberIndo
  const renderValue = (val: number) => {
    if (suffix === "%") return val.toFixed(1);
    return formatNumberIndo(val);
  };

  return (
    <div className="flex flex-col bg-card rounded-2xl border border-border shadow-sm overflow-hidden hover:border-primary/40 transition-colors">
      {/* Header Card */}
      <div className="flex items-center gap-2 p-4 border-b border-border/50 bg-muted/10">
        {/* <Activity size={16} className="text-primary" /> */}
        <span className="text-lg font-semibold text-muted-foreground">{label}</span>
      </div>

      {/* Grid Head to Head nilai current dan lalu */}
      <div className="grid grid-cols-2 gap-px bg-border/50">
        {/* Box Current */}
        <div className="flex flex-col p-3 bg-background">
          <span className="text-base font-medium text-amber-500 mb-1">
            Pencapaian Sekarang
          </span>
          <span className="text-lg font-semibold text-foreground">
            {prefix && `${prefix} `}
            {renderValue(value)}
            {suffix && `${suffix}`}
          </span>
        </div>

        {/* Box Previous */}
        <div className="flex flex-col p-3 bg-background opacity-80">
          <span className="text-base text-muted-foreground mb-1 truncate">
            {periodLabel}
          </span>
          <span className="text-lg font-semibold text-muted-foreground">
            {prefix && `${prefix} `}
            {renderValue(safeRefValue)}
            {suffix && `${suffix}`}
          </span>
        </div>
      </div>

      {/* Baris bawah buat nampilin selisih dan persentase pergerakan */}
      <div className="flex items-center justify-between p-4 bg-muted/20 border-t border-border/50">
        <div className="flex flex-col">
          <span className="text-sm font-medium text-muted-foreground mb-0.5">
            Selisih Pencapaian
          </span>
          <span className={`text-base font-bold ${colorClass}`}>
            {diffValue > 0 ? "+" : diffValue < 0 ? "-" : ""}
            {prefix && `${prefix} `}
            {renderValue(Math.abs(diffValue))}
            {suffix && `${suffix}`}
          </span>
        </div>

        <div className="flex flex-col items-end">
          <span className="text-sm font-medium text-muted-foreground mb-0.5">
            Persentase
          </span>
          <span
            className={`flex items-center gap-0.5 font-bold text-base px-2 py-1 rounded-md bg-background border border-border/50 ${colorClass}`}
          >
            {diffValue === 0 ? (
              <Minus size={12} />
            ) : diffValue > 0 ? (
              <ArrowUpRight size={12} />
            ) : (
              <ArrowDownRight size={12} />
            )}
            {percentage.toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  );
}
