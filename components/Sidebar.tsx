"use client";

import {
  LayoutDashboard,
  LogOut,
  ShieldAlert,
  TrendingUp,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { setSidebarOpen } from "@/store/slices/uiSlice";

export default function Sidebar() {
  // Buat baca url yang lagi diakses
  const pathname = usePathname();
  const dispatch = useDispatch();
  const isOpen = useSelector((state: RootState) => state.ui.isSidebarOpen);

  const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Analytics", href: "/analytics", icon: TrendingUp },
    { name: "Compliance", href: "/risk", icon: ShieldAlert },
  ];

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={() => dispatch(setSidebarOpen(false))}
        />
      )}
      <aside
        className={`border-2 border-cyan-600 fixed inset-y-0 left-0 w-[280px] bg-background md:bg-transparent md:border-r-0 border-r border-border p-4 flex flex-col justify-between z-50 transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="border-2 border-red-600 flex flex-col flex-1 ">
          {/* Logo */}
          <div className="border-2 border-yellow-600 flex items-center justify-between px-4 h-14 mb-6">
            <div className="border-2 border-cyan-600 flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shadow-md">
                E
              </div>
              <span className="text-base font-bold text-foreground">
                Dashboard
                <span className="font-normal text-muted-foreground">
                  Executive
                </span>
              </span>
            </div>
            <button
              onClick={() => dispatch(setSidebarOpen(false))}
              className="p-2 text-muted-foreground hover:bg-muted rounded-full md:hidden"
            >
              <X size={20} />
            </button>
          </div>

          {/* Nav Drawer */}
          <nav className="space-y-1 flex-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => dispatch(setSidebarOpen(false))}
                  className={`flex items-center gap-4 px-4 h-14 rounded-full text-sm font-medium transition-all ${
                    isActive
                      ? "bg-secondary text-secondary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="mt-auto pt-4 border-t border-border/50 border-2 border-red-700">
            <button
              onClick={() => console.log("Proses Logout...")}
              className="w-full flex items-center gap-4 px-4 h-14 rounded-full text-sm font-medium text-destructive hover:bg-destructive/10 cursor-pointer transition-colors"
            >
              <LogOut size={24} strokeWidth={2} />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
