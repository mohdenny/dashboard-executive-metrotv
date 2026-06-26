import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Gabung class tailwind biar aman pas oper prop dan ga bentrok
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
