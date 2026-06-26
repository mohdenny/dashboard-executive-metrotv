import { ChartData } from "chart.js";
import { ProgramFormData } from "@/schemas/program";

// Alias tipe buat periode
export type ProgramPeriod = ProgramFormData["periods"][number];

// Hitung total nilai dari array periode
export const sumPeriodValue = (
  prog: ProgramFormData,
  valueGetter: (per: ProgramPeriod) => number,
): number => {
  return prog.periods.reduce((s, per) => s + valueGetter(per), 0);
};

// Urut sama potong array program dasar nilai kalkulasi
export const sortAndSlicePrograms = (
  programs: ProgramFormData[],
  valueGetter: (per: ProgramPeriod) => number,
  isDesc: boolean = true,
  limit: number = 5,
): ProgramFormData[] => {
  return [...programs]
    .sort((a, b) => {
      const valA = sumPeriodValue(a, valueGetter);
      const valB = sumPeriodValue(b, valueGetter);
      return isDesc ? valB - valA : valA - valB;
    })
    .slice(0, limit);
};

// Rakit dataset bar chart standar biar rapi
export const createBarDataset = (
  label: string,
  data: (number | null)[],
  backgroundColor: string | string[],
  minBarLength: number = 15,
) => ({
  label,
  data,
  backgroundColor,
  minBarLength,
});

// Buat data chart bar satu dataset otomatis biar dry
export const generateBarChartData = (
  programs: ProgramFormData[],
  valueGetter: (per: ProgramPeriod) => number,
  label: string,
  color: string | string[],
  isDesc: boolean = true,
  limit: number = 5,
): ChartData<"bar", (number | null)[], unknown> => {
  // Urut data program
  const sorted = sortAndSlicePrograms(programs, valueGetter, isDesc, limit);

  // Susun dataset siap pakai
  return {
    labels: sorted.map((p) => p.name),
    datasets: [
      createBarDataset(
        label,
        sorted.map((p) => sumPeriodValue(p, valueGetter)),
        color,
      ),
    ],
  };
};

// Buat data chart bar dua dataset otomatis biar dry
export const generateDoubleBarChartData = (
  programs: ProgramFormData[],
  sortGetter: (per: ProgramPeriod) => number,
  getters: {
    getter: (per: ProgramPeriod) => number;
    label: string;
    color: string | string[];
  }[],
  isDesc: boolean = true,
  limit: number = 5,
): ChartData<"bar", (number | null)[], unknown> => {
  // Urut data program
  const sorted = sortAndSlicePrograms(programs, sortGetter, isDesc, limit);

  // Susun multi dataset
  return {
    labels: sorted.map((p) => p.name),
    datasets: getters.map((g) =>
      createBarDataset(
        g.label,
        sorted.map((p) => sumPeriodValue(p, g.getter)),
        g.color,
      ),
    ),
  };
};
