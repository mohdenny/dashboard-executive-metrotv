'use client';

import { ArrowDownRight, ArrowUpRight, MoveDown, MoveUp, TrendingDown, TrendingUp } from "lucide-react";


export type StatusBadgeType = boolean | string;

export const statusConfig: Record<
  StatusBadgeType,
  { label: string; classes: string }
> = {
  // KATEGORI TIKET (DASHBOARD)
  true: {
    label: '14%',
    classes:
      'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/50',
  },
  false: {
    label: '20%',
    classes:
      'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/50',
  },
};

export default function StatusBadge({
  status,
  className = '',
}: {
  status: StatusBadgeType;
  className?: string;
}) {
  const normalizedStatus = status ? 'true' : 'false';
  const config = statusConfig[normalizedStatus];

  return (
    <div className={`inline-flex items-center px-2 py-1 gap-1 rounded-md uppercase tracking-wider border transition-colors duration-200 ${config.classes} ${className}`}>
      <div className={`flex items-center text-lg font-bold ${status ? "text-green-600" : "text-red-500"}`}>
          {status ? (
            <TrendingUp className="size-[16]"/>
          ) : (
            <TrendingDown className="size-[16]" />
          )}
        </div>

        <span className={` text-sm`}>
          {config.label}
        </span>
    </div>

  );
}
