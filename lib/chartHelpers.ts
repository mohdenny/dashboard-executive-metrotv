// Import tipe data chart dari library chart js
import { ChartData } from "chart.js";
// Import tipe data formulir program dari skema
import { ProgramFormData } from "@/schemas/program";

// Alias tipe buat periode biar ga ngetik panjang panjang
export type ProgramPeriod = ProgramFormData["periods"][number];

// Fungsi buat ngitung total nilai dari array periode
export const sumPeriodValue = (
  // Data program
  prog: ProgramFormData,
  // Callback buat ambil nilai
  valueGetter: (per: ProgramPeriod) => number,
): number => {
  // Reducer buat totalin nilai periode
  return prog.periods.reduce((s, per) => s + valueGetter(per), 0);
};

// Fungsi buat ngurutin dan motong array program sesuai nilai kalkulasi
export const sortAndSlicePrograms = (
  // Data list program
  programs: ProgramFormData[],
  // Callback buat ambil nilai sortir
  valueGetter: (per: ProgramPeriod) => number,
  // Boolean buat urutan turun
  isDesc: boolean = true,
  // Maksimal data yang diambil
  limit: number = 5,
): ProgramFormData[] => {
  // Copy array terus sortir berdasar nilai
  return (
    [...programs]
      // Fungsi sortir
      .sort((a, b) => {
        // Hitung total nilai a
        const valA = sumPeriodValue(a, valueGetter);
        // Hitung total nilai b
        const valB = sumPeriodValue(b, valueGetter);
        // Balikin hasil sortir
        return isDesc ? valB - valA : valA - valB;
      })
      // Potong array
      .slice(0, limit)
  );
};

// Fungsi buat ngerakit dataset bar chart standar
export const createBarDataset = (
  // Label buat dataset
  label: string,
  // Array data angka
  data: (number | null)[],
  // Warna background bar
  backgroundColor: string | string[],
  // Minimal panjang bar
  minBarLength: number = 15,
) => ({
  // Properti label
  label,
  // Properti data
  data,
  // Properti warna
  backgroundColor,
  // Properti panjang bar
  minBarLength,
});

// Fungsi buat bikin data chart bar satu dataset otomatis biar ga ribet
export const generateBarChartData = (
  // List program
  programs: ProgramFormData[],
  // Fungsi ambil nilai
  valueGetter: (per: ProgramPeriod) => number,
  // Label chart
  label: string,
  // Warna chart
  color: string | string[],
  // Urutan turun
  isDesc: boolean = true,
  // Limit data
  limit: number = 5,
): ChartData<"bar", (number | null)[], unknown> => {
  // Panggil fungsi sortir
  const sorted = sortAndSlicePrograms(programs, valueGetter, isDesc, limit);

  // Balikin objek data siap pakai
  return {
    // Label buat sumbu x
    labels: sorted.map((p) => p.name),
    // List dataset
    datasets: [
      // Panggil fungsi create dataset
      createBarDataset(
        label,
        sorted.map((p) => sumPeriodValue(p, valueGetter)),
        color,
      ),
    ],
  };
};

// Fungsi buat bikin data chart bar dua dataset otomatis biar ga ribet
export const generateDoubleBarChartData = (
  // List program
  programs: ProgramFormData[],
  // Fungsi sort
  sortGetter: (per: ProgramPeriod) => number,
  // List getter tiap dataset
  getters: {
    // Fungsi ambil nilai
    getter: (per: ProgramPeriod) => number;
    // Label dataset
    label: string;
    // Warna dataset
    color: string | string[];
  }[],
  // Urutan turun
  isDesc: boolean = true,
  // Limit data
  limit: number = 5,
): ChartData<"bar", (number | null)[], unknown> => {
  // Sortir program
  const sorted = sortAndSlicePrograms(programs, sortGetter, isDesc, limit);

  // Balikin objek data multi dataset
  return {
    // Label sumbu x
    labels: sorted.map((p) => p.name),
    // Mapping dataset dari list getters
    datasets: getters.map((g) =>
      createBarDataset(
        g.label,
        sorted.map((p) => sumPeriodValue(p, g.getter)),
        g.color,
      ),
    ),
  };
};
