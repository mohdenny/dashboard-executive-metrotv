import {
  House,
  BarChart2,
  GitCompare,
  Database,
  ShieldAlert,
  LineChart,
  FileText,
  X,
} from "lucide-react";

export const menuGroups = [
  {
    group: "EXECUTIVE VIEW",
    items: [
      { name: "Dashboard", href: "/", icon: House },
      // { name: "Finansial & Efisiensi", href: "/financial", icon: BarChart2 },
      // { name: "Operasional & Rating", href: "/operation", icon: LineChart },
    ],
  },
  {
    group: "ANALYTICS TOOLS",
    items: [
      { name: "Detail", href: "/detail", icon: FileText },
      { name: "Compare", href: "/compare", icon: GitCompare },
    ],
  },
  {
    group: "MASTER DATA",
    items: [
      // { name: "Master Data", href: "/master-program", icon: Database },
      // {
      //   name: "Target & Realisasi",
      //   href: "/master-realisasi",
      //   icon: ShieldAlert,
      // },
    ],
  },
];
