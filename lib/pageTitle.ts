import { LucideIcon } from "lucide-react";

// Tipe item menu
export interface MenuItem {
  name: string;
  href: string;
  icon: LucideIcon;
}

// Tipe menu group
export interface MenuGroup {
  group: string;
  items: MenuItem[];
}

// Fungsi untuk title page dinamis
export function getTitleFromMenu(
  pathname: string,
  menuGroups: MenuGroup[],
): string {
  const allMenuItems: MenuItem[] = menuGroups.flatMap((group) => group.items);

  const matchedMenu = allMenuItems.find((item) => item.href === pathname);

  if (matchedMenu) {
    return matchedMenu.name;
  }

  return pathname
    .slice(1)
    .split("/")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
