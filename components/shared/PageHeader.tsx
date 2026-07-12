import React from "react";
// Import tipe icon dari lucide react
import { LucideIcon } from "lucide-react";

// Interface buat nangkep props komponen judul
interface PageHeaderProps {
  // Icon yang nampil di box kiri
  icon: LucideIcon;
  // Teks judul utama page
  title: string;
  // Teks deskripsi kecil di bawah
  description: string;
  // Tambahan prop buat nyelipin elemen di kanan (misal tombol donlod)
  rightContent?: React.ReactNode;
}

// Komponen page header biar bisa dipake berulang
export default function PageHeader({
  icon: Icon,
  title,
  description,
  rightContent,
}: PageHeaderProps) {
  // Render komponen utuh
  return (
    // Flex container buat nyesuain tata letak biar tulisan di kiri tombol di kanan
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
      {/* Kontainer sisi kiri */}
      <div className="flex items-center gap-4">
        {/* Box buat nampilin icon */}
        <div className="p-3 bg-secondary text-secondary-foreground rounded-2xl shadow-sm">
          {/* Panggil iconnya */}
          <Icon size={28} />
        </div>
        {/* Box buat nampilin teks */}
        <div>
          {/* Teks judul gede */}
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {title}
          </h1>
          {/* Teks deskripsi pembantu */}
          <p className="text-sm text-muted-foreground mt-1 font-medium">
            {description}
          </p>
        </div>
      </div>
      {/* Render area kanan kalo beneran disuplai propsnya */}
      {rightContent && (
        <div className="flex-shrink-0 w-full sm:w-auto">{rightContent}</div>
      )}
    </div>
  );
}
