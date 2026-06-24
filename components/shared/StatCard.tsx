import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import StatusBadge from "./Badge";

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
    <div
            className="flex flex-col relative overflow-hidden h-full bg-card color shadow-sm rounded-lg md:rounded-2xl pt-2 pr-3 pb-2 pl-3 md:p-6 "
            // className="flex flex-col relative overflow-hidden h-full bg-card shadow-sm rounded-2xl p-6"
          >
            {/* Animasi pulse */}
             <span className="absolute md:grid hidden top-4 right-4 flex h-3 w-3">
              <span
                className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${card.isPositive ? "bg-green-400" : "bg-red-400"}`}
              ></span>
              <span
                className={`relative inline-flex h-3 w-3 rounded-full ${card.isPositive ? "bg-green-500" : "bg-red-500"}`}
              ></span>
            </span>

          <div className="flex flex-col">
              <span className="text-md truncate md:text-2xl  font-weight-600 text-muted-foreground md:mb-1 pr-4">
                {card.title}
              </span>

            {/* <span className="text-2xl md:text-3xl font-bold text-muted-foreground mb-1">
              {card.value}
            </span> */}

          <div className="flex flex-row justify-between gap-2">
            <span className="text-2xl md:text-3xl font-bold text-muted-foreground mb-1">
              {card.value}
            </span>

            <div className="hidden md:inline">
              <StatusBadge status={card.isPositive}/>
            </div>
          </div>
          {/* <div className={`hidden md:flex items-center gap-1 mt-3 text-lg font-bold ${card.isPositive ? "text-green-600" : "text-red-500"}`}>
                <StatusBadge status={card.isPositive}/>
              </div> */}
          </div>
          
            <span className={` items-center gap-1 md:mt-1 text-sm md:font-bold ${card.isPositive ? "md:text-green-600 text-green-400" : "text-red-500"}`} >{card.label}</span>
          </div>
  );
}

      
/*

*/