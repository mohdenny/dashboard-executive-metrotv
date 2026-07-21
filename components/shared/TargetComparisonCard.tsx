import React from "react";
// Import koleksi icon dari lucide react
import { Target } from "lucide-react";
// Import fungsi helper format angka biar enak dibaca
import { formatBigNumber } from "@/lib/formatters";

// Interface buat mendefinisikan tipe properti card
interface TargetComparisonCardProps {
  label: string;
  actual: number;
  target: number;
  prefix?: string;
  suffix?: string;
  inverse?: boolean;
}

// Komponen utama buat nampilin komparasi target
export default function TargetComparisonCard({
  label,
  actual,
  target,
  prefix = "",
  suffix = "",
  inverse = false,
}: TargetComparisonCardProps) {
  // Kalkulasi selisih nilai aktual dan target
  const diff = actual - target;
  // Tentuian status tercapai atau nggak
  const isAchieved = inverse ? diff <= 0 : diff >= 0;
  // Kalkulasi persentase capaian
  const achievementPct = target > 0 ? (actual / target) * 100 : 0;
  // Setup class warna berdasarkan status
  const colorClass = isAchieved ? "text-green-600" : "text-destructive";
  const bgClass = isAchieved ? "bg-green-600" : "bg-primary";

  return (
    // Container utama card
    <div className="flex flex-col py-2 px-3 bg-muted/20 rounded-xl border border-border/50">
      {/* Header card */}
      <div className="flex items-center justify-between mb-1">
        <span className="text-base font-medium text-muted-foreground">
          {label}
        </span>
        <Target size={12} className="text-muted-foreground/70" />
      </div>
      {/* Nilai aktual */}
      <span className="text-large font-bold text-foreground">
        {prefix && `${prefix} `}
        {formatBigNumber(actual)}
        {suffix && `${suffix}`}
      </span>
      {/* Box info target, persentase, dan selisih */}
      <div className="flex flex-col mt-1.5 gap-1">
        <div className="flex items-center justify-between">
          <span className="text-base font-medium text-muted-foreground">
            Target: {prefix && `${prefix} `}
            {formatBigNumber(target)}
            {suffix && `${suffix}`}
          </span>
          {/* Teks persentase dan selisih */}
          <span className={`font-bold text-base ${colorClass}`}>
            {achievementPct.toFixed(1)}% (Selisih: {diff > 0 ? "+" : ""}
            {diff.toFixed(1)})
          </span>
        </div>
        {/* Progress bar capaian */}
        <div className="w-full bg-border/50 rounded-full h-1 overflow-hidden">
          <div
            className={`h-1 rounded-full ${bgClass}`}
            style={{ width: `${Math.min(achievementPct, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
