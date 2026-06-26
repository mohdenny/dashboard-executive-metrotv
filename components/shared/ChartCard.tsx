"use client";

import React from "react";
import BaseChart from "@/components/shared/BaseChart";
import { ChartType, ChartData, ChartOptions, DefaultDataPoint } from "chart.js";
import { cn } from "@/lib/utils";

// Interface properti komponen bungkus chart
interface ChartCardProps<T extends ChartType> {
  type: T;
  title?: string;
  data: ChartData<T, DefaultDataPoint<T>, unknown>;
  options?: ChartOptions<T>;
  height?: number;
  onExpand?: () => void;
  showZoomControls?: boolean;
  className?: string;
}

// Bungkus chart pake card biar rapi dan gampang panggil
export default function ChartCard<T extends ChartType>({
  type,
  title,
  data,
  options,
  height = 360,
  onExpand,
  showZoomControls,
  className,
}: ChartCardProps<T>) {
  // Render kontainer utama chart pake cn biar class prop ga ketiban
  return (
    <div className={cn("flex flex-col relative", className)}>
      <BaseChart
        type={type}
        title={title}
        data={data}
        options={options}
        height={height}
        onExpand={onExpand}
        showZoomControls={showZoomControls}
      />
    </div>
  );
}
