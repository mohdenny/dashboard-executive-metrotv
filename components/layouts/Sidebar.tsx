"use client";

import { Ellipsis, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getTitleFromMenu, MenuGroup } from "@/lib/pageTitle";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { setSidebarOpen, toggleSidebar } from "@/store/slices/uiSlice";
import { menuGroups } from "@/constants/menuGroups";
import Image from "next/image";

export default function Sidebar(): React.JSX.Element {
  // Buat baca url yang lagi diakses
  const pathname = usePathname() || "/";
  const dispatch = useDispatch();
  const isOpen = useSelector((state: RootState) => state.ui.isSidebarOpen);

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={() => dispatch(setSidebarOpen(false))}
        />
      )}
      <aside
        className={`border-2 border-cyan-600 fixed inset-y-0 left-0 w-[280px] bg-background md:border-r-0 border-r border-border p-4 flex flex-col justify-between z-50 transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="border-2 border-red-600 flex flex-col flex-1 overflow-y-auto custom-scrollbar">
          {/* Logo */}
          <div className="border-2 border-yellow-600 flex items-center justify-between px-4 h-14 mb-6 shrink-0">
            <div className="border-2 border-cyan-600 flex items-center gap-1.5 text-xl text-foreground">
              {/* <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shadow-md">
                E
              </div> */}
              {/* <button
                onClick={() => dispatch(toggleSidebar())}
                className="p-3 text-foreground hidden md:block hover:bg-muted rounded-full transition-colors cursor-pointer"
              >
                <Menu size={24} />
              </button> */}
              <Image
                src="/logo-metrotv.png"
                alt="MTI Logo"
                width={32}
                height={32}
                className="w-8 h-8 shrink-0 object-contain"
              />
              <span className="font-bold">MTV</span>
              <span className="font-normal text-muted-foreground">
                Executive
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
          <div className="space-y-6 flex-1">
            {menuGroups.map((group, idx) => (
              <div key={idx} className="space-y-1">
                <h4 className="px-5 text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                  {group.group}
                </h4>
                <nav className="space-y-1">
                  {group.items.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => dispatch(setSidebarOpen(false))}
                        className={`flex items-center gap-4 px-4 h-14 rounded-full text-sm transition-all ${
                          isActive
                            ? "font-bold text-secondary-foreground"
                            : "text-muted-foreground font-medium hover:bg-secondary hover:text-foreground"
                        }`}
                      >
                        <item.icon
                          size={24}
                          strokeWidth={2}
                          fill={isActive ? "currentColor" : "none"}
                        />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>
            ))}
          </div>

          {/* Logout */}
          {/* <div className="mt-auto pt-4 border-t border-border/50 border-2 border-red-700">
            <button
              onClick={() => console.log("Proses Logout...")}
              className="w-full flex items-center gap-4 px-4 h-14 rounded-full text-sm font-medium text-destructive hover:bg-destructive/10 cursor-pointer transition-colors"
            >
              <LogOut size={24} strokeWidth={2} />
              <span>Keluar</span>
            </button>
          </div> */}

          <div className="mt-auto pt-4 border-t border-border/50 border-2 border-cyan-700">
            <button
              onClick={() => {}}
              className="border w-full flex items-center gap-2 px-4 h-14 rounded-full text-sm font-medium hover:bg-secondary hover:text-foreground cursor-pointer group transition-all"
            >
              <div className="h-10 w-10 rounded-full bg-secondary text-secondary-foreground border border-border flex items-center justify-center font-bold shadow-md ">
                M
              </div>
              <div className="border border-b-blue-700 h-full flex flex-col justify-center">
                <p className="border border-b-blue-700 truncate">
                  Mohammad Denny
                </p>
                <p className="border border-b-blue-700 truncate">1163353</p>
              </div>
              <Ellipsis
                size={24}
                className="border border-b-blue-700 text-muted-foreground group-hover:text-foreground hidden lg:block"
              />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
