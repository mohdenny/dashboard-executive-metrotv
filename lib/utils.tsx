// Import tipe data buat classname dari clsx
import { type ClassValue, clsx } from "clsx";
// Import fungsi merge buat gabung class tailwind
import { twMerge } from "tailwind-merge";

// Fungsi buat ngegabungin class tailwind biar aman pas oper prop dan ga bentrok
export function cn(...inputs: ClassValue[]) {
  // Gabung class pake clsx terus bersihin pake twMerge
  return twMerge(clsx(inputs));
}
