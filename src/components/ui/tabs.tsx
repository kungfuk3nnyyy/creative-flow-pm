"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface Tab {
  label: string;
  href: string;
  count?: number;
}

interface TabsProps {
  tabs: Tab[];
  className?: string;
}

export function Tabs({ tabs, className }: TabsProps) {
  const pathname = usePathname();

  return (
    <div
      className={cn(
        "border-b border-stone/10",
        className,
      )}
      role="tablist"
    >
      <nav className="flex gap-0 -mb-px">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              role="tab"
              aria-selected={isActive}
              className={cn(
                "px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                isActive
                  ? "border-terracotta-400 text-ink"
                  : "border-transparent text-slate hover:text-ink hover:border-stone/20",
              )}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span
                  className={cn(
                    "ml-2 inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs",
                    isActive
                      ? "bg-terracotta-50 text-terracotta-600"
                      : "bg-parchment text-slate",
                  )}
                >
                  {tab.count}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
