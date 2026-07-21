'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  GitCompare,
  FileText,
  LucideIcon,
  Database,
  Table2
} from 'lucide-react';

interface NavItemData {
  name: string;
  href: string;
  icon: LucideIcon;
}

const NavItem = ({
  item,
  isActive,
}: {
  item: NavItemData;
  isActive: boolean;
}) => (
  <Link
    href={item.href}
    className="flex-1 flex flex-col items-center justify-center h-full group"
  >
    <div className="relative flex flex-col items-center">
      <div className="relative flex items-center justify-center w-16 h-8 mb-1">
        <div
          className={`absolute inset-0 rounded-full transition-all duration-200 ${isActive ? 'bg-secondary opacity-100 scale-100' : 'opacity-0 scale-50'}`}
        />
        <item.icon
          size={24}
          strokeWidth={isActive ? 2.5 : 2}
          className={`relative z-10 transition-colors duration-200 ${isActive ? 'text-secondary-foreground' : 'text-muted-foreground group-hover:text-foreground'}`}
        />
      </div>
      {/* Label */}
      <span
        className={`text-[11px] transition-colors duration-200 ${isActive ? 'font-bold text-foreground' : 'font-medium text-muted-foreground'}`}
      >
        {item.name}
      </span>
    </div>
  </Link>
);

export default function BottomNav() {
  const pathname = usePathname();
  if (pathname === '/login') return null;

  const items: NavItemData[] = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Detail', href: '/details', icon: FileText },
    { name: 'Bandingkan', href: '/compare', icon: GitCompare,},
    { name: 'Master', href: '/master-program', icon: Database,},
    // { name: 'Master', href: '/master-program', icon: Table2 },
  ];

  return (
    // Hidden ketika mode tab-dekstop (md:hidden)
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-background border-t border-border flex justify-around items-center z-0 px-2 pb-safe transition-colors duration-200">
      {items.map((item) => (
        <NavItem
          key={item.name}
          item={item}
          isActive={
            pathname === item.href ||
            (pathname.startsWith(item.href) && item.href !== '/')
          }
        />
      ))}
    </nav>
  );
}
