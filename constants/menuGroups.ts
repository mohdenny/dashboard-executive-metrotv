import {
  House,
  BarChart2,
  GitCompare,
  Database,
  ShieldAlert,
  LineChart,
  BarChart3,
  X,
  LayoutDashboard,
} from "lucide-react";

export const menuGroups = [
  {
    group: "EXECUTIVE VIEW",
    items: [
      { name: "Dashboard", href: "/", icon: LayoutDashboard },
      // { name: "Finansial & Efisiensi", href: "/financial", icon: BarChart2 },
      // { name: "Operasional & Rating", href: "/operation", icon: LineChart },
    ],
  },
  {
    group: "ANALYTICS TOOLS",
    items: [
      { name: "Details", href: "/details", icon: BarChart3 },
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
