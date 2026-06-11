import {
  LayoutDashboard,
  Activity,
  GitCompare,
  Database,
  ShieldAlert,
  TrendingUp,
  X,
} from "lucide-react";

export const menuGroups = [
  {
    group: "EXECUTIVE VIEW",
    items: [
      { name: "Dashboard", href: "/", icon: LayoutDashboard },
      { name: "Finansial & Efisiensi", href: "/financial", icon: TrendingUp },
      { name: "Operasional & Rating", href: "/operation", icon: Activity },
    ],
  },
  {
    group: "ANALYTICS TOOLS",
    items: [{ name: "Compare Program", href: "/compare", icon: GitCompare }],
  },
  {
    group: "MASTER DATA",
    items: [
      { name: "Data Program", href: "/master-program", icon: Database },
      {
        name: "Target & Realisasi",
        href: "/master-realisasi",
        icon: ShieldAlert,
      },
    ],
  },
];
