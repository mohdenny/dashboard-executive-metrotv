"use client";

import React, { useState, useMemo, useSyncExternalStore } from "react";
// Import portal buat ngerender modal di atas body
import { createPortal } from "react-dom";
// Import icon x dan filter x
import { X, FilterX } from "lucide-react";
// Import komponen chart dasar
import BaseChart from "@/components/shared/BaseChart";
// Import data program
import { useQuery } from "@tanstack/react-query";
import { fetchProgramsByRange } from "@/services/api/programService";
// Import tipe data chart
import { ChartData, TooltipItem } from "chart.js";
// Import helper format angka
import { formatBigNumber, formatNumberIndo } from "@/lib/formatters";
// Import tipe plugin datalabels
import ChartDataLabels, {
  Context as DataLabelContext,
} from "chartjs-plugin-datalabels";

// Fungsi buat subscribe kosong supaya memori tetap anteng
const emptySubscribe = () => () => {};

// Interface buat properti modal
interface ChartDetailModalProps {
  // Status buka modal
  isOpen: boolean;
  // Fungsi tutup modal
  onClose: () => void;
  // Judul modal
  title: string;
  // Tipe metrik yang ditampilin
  metricType: string;
  // Daftar kategori buat filter
  programCategories: string[];
}

// Komponen modal detail buat chart
export default function ChartDetailModal({
  // Props buka modal
  isOpen,
  // Props fungsi tutup
  onClose,
  // Props judul
  title,
  // Props tipe metrik
  metricType,
  // Props daftar kategori
  programCategories,
}: ChartDetailModalProps) {
  // Cek apakah udah jalan di client
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  // State filter kategori
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  // State filter periode
  const [selectedPeriod, setSelectedPeriod] = useState<string>("ytd");
  // State bulan mulai
  const [startMonth, setStartMonth] = useState<string>("");
  // State bulan batas
  const [endMonth, setEndMonth] = useState<string>("");
  // State urut data default string kosong
  const [sortOrder, setSortOrder] = useState<string>("");

  // State ganti tab tv
  const [tvTab, setTvTab] = useState<"tvr" | "share">("tvr");

  // Fetch data menggunakan React Query
  const { data: programResponse } = useQuery({
    queryKey: ["programs", "list"],
    queryFn: () => fetchProgramsByRange(),
  });

  const programs = programResponse?.data || [];

  // Opsi dropdown periode
  const periodOptions = [
    { label: "YTD", value: "ytd" },
    { label: "MTD", value: "mtd" },
    { label: "All Time", value: "all" },
    { label: "Custom", value: "custom" },
  ];

  // Filter data program berdasarkan opsi
  const filteredPrograms = useMemo(() => {
    // Salin data mentah
    let result = [...programs];

    // Cek kalo periode custom aktif
    if (selectedPeriod === "custom") {
      // Filter bulan mulai
      if (startMonth) {
        result = result.filter((p) =>
          p.periods.some((per) => per.month >= startMonth),
        );
      }
      // Filter bulan batas
      if (endMonth) {
        result = result.filter((p) =>
          p.periods.some((per) => per.month <= endMonth),
        );
      }
    } else if (selectedPeriod && selectedPeriod !== "ytd") {
      // Ambil waktu hari ini
      const today = new Date();
      // Tahun sekarang
      const currentYear = today.getFullYear();
      // Bulan sekarang
      const currentMonthStr = `${currentYear}-${String(today.getMonth() + 1).padStart(2, "0")}`;
      // Awal tahun
      const firstMonthOfYear = `${currentYear}-01`;

      // Batas filter bulan
      let minMonth = "";
      // Kalo ytd set ke awal tahun
      if (selectedPeriod === "ytd") minMonth = firstMonthOfYear;
      // Kalo mtd set ke bulan sekarang
      else if (selectedPeriod === "mtd") minMonth = currentMonthStr;

      // Filter periode
      result = result.filter((p) =>
        p.periods.some(
          (per) => per.month >= minMonth && per.month <= currentMonthStr,
        ),
      );
    }

    // Filter kategori
    if (selectedCategory) {
      result = result.filter((p) => p.category === selectedCategory);
    }

    // Balikin hasil filter
    return result;
  }, [programs, selectedCategory, startMonth, endMonth, selectedPeriod]);

  // Tentu tipe chart dari prop metrik
  type ModalChartType = "bar" | "doughnut";
  // Logic tipe chart
  const chartType: ModalChartType =
    metricType === "performance" ? "doughnut" : "bar";

  // Susun struktur data chart
  const chartData = useMemo<
    ChartData<ModalChartType, number[], unknown>
  >(() => {
    // Kalo kosong balikin data kosong
    if (filteredPrograms.length === 0) return { labels: [], datasets: [] };

    // Kalo metrik pnl
    if (metricType === "pnl") {
      // Sortir pnl default descending kalo string urut kosong
      const sorted = [...filteredPrograms].sort((a, b) => {
        const pnlB = b.periods.reduce((s, per) => s + per.financials.pnl, 0);
        const pnlA = a.periods.reduce((s, per) => s + per.financials.pnl, 0);
        return sortOrder === "asc" ? pnlA - pnlB : pnlB - pnlA;
      });

      // Balikin data pnl
      return {
        labels: sorted.map((p) => p.name),
        datasets: [
          {
            label: "Net PNL (Rp)",
            data: sorted.map((p) =>
              p.periods.reduce((s, per) => s + per.financials.pnl, 0),
            ),
            backgroundColor: sorted.map((p) => {
              const pnl = p.periods.reduce(
                (s, per) => s + per.financials.pnl,
                0,
              );
              return pnl >= 0 ? "#16a34a" : "#d62728";
            }),
            minBarLength: 80,
          },
        ],
      } as ChartData<ModalChartType, number[], unknown>;
    }

    // Kalo metrik digital
    if (metricType === "digital") {
      // Sortir digital default descending
      const sorted = [...filteredPrograms].sort((a, b) => {
        const revB = b.periods.reduce(
          (s, per) => s + per.performanceDigital.revenue,
          0,
        );
        const revA = a.periods.reduce(
          (s, per) => s + per.performanceDigital.revenue,
          0,
        );
        return sortOrder === "asc" ? revA - revB : revB - revA;
      });

      // Balikin data digital
      return {
        labels: sorted.map((p) => p.name),
        datasets: [
          {
            label: "Digital Revenue (Rp)",
            data: sorted.map((p) =>
              p.periods.reduce(
                (s, per) => s + per.performanceDigital.revenue,
                0,
              ),
            ),
            backgroundColor: "#3B82F6",
            minBarLength: 80,
          },
          {
            label: "Digital Views",
            data: sorted.map((p) =>
              p.periods.reduce((s, per) => s + per.performanceDigital.views, 0),
            ),
            backgroundColor: "#06B6D4",
            minBarLength: 80,
          },
        ],
      } as ChartData<ModalChartType, number[], unknown>;
    }

    // Kalo metrik revenue
    if (metricType === "combo" || metricType === "revenue") {
      // Sortir revenue default descending
      const sorted = [...filteredPrograms].sort((a, b) => {
        const revB = b.periods.reduce(
          (s, per) => s + per.financials.revenueActual,
          0,
        );
        const revA = a.periods.reduce(
          (s, per) => s + per.financials.revenueActual,
          0,
        );
        return sortOrder === "asc" ? revA - revB : revB - revA;
      });

      // Balikin data revenue
      return {
        labels: sorted.map((p) => p.name),
        datasets: [
          {
            label: "Target Revenue (Rp)",
            data: sorted.map((p) =>
              p.periods.reduce((s, per) => s + per.financials.revenueTarget, 0),
            ),
            backgroundColor: "#4bc0c0",
            minBarLength: 80,
          },
          {
            label: "Capaian Revenue (Rp)",
            data: sorted.map((p) =>
              p.periods.reduce((s, per) => s + per.financials.revenueActual, 0),
            ),
            // Warna hijau buat revenue
            backgroundColor: "#2ca02c",
            minBarLength: 80,
          },
        ],
      } as ChartData<ModalChartType, number[], unknown>;
    }

    // Kalo metrik tv
    if (metricType === "tv") {
      // Kalo tvr aktif
      if (tvTab === "tvr") {
        // Sortir tvr default descending
        const sorted = [...filteredPrograms].sort((a, b) => {
          const actB = b.periods.reduce(
            (s, per) => s + per.performanceTV.actualTVR,
            0,
          );
          const actA = a.periods.reduce(
            (s, per) => s + per.performanceTV.actualTVR,
            0,
          );
          return sortOrder === "asc" ? actA - actB : actB - actA;
        });

        // Balikin data tvr
        return {
          labels: sorted.map((p) => p.name),
          datasets: [
            {
              label: "Target TVR",
              data: sorted.map((p) =>
                p.periods.reduce(
                  (s, per) => s + per.performanceTV.targetTVR,
                  0,
                ),
              ),
              backgroundColor: "#1f77b4",
              minBarLength: 80,
            },
            {
              label: "Capaian TVR",
              data: sorted.map((p) =>
                p.periods.reduce(
                  (s, per) => s + per.performanceTV.actualTVR,
                  0,
                ),
              ),
              backgroundColor: "#ff7f0e",
              minBarLength: 80,
            },
          ],
        } as ChartData<ModalChartType, number[], unknown>;
      } else {
        // Sortir share default descending
        const sorted = [...filteredPrograms].sort((a, b) => {
          const actB = b.periods.reduce(
            (s, per) => s + per.performanceTV.actualShare,
            0,
          );
          const actA = a.periods.reduce(
            (s, per) => s + per.performanceTV.actualShare,
            0,
          );
          return sortOrder === "asc" ? actA - actB : actB - actA;
        });

        // Balikin data share
        return {
          labels: sorted.map((p) => p.name),
          datasets: [
            {
              label: "Target Share (%)",
              data: sorted.map((p) =>
                p.periods.reduce(
                  (s, per) => s + per.performanceTV.targetShare,
                  0,
                ),
              ),
              backgroundColor: "#1f77b4",
              minBarLength: 80,
            },
            {
              label: "Capaian Share (%)",
              data: sorted.map((p) =>
                p.periods.reduce(
                  (s, per) => s + per.performanceTV.actualShare,
                  0,
                ),
              ),
              backgroundColor: "#ff7f0e",
              minBarLength: 80,
            },
          ],
        } as ChartData<ModalChartType, number[], unknown>;
      }
    }

    // Kalo metrik performance
    if (metricType === "performance") {
      // Total revenue
      const revCapaian = filteredPrograms.reduce(
        (acc, p) =>
          acc +
          p.periods.reduce(
            (s, per) =>
              s +
              per.financials.revenueActual +
              (per.performanceDigital.revenue || 0),
            0,
          ),
        0,
      );
      // Total cost
      const costDirect = filteredPrograms.reduce(
        (acc, p) =>
          acc + p.periods.reduce((s, per) => s + per.financials.costDirect, 0),
        0,
      );
      // Total net
      const revTarget = filteredPrograms.reduce(
        (acc, p) =>
          acc +
          p.periods.reduce((s, per) => s + per.financials.revenueTarget, 0),
        0,
      );

      // Balikin data performa
      return {
        labels: ["Capaian Revenue", "Cost Direct", "Target Revenue"],
        datasets: [
          {
            data: [revCapaian, costDirect, revTarget],
          },
        ],
      } as ChartData<ModalChartType, number[], unknown>;
    }

    // Balikin data kosong
    return { labels: [], datasets: [] } as ChartData<
      ModalChartType,
      number[],
      unknown
    >;
  }, [filteredPrograms, metricType, sortOrder, tvTab]);

  // Kalo modal nutup atau belum mount jangan render
  if (!isOpen || !mounted) return null;

  // Render modal pake portal
  return createPortal(
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-2 sm:p-6">
      <div className="bg-background w-full max-w-6xl max-h-[95vh] rounded-[28px] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-border">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 bg-card shrink-0">
          <h2 className="text-xl font-bold text-foreground">
            Detail Data: {title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-destructive/10 hover:text-destructive rounded-full cursor-pointer transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
          <div className="bg-card px-6 py-4 rounded-2xl flex flex-wrap lg:flex-nowrap lg:items-center justify-between gap-4 border border-border/50">
            <div className="flex items-center gap-2 w-full lg:w-auto">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="appearance-none border border-border bg-muted/40 text-foreground text-sm font-medium rounded-full px-4 py-2 h-10 outline-none cursor-pointer w-full lg:w-auto"
              >
                {/* Opsi kategori */}
                <option value="" className="bg-background text-foreground">
                  Semua
                </option>
                {programCategories.map((c, i) => (
                  <option
                    key={i}
                    value={c}
                    className="bg-background text-foreground"
                  >
                    {c}
                  </option>
                ))}
              </select>

              {/* Tampil opsi sort kalo tipe bukan donut */}
              {chartType !== "doughnut" && (
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="appearance-none border border-border bg-muted/40 text-foreground text-sm font-medium rounded-full px-4 py-2 h-10 outline-none cursor-pointer w-full lg:w-auto"
                >
                  <option
                    value=""
                    className="bg-background text-foreground"
                    disabled
                    hidden
                  >
                    Pilih Urutan
                  </option>
                  <option
                    value="desc"
                    className="bg-background text-foreground"
                  >
                    Tertinggi ke Terendah
                  </option>
                  <option value="asc" className="bg-background text-foreground">
                    Terendah ke Tertinggi
                  </option>
                </select>
              )}
            </div>

            {/* Tampil tab tv kalo tipe tv */}
            {metricType === "tv" && (
              <div className="flex bg-muted/40 p-1 rounded-full border border-border w-full lg:w-auto">
                <button
                  onClick={() => setTvTab("tvr")}
                  className={`px-4 py-1.5 text-xs font-bold rounded-full transition-colors w-full sm:w-auto cursor-pointer ${tvTab === "tvr" ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted"}`}
                >
                  TVR
                </button>
                <button
                  onClick={() => setTvTab("share")}
                  className={`px-4 py-1.5 text-xs font-bold rounded-full transition-colors w-full sm:w-auto cursor-pointer ${tvTab === "share" ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted"}`}
                >
                  Share
                </button>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="appearance-none border border-border bg-muted/40 text-foreground text-sm font-medium rounded-full px-4 py-2 h-10 outline-none cursor-pointer w-full lg:w-auto"
              >
                {/* Loop opsi periode */}
                {periodOptions.map((opt) => (
                  <option
                    key={opt.value}
                    value={opt.value}
                    className="bg-background text-foreground"
                  >
                    {opt.label}
                  </option>
                ))}
              </select>

              {/* Tampil custom tanggal */}
              {selectedPeriod === "custom" && (
                <div className="flex items-center gap-2">
                  <input
                    type="month"
                    value={startMonth}
                    onChange={(e) => setStartMonth(e.target.value)}
                    className="bg-muted/40 border border-border text-foreground rounded-full px-3 py-2 h-10 text-xs outline-none cursor-pointer"
                  />
                  <span className="text-muted-foreground text-xs">s/d</span>
                  <input
                    type="month"
                    value={endMonth}
                    onChange={(e) => setEndMonth(e.target.value)}
                    className="bg-muted/40 border border-border text-foreground rounded-full px-3 py-2 h-10 text-xs outline-none cursor-pointer"
                  />
                </div>
              )}

              {/* Tombol reset */}
              {/*
              {(startMonth ||
                endMonth ||
                selectedCategory ||
                sortOrder ||
                (selectedPeriod && selectedPeriod !== "ytd")) && (
                <button
                  onClick={() => {
                    setStartMonth("");
                    setEndMonth("");
                    setSelectedCategory("");
                    setSelectedPeriod("ytd");
                    setSortOrder("");
                  }}
                  className="flex items-center gap-1.5 text-xs bg-destructive/10 text-destructive px-3 py-2 rounded-xl font-bold hover:bg-destructive/20 transition-colors cursor-pointer"
                >
                  { // Icon filter x }
                  <FilterX size={14} /> Reset
                </button>
              )}
              */}
            </div>
          </div>

          <div className="bg-card shadow-sm rounded-2xl border border-border p-4 overflow-y-auto overflow-x-hidden custom-scrollbar h-[600px]">
            {/* Area grafik */}
            <div
              style={{
                width: "100%",
                height:
                  chartType === "bar"
                    ? `${Math.max(500, filteredPrograms.length * 40)}px`
                    : "500px",
              }}
            >
              <BaseChart
                type={chartType}
                data={chartData}
                height={
                  chartType === "bar"
                    ? Math.max(500, filteredPrograms.length * 40)
                    : 500
                }
                showZoomControls={true}
                options={{
                  // Arah axis
                  indexAxis: chartType === "bar" ? "y" : "x",
                  maintainAspectRatio: false,
                  plugins: {
                    zoom: {
                      // Set mode zoom
                      zoom: {
                        mode: "xy",
                      },
                      // Set mode pan
                      pan: {
                        enabled: true,
                        mode: "xy",
                      },
                    },
                    // Konfigurasi datalabels lokal di modal ini
                    datalabels: {
                      // Paksa munculin teksnya
                      display: true,
                      // Atur posisi teks di ujung dalem bar
                      anchor: "end",
                      align: "start",
                      // Warna teks putih biar kontras
                      color: "#ffffff",
                      font: {
                        weight: "bold",
                        size: 11,
                      },
                      // Pake formatter big number
                      formatter: function (
                        value: unknown,
                        context: DataLabelContext,
                      ) {
                        // Kalo mau ada tulisan Rp di depan
                        // // Ambil nilai angka asli dari data grafik
                        // const rawValue =
                        //   context.dataset.data[context.dataIndex];
                        // // Format angkanya jadi big number
                        // const formattedValue = formatBigNumber(
                        //   Number(rawValue),
                        // );
                        // // Tambahin Rp di depannya
                        // return `Rp ${formattedValue}`;

                        // Ambil nilai angka asli dari data grafik
                        const rawValue =
                          context.dataset.data[context.dataIndex];
                        return formatBigNumber(Number(rawValue));
                      },
                    },
                    tooltip: {
                      callbacks: {
                        label: function (context: TooltipItem<"bar">) {
                          // Ambil nama dataset (Net PNL (Rp))
                          const datasetLabel = context.dataset.label || "";
                          // Pake formatter indo buat angkanya
                          const formattedValue = formatNumberIndo(
                            Number(context.raw),
                          );
                          // Gabungin label sama angka
                          return `${datasetLabel}: ${formattedValue}`;
                        },
                      },
                    },
                  },
                  scales:
                    chartType === "bar"
                      ? {
                          x: {
                            ticks: {
                              // Pake formatter big number
                              callback: function (value: string | number) {
                                return formatBigNumber(Number(value));
                              },
                            },
                          },
                          y: {
                            ticks: {
                              // Paksa tampil semua
                              autoSkip: false,
                            },
                          },
                        }
                      : undefined,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
