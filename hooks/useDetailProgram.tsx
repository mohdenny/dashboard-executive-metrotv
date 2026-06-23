import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchProgramsByRange } from "@/services/api/programService";
import { ColumnConfig } from "@/components/shared/SmartTable";
import { ChartData } from "chart.js";
import { formatBigNumber } from "@/lib/formatters";
import { ProgramFormData } from "@/schemas/program";

export function useDetailProgram() {
  // Ambil data program dari API
  const { data: programs = [], isLoading } = useQuery({
    queryKey: ["programs", "detail"],
    queryFn: () => fetchProgramsByRange("", ""),
  });

  // State buat nyimpen data program yang lagi diklik detailnya
  const [selectedProgram, setSelectedProgram] =
    useState<ProgramFormData | null>(null);

  // Opsi dropdown dinamis berdasarkan kategori yang tersedia
  const categoryOptions = useMemo(() => {
    const uniqueCategories = Array.from(
      new Set(programs.map((p) => p.category)),
    ).filter(Boolean);
    return uniqueCategories.map((c) => ({ label: `Kategori ${c}`, value: c }));
  }, [programs]);

  const selectFilters = [
    {
      key: "category",
      label: "Semua Kategori",
      options: categoryOptions,
    },
  ];

  // Setup susunan kolom tabel tanpa tombol aksi terpisah
  const columns: ColumnConfig<ProgramFormData>[] = useMemo(
    () => [
      {
        header: "Nama Program",
        accessorKey: "name",
        // Bikin nama program bisa diklik langsung buat buka modal detail
        render: (item) => (
          <button
            onClick={() => setSelectedProgram(item)}
            className="font-bold text-primary hover:underline text-left cursor-pointer focus:outline-none"
          >
            {item.name}
          </button>
        ),
      },
      {
        header: "Periode",
        accessorKey: "periodeBulan",
        render: (item) => item.periodeBulan,
      },
      {
        header: "Kategori",
        accessorKey: "category",
        render: (item) => (
          <span className="bg-secondary text-secondary-foreground px-2.5 py-1 rounded-md text-[11px] font-bold">
            {item.category}
          </span>
        ),
      },
      {
        header: "Jam Tayang",
        accessorKey: "broadcastTime",
        render: (item) => item.broadcastTime,
      },
      {
        header: "Target TVR",
        accessorKey: "targetTVR",
        render: (item) => item.targetTVR,
      },
      {
        header: "Target Share",
        accessorKey: "targetShare",
        render: (item) => item.targetShare,
      },
      {
        header: "Capaian Share",
        accessorKey: "capaianShare",
        render: (item) => (
          <span
            className={
              item.capaianShare >= item.targetShare
                ? "text-green-600 font-bold"
                : "text-destructive font-bold"
            }
          >
            {item.capaianShare}
          </span>
        ),
      },
      {
        header: "Net PNL",
        accessorKey: "pnl",
        render: (item) => (
          <span
            className={
              item.pnl >= 0
                ? "text-green-600 font-bold"
                : "text-destructive font-bold"
            }
          >
            Rp {formatBigNumber(item.pnl)}
          </span>
        ),
      },
    ],
    [],
  );

  // Setup chart performa TV dengan warna baru pengganti abu-abu
  const tvChartData = useMemo<ChartData<"bar"> | null>(() => {
    if (!selectedProgram) return null;
    return {
      labels: ["TVR", "Share"],
      datasets: [
        {
          label: "Target",
          data: [selectedProgram.targetTVR, selectedProgram.targetShare],
          // Ganti warna abu-abu jadi warna teal/cyan lembut
          backgroundColor: "#4bc0c0",
          minBarLength: 10,
        },
        {
          label: "Aktual",
          data: [selectedProgram.capaianTVR, selectedProgram.capaianShare],
          backgroundColor: "#1f77b4",
          minBarLength: 10,
        },
      ],
    };
  }, [selectedProgram]);

  // Setup chart finansial dengan warna baru pengganti abu-abu
  const financeChartData = useMemo<ChartData<"bar"> | null>(() => {
    if (!selectedProgram) return null;
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
            selectedProgram.revenueTarget,
            selectedProgram.revenueCapaian,
            selectedProgram.costDirect,
            selectedProgram.digitalRevenue || 0,
            selectedProgram.pnl,
          ],
          backgroundColor: [
            // Target rev pake warna teal baru mengganti abu-abu
            "#4bc0c0",
            // Aktual rev pake biru bawaan
            "#1f77b4",
            // Cost direct oren
            "#ff7f0e",
            // Digital rev ungu
            "#9467bd",
            // Net PNL hijau/merah
            selectedProgram.pnl >= 0 ? "#2ca02c" : "#d62728",
          ],
          minBarLength: 15,
        },
      ],
    };
  }, [selectedProgram]);

  return {
    programs,
    isLoading,
    selectedProgram,
    setSelectedProgram,
    selectFilters,
    columns,
    tvChartData,
    financeChartData,
  };
}
