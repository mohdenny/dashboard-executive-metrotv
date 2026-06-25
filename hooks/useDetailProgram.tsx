import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchProgramsByRange } from "@/services/api/programService";
import { ColumnConfig } from "@/components/shared/SmartTable";
import { formatBigNumber } from "@/lib/formatters";
import { ProgramFormData } from "@/schemas/program";

export function useDetailProgram() {
  // Ambil data program dari API
  const { data: programs = [], isLoading } = useQuery({
    queryKey: ["programs"],
    queryFn: () => fetchProgramsByRange("", ""),
  });

  // State buat nyimpen data program yang lagi diklik detailnya
  const [selectedProgram, setSelectedProgram] =
    useState<ProgramFormData | null>(null);

  const [selectedPeriod, setSelectedPeriod] = useState<string>("");

  const periodOptions = useMemo(() => {
    const all = programs.flatMap(
      (p: ProgramFormData) => p.periods?.map((x) => x.month) || [],
    );
    return Array.from(new Set(all)).sort().reverse();
  }, [programs]);

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

  const getActivePeriod = (
    data: ProgramFormData | undefined,
    targetPeriod: string,
  ) => {
    if (!data || !data.periods || data.periods.length === 0) return null;
    if (targetPeriod) {
      const found = data.periods.find((p) => p.month === targetPeriod);
      if (found) return found;
      return {
        id: `empty-detail`,
        month: targetPeriod,
        performanceTV: {
          targetTVR: 0,
          targetShare: 0,
          actualTVR: 0,
          actualShare: 0,
        },
        performanceDigital: { views: 0, revenue: 0 },
        financials: {
          costDirect: 0,
          revenueTarget: 0,
          revenueActual: 0,
          pnl: 0,
        },
        inventory: { spot: 0, adRate: 0 },
        status: "-",
      };
    }
    const sorted = [...data.periods].sort((a, b) =>
      b.month.localeCompare(a.month),
    );
    return sorted[0];
  };

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
        accessorFn: (item) =>
          getActivePeriod(item, selectedPeriod)?.performanceTV?.targetTVR,
        id: "targetTVR",
        render: (item) =>
          getActivePeriod(item, selectedPeriod)?.performanceTV?.targetTVR ?? 0,
      },
      {
        header: "Target Share",
        accessorFn: (item) =>
          getActivePeriod(item, selectedPeriod)?.performanceTV?.targetShare,
        id: "targetShare",
        render: (item) =>
          getActivePeriod(item, selectedPeriod)?.performanceTV?.targetShare ??
          0,
      },
      {
        header: "Capaian Share",
        accessorFn: (item) =>
          getActivePeriod(item, selectedPeriod)?.performanceTV?.actualShare,
        id: "capaianShare",
        render: (item) => {
          const active = getActivePeriod(item, selectedPeriod);
          const actualShare = active?.performanceTV?.actualShare ?? 0;
          const targetShare = active?.performanceTV?.targetShare ?? 0;
          return (
            <span
              className={
                actualShare >= targetShare
                  ? "text-green-600 font-bold"
                  : "text-destructive font-bold"
              }
            >
              {actualShare}
            </span>
          );
        },
      },
      {
        header: "Net PNL",
        accessorFn: (item) =>
          getActivePeriod(item, selectedPeriod)?.financials?.pnl,
        id: "pnl",
        render: (item) => {
          const pnl =
            getActivePeriod(item, selectedPeriod)?.financials?.pnl ?? 0;
          return (
            <span
              className={
                pnl >= 0
                  ? "text-green-600 font-bold"
                  : "text-destructive font-bold"
              }
            >
              Rp {formatBigNumber(pnl)}
            </span>
          );
        },
      },
    ],
    [selectedPeriod],
  );

  return {
    programs,
    isLoading,
    selectedProgram,
    setSelectedProgram,
    selectFilters,
    columns,
    selectedPeriod,
    setSelectedPeriod,
    periodOptions,
  };
}
