import { ArrowDownRight, ArrowUpRight } from "lucide-react";

type Card = {
  title: string;
  value: string;
  isPositive: boolean;
  label: string;
};

interface StatCardProps {
  card: Card;
}

export default function StatCard({ card }: StatCardProps) {
  return (
    <div className="flex flex-col relative overflow-hidden h-full bg-card shadow-sm rounded-2xl p-6">
      {/* Animasi pulse */}
      <span className="absolute top-4 right-4 flex h-3 w-3">
        <span
          className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${card.isPositive ? "bg-green-400" : "bg-red-400"}`}
        ></span>
        <span
          className={`relative inline-flex h-3 w-3 rounded-full ${card.isPositive ? "bg-green-500" : "bg-red-500"}`}
        ></span>
      </span>

      <span className="text-xl font-bold text-muted-foreground mb-1 pr-4">
        {card.title}
      </span>
      <span className="text-2xl font-bold text-muted-foreground mb-1">
        {card.value}
      </span>

      <div
        className={`flex items-center gap-1 mt-3 text-lg font-bold ${card.isPositive ? "text-green-600" : "text-red-500"}`}
      >
        {card.isPositive ? (
          <ArrowUpRight size={18} />
        ) : (
          <ArrowDownRight size={18} />
        )}
        <span>{card.label}</span>
      </div>
    </div>
  );
}
