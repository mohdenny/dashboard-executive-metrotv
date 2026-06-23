"use client";

import React, { useSyncExternalStore } from "react";
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
import SmartTable from "@/components/shared/SmartTable";
import BaseChart from "@/components/shared/BaseChart";
import { formatBigNumber } from "@/lib/formatters";
import { useDetailProgram } from "@/hooks/useDetailProgram";

const emptySubscribe = () => () => {};

export default function DetailProgramPage() {
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  // Panggil semua data dan logika dari custom hook
  const {
    programs,
    isLoading,
    selectedProgram,
    setSelectedProgram,
    selectFilters,
    columns,
    tvChartData,
    financeChartData,
  } = useDetailProgram();

  return (
    <div className="p-4 md:px-8 space-y-6 max-w-[1800px] mx-auto animate-in fade-in duration-300">
      {isLoading ? (
        <div className="p-12 text-center text-muted-foreground font-medium">
          Memuat data program...
        </div>
      ) : (
        <div className="bg-card shadow-sm rounded-2xl border border-border p-4">
          <SmartTable
            data={programs}
            columns={columns}
            selectFilters={selectFilters}
            enableDateRange={true}
            dateKey="periodeBulan"
            searchPlaceholder="Cari nama program..."
          />
        </div>
      )}

      {/* Modal popup detail seluruh nilai mock data */}
      {selectedProgram &&
        mounted &&
        createPortal(
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-2 sm:p-6">
            <div className="bg-background w-full max-w-6xl max-h-[95vh] rounded-[28px] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-border">
              {/* Kepala modal */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 bg-card shrink-0">
                <div>
                  <h2 className="text-xl font-bold text-foreground">
                    {selectedProgram.name}
                  </h2>
                  <div className="flex flex-wrap gap-2 mt-1">
                    <span className="text-xs font-medium px-2 py-0.5 bg-primary/10 text-primary rounded-md flex items-center gap-1">
                      <Clock size={12} /> {selectedProgram.periodeBulan}
                    </span>
                    <span className="text-xs font-medium px-2 py-0.5 bg-muted text-muted-foreground rounded-md flex items-center gap-1">
                      <Tag size={12} /> Kategori {selectedProgram.category}
                    </span>
                    <span className="text-xs font-medium px-2 py-0.5 bg-muted text-muted-foreground rounded-md flex items-center gap-1">
                      <FileText size={12} />{" "}
                      {selectedProgram.descriptionCategory}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedProgram(null)}
                  className="p-2 hover:bg-destructive/10 hover:text-destructive rounded-full cursor-pointer transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Badan konten rincian data lengkap */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
                {/* Bagian performa utama disandingkan side-by-side */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Blok rating & share TV */}
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
                          {selectedProgram.targetTVR}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground block">
                          Capaian TVR
                        </span>
                        <span
                          className={`text-xl font-bold ${selectedProgram.capaianShare >= selectedProgram.targetShare ? "text-green-600" : "text-destructive"}`}
                        >
                          {selectedProgram.capaianTVR}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground block">
                          Target Share
                        </span>
                        <span className="text-xl font-bold text-foreground">
                          {selectedProgram.targetShare}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground block">
                          Capaian Share
                        </span>
                        <span
                          className={`text-xl font-bold ${selectedProgram.capaianShare >= selectedProgram.targetShare ? "text-green-600" : "text-destructive"}`}
                        >
                          {selectedProgram.capaianShare}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Blok revenue finansial */}
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
                          Rp {formatBigNumber(selectedProgram.revenueTarget)}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground block">
                          Capaian Revenue
                        </span>
                        <span className="text-base font-bold text-primary">
                          Rp {formatBigNumber(selectedProgram.revenueCapaian)}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground block">
                          Digital Revenue
                        </span>
                        <span className="text-base font-bold text-yellow-600">
                          Rp{" "}
                          {formatBigNumber(selectedProgram.digitalRevenue || 0)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Blok efisiensi & hasil akhir */}
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
                          Rp {formatBigNumber(selectedProgram.costDirect)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center border-t border-border pt-2">
                        <span className="text-xs text-muted-foreground">
                          Net PNL Akhir:
                        </span>
                        <span
                          className={`text-base font-bold ${selectedProgram.pnl >= 0 ? "text-green-600" : "text-destructive"}`}
                        >
                          Rp {formatBigNumber(selectedProgram.pnl)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center border-t border-border pt-2">
                        <span className="text-xs text-muted-foreground">
                          Status / Evaluasi:
                        </span>
                        <span
                          className={`text-sm font-bold ${selectedProgram.pnl >= 0 ? "text-green-600" : "text-destructive"}`}
                        >
                          {selectedProgram.keterangan}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sektor visualisasi grafik samping-sampingan */}
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

                {/* Sektor pelengkap nilai komersial & operasional */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Nilai digital media */}
                  <div className="bg-card border border-border p-5 rounded-2xl shadow-sm flex flex-col justify-between">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <MonitorPlay size={14} /> Distribusi Digital
                    </span>
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-muted-foreground">
                        Total Views Konten:
                      </div>
                      <div className="text-xl font-bold text-foreground">
                        {formatBigNumber(selectedProgram.digitalViews || 0)}{" "}
                        Views
                      </div>
                    </div>
                  </div>

                  {/* Nilai komersial spot iklan */}
                  <div className="bg-card border border-border p-5 rounded-2xl shadow-sm flex flex-col justify-between">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Layers size={14} /> Kapasitas Komersial
                    </span>
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-muted-foreground">
                        Inventory Spot Iklan:
                      </div>
                      <div className="text-xl font-bold text-foreground">
                        {selectedProgram.inventorySpot} Slot
                      </div>
                    </div>
                  </div>

                  {/* Nilai harga pasar rate iklan */}
                  <div className="bg-card border border-border p-5 rounded-2xl shadow-sm flex flex-col justify-between">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Wallet size={14} /> Nilai Jual Produk
                    </span>
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-muted-foreground">
                        Rate Card per Spot:
                      </div>
                      <div className="text-xl font-bold text-foreground">
                        Rp {formatBigNumber(selectedProgram.rateIklan)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
