"use client";

import { useUIStore } from "@/stores/ui-store";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Search, Menu, Moon, Sun } from "lucide-react";
import { Breadcrumb } from "./breadcrumb";

export function TopBar() {
  const collapsed = useUIStore((s) => s.sidebarCollapsed);
  const theme = useUIStore((s) => s.theme);
  const toggleTheme = useUIStore((s) => s.toggleTheme);
  const openCommandPalette = useUIStore((s) => s.openCommandPalette);
  const toggleMobileMenu = useUIStore((s) => s.toggleMobileMenu);
  const pathname = usePathname();

  return (
    <header
      className={cn(
        "sticky top-0 z-sticky h-16",
        "bg-canvas/80 backdrop-blur-md",
        "border-b border-stone/5",
        "px-4 sm:px-6 lg:px-8 flex items-center justify-between",
      )}
    >
      {/* Left: Mobile menu + Breadcrumb */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleMobileMenu}
          className="lg:hidden p-2 rounded-lg text-slate hover:bg-linen transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <Breadcrumb pathname={pathname} />
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Search trigger */}
        <button
          onClick={openCommandPalette}
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-stone hover:bg-linen transition-colors"
        >
          <Search className="w-4 h-4" />
          <span className="hidden sm:inline">Search...</span>
          <kbd className="hidden sm:inline text-xs bg-linen px-2 py-0.5 rounded text-stone">
            Cmd+K
          </kbd>
        </button>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl text-slate hover:bg-linen hover:text-ink transition-colors"
          aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
        >
          {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
}
