"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUIStore } from "@/stores/ui-store";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FolderKanban,
  Receipt,
  FileText,
  BarChart3,
  Users,
  Building2,
  Settings,
  ChevronLeft,
  Clock,
} from "lucide-react";
import { UserMenu } from "./user-menu";

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Projects",
    href: "/projects",
    icon: FolderKanban,
  },
  {
    label: "Expenses",
    href: "/expenses",
    icon: Receipt,
  },
  {
    label: "Invoices",
    href: "/invoices",
    icon: FileText,
  },
  {
    label: "AR Aging",
    href: "/ar-aging",
    icon: Clock,
  },
  {
    label: "Reports",
    href: "/reports",
    icon: BarChart3,
  },
  {
    label: "Vendors",
    href: "/vendors",
    icon: Building2,
  },
  {
    label: "Team",
    href: "/team",
    icon: Users,
  },
];

const bottomItems = [
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const collapsed = useUIStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 bottom-0 z-sticky",
        "bg-paper border-r border-stone/10",
        "flex flex-col transition-all duration-slow",
        "hidden lg:flex",
        collapsed ? "w-16" : "w-64",
      )}
    >
      {/* Logo */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-stone/5">
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="text-h3 text-ink font-display">CreativeFlow</span>
          </Link>
        )}
        <button
          onClick={toggleSidebar}
          className={cn(
            "p-2 rounded-lg text-stone hover:bg-linen hover:text-ink transition-colors",
            collapsed && "mx-auto",
          )}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronLeft
            className={cn(
              "w-4 h-4 transition-transform",
              collapsed && "rotate-180",
            )}
          />
        </button>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                isActive
                  ? "bg-terracotta-50 text-terracotta-700 border border-terracotta-100"
                  : "text-slate hover:bg-linen hover:text-ink",
                collapsed && "justify-center px-0",
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon
                className={cn(
                  "w-5 h-5 shrink-0",
                  isActive ? "text-terracotta-500" : "",
                )}
              />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Navigation */}
      <div className="px-2 py-2 space-y-1 border-t border-stone/5">
        {bottomItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                isActive
                  ? "bg-linen text-ink"
                  : "text-slate hover:bg-linen hover:text-ink",
                collapsed && "justify-center px-0",
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </div>

      {/* User Menu */}
      <div className="p-2 border-t border-stone/5">
        <UserMenu collapsed={collapsed} />
      </div>
    </aside>
  );
}
