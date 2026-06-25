"use client";

import React, {
  useEffect,
  useState,
  useMemo,
  useSyncExternalStore,
} from "react";
import { createPortal } from "react-dom";
import {
  X,
  Tv,
  DollarSign,
  TrendingUp,
  MonitorPlay,
  Wallet,
  Layers,
  Clock,
  Tag,
  FileText,
} from "lucide-react";
import BaseChart from "@/components/shared/BaseChart";
import { formatBigNumber, formatNumberIndo } from "@/lib/formatters";
import { ChartData } from "chart.js";
import { ProgramFormData } from "@/schemas/program";

interface ProgramDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  program: ProgramFormData | null;
}

const emptySubscribe = () => () => {};

export default function ProgramDetailModal({
  isOpen,
  onClose,
  program,
}: ProgramDetailModalProps) {
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  const tvChartData = useMemo<ChartData<"bar"> | null>(() => {
    if (!program) return null;
    return {
      labels: ["TVR", "Share"],
      datasets: [
        {
          label: "Target",
          data: [program.targetTVR, program.targetShare],
          minBarLength: 10,
          backgroundColor: "#1f77b4",
        },
        {
          label: "Aktual",
          data: [program.capaianTVR, program.capaianShare],
          minBarLength: 10,
        },
      ],
    };
  }, [program]);

  const financeChartData = useMemo<ChartData<"bar"> | null>(() => {
    if (!program) return null;
    return {
      labels: [
        "Target Rev",
        "Aktual Rev",
        "Cost Direct",
        "Digital Rev",
        "Net PNL",
      ],
      datasets: [
        {
          label: "Nominal (Rp)",
          data: [
            program.revenueTarget,
            program.revenueCapaian,
            program.costDirect,
            program.digitalRevenue || 0,
            program.pnl,
          ],
          backgroundColor: [
            "#1f77b4",
            "#ff7f0e",
            "#8c564b",
            "#9467bd",
            program.pnl >= 0 ? "#2ca02c" : "#d62728",
          ],
          minBarLength: 15,
        },
      ],
    };
  }, [program]);

  if (!isOpen || !program || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-2 sm:p-6">
      <div className="bg-background w-full max-w-6xl max-h-[95vh] rounded-[28px] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-border">
        {/* Kepala Modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 bg-card shrink-0">
          <div>
            <h2 className="text-xl font-bold text-foreground">
              {program.name}
            </h2>
            <div className="flex flex-wrap gap-2 mt-1">
              <span className="text-xs font-medium px-2 py-0.5 bg-primary/10 text-primary rounded-md flex items-center gap-1">
                <Clock size={12} /> {program.periodeBulan}
              </span>
              <span className="text-xs font-medium px-2 py-0.5 bg-muted text-muted-foreground rounded-md flex items-center gap-1">
                <Tag size={12} /> Kategori {program.category}
              </span>
              <span className="text-xs font-medium px-2 py-0.5 bg-muted text-muted-foreground rounded-md flex items-center gap-1">
                <FileText size={12} /> {program.descriptionCategory}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-destructive/10 hover:text-destructive rounded-full cursor-pointer transition-colors focus:outline-none"
          >
            <X size={24} />
          </button>
        </div>

        {/* Badan Konten Rincian Data Lengkap */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Blok Rating & Share TV */}
            <div className="bg-card border border-border p-5 rounded-2xl shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 border-b border-border pb-2">
                <Tv size={16} /> Performa Layar TV
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-muted-foreground block">
                    Target TVR
                  </span>
                  <span className="text-xl font-bold text-foreground">
                    {program.targetTVR}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">
                    Capaian TVR
                  </span>
                  <span className="text-xl font-bold text-primary">
                    {program.capaianTVR}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">
                    Target Share
                  </span>
                  <span className="text-xl font-bold text-foreground">
                    {program.targetShare}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">
                    Capaian Share
                  </span>
                  <span
                    className={`text-xl font-bold ${program.capaianShare >= program.targetShare ? "text-green-600" : "text-destructive"}`}
                  >
                    {program.capaianShare}
                  </span>
                </div>
              </div>
            </div>

            {/* Blok Revenue Finansial */}
            <div className="bg-card border border-border p-5 rounded-2xl shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 border-b border-border pb-2">
                <DollarSign size={16} /> Revenue Finansial
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <span className="text-xs text-muted-foreground block">
                    Target Revenue
                  </span>
                  <span className="text-lg font-bold text-foreground">
                    Rp {formatNumberIndo(program.revenueTarget)}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">
                    Capaian Revenue
                  </span>
                  <span className="text-base font-bold text-primary">
                    Rp {formatNumberIndo(program.revenueCapaian)}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">
                    Digital Revenue
                  </span>
                  <span className="text-base font-bold text-yellow-600">
                    Rp {formatNumberIndo(program.digitalRevenue || 0)}
                  </span>
                </div>
              </div>
            </div>

            {/* Blok Efisiensi & Hasil Akhir */}
            <div className="bg-card border border-border p-5 rounded-2xl shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 border-b border-border pb-2">
                <TrendingUp size={16} /> Profitabilitas & Anggaran
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">
                    Cost Direct (Modal):
                  </span>
                  <span className="text-sm font-bold text-foreground">
                    Rp {formatNumberIndo(program.costDirect)}
                  </span>
                </div>
                <div className="flex justify-between items-center border-t border-border pt-2">
                  <span className="text-xs text-muted-foreground">
                    Net PNL Akhir:
                  </span>
                  <span
                    className={`text-base font-bold ${program.pnl >= 0 ? "text-green-600" : "text-destructive"}`}
                  >
                    Rp {formatNumberIndo(program.pnl)}
                  </span>
                </div>
                <div className="flex justify-between items-center border-t border-border pt-2">
                  <span className="text-xs text-muted-foreground">
                    Status / Evaluasi:
                  </span>
                  <span
                    className={`text-sm font-bold ${program.pnl >= 0 ? "text-green-600" : "text-destructive"}`}
                  >
                    {program.keterangan}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-card border border-border rounded-2xl shadow-sm p-2 flex flex-col">
              {tvChartData && (
                <BaseChart
                  type="bar"
                  title="Performa TV (Target vs Aktual)"
                  data={tvChartData}
                  height={320}
                />
              )}
            </div>

            <div className="bg-card border border-border rounded-2xl shadow-sm p-2 flex flex-col">
              {financeChartData && (
                <BaseChart
                  type="bar"
                  title="Struktur Anggaran & Realisasi"
                  data={financeChartData}
                  height={320}
                  options={{
                    plugins: {
                      legend: { display: false },
                    },
                  }}
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Nilai Digital Media */}
            <div className="bg-card border border-border p-5 rounded-2xl shadow-sm flex flex-col justify-between">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <MonitorPlay size={14} /> Distribusi Digital
              </span>
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">
                  Total Views Konten:
                </div>
                <div className="text-xl font-bold text-foreground">
                  {formatNumberIndo(program.digitalViews || 0)} Views
                </div>
              </div>
            </div>

            {/* Nilai Komersial Spot Iklan */}
            <div className="bg-card border border-border p-5 rounded-2xl shadow-sm flex flex-col justify-between">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Layers size={14} /> Kapasitas Komersial
              </span>
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">
                  Inventory Spot Iklan:
                </div>
                <div className="text-xl font-bold text-foreground">
                  {program.inventorySpot} Slot Tersedia
                </div>
              </div>
            </div>

            {/* Nilai Harga Pasar Rate Iklan */}
            <div className="bg-card border border-border p-5 rounded-2xl shadow-sm flex flex-col justify-between">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Wallet size={14} /> Nilai Jual Produk
              </span>
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">
                  Rate Card per Spot:
                </div>
                <div className="text-xl font-bold text-foreground">
                  Rp {formatNumberIndo(program.rateIklan)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
