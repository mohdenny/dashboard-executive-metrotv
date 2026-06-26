import React from "react";
import { cn } from "@/lib/utils";

interface CustomSelectProps {
  value: string;
  onChange: (val: string) => void;
  options: { label: string; value: string }[];
  placeholder?: string;
  className?: string;
  width?: string;
}

// Komponen dropdown custom biar dry
export default function CustomSelect({
  value,
  onChange,
  options,
  placeholder,
  className,
  width,
}: CustomSelectProps) {
  return (
    // Pake cn biar prop classname bisa nimpa class bawaan
    <div className={cn("relative inline-block", className)}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`appearance-none bg-card border border-border text-foreground text-sm font-medium rounded-full focus:ring-2 focus:ring-primary truncate focus:outline-none block pl-4 pr-10 py-0 h-10 cursor-pointer ${width === "fit" ? "w-fit" : "w-full"}`}
      >
        {placeholder && (
          <option value="" className="bg-card text-foreground" disabled hidden>
            {placeholder}
          </option>
        )}
        {options.map((opt, idx) => (
          <option
            key={idx}
            value={opt.value}
            className="bg-card text-foreground"
          >
            {opt.label}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-foreground/70">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-4 h-4"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 8.25l-7.5 7.5-7.5-7.5"
          />
        </svg>
      </div>
    </div>
  );
}
