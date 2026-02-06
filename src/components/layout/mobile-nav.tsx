"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUIStore } from "@/stores/ui-store";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import {
  LayoutDashboard,
  FolderKanban,
  Receipt,
  FileText,
  BarChart3,
  Users,
  Building2,
  Settings,
  Clock,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Projects", href: "/projects", icon: FolderKanban },
  { label: "Expenses", href: "/expenses", icon: Receipt },
  { label: "Invoices", href: "/invoices", icon: FileText },
  { label: "AR Aging", href: "/ar-aging", icon: Clock },
  { label: "Reports", href: "/reports", icon: BarChart3 },
  { label: "Vendors", href: "/vendors", icon: Building2 },
  { label: "Team", href: "/team", icon: Users },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function MobileNav() {
  const pathname = usePathname();
  const open = useUIStore((s) => s.mobileMenuOpen);
  const close = useUIStore((s) => s.closeMobileMenu);

  // Close on route change
  useEffect(() => {
    close();
  }, [pathname, close]);

  // Prevent body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
        onClick={close}
        aria-hidden="true"
      />

      {/* Drawer */}
      <nav
        className="absolute left-0 top-0 bottom-0 w-72 bg-paper border-r border-stone/10 flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        {/* Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-stone/5">
          <span className="text-h3 text-ink font-display">CreativeFlow</span>
          <button
            onClick={close}
            className="p-2 rounded-lg text-stone hover:bg-linen hover:text-ink transition-colors"
            aria-label="Close navigation menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Links */}
        <div className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                  isActive
                    ? "bg-terracotta-50 text-terracotta-700 border border-terracotta-100"
                    : "text-slate hover:bg-linen hover:text-ink",
                )}
              >
                <item.icon
                  className={cn("w-5 h-5 shrink-0", isActive ? "text-terracotta-500" : "")}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
