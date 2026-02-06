import type { LucideIcon } from "lucide-react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

type TrendDirection = "up" | "down" | "warning" | "neutral";

interface KPICardProps {
  label: string;
  value: string;
  change: string;
  trend: TrendDirection;
  icon: LucideIcon;
}

const trendColors: Record<TrendDirection, string> = {
  up: "text-success",
  down: "text-error",
  warning: "text-warning",
  neutral: "text-slate",
};

export function KPICard({ label, value, change, trend, icon: Icon }: KPICardProps) {
  return (
    <div className="bg-paper rounded-2xl p-6 border border-stone/10 shadow-sm">
      <div className="flex items-start justify-between">
        <span className="text-label text-slate">{label}</span>
        <div className="p-2 bg-linen rounded-lg">
          <Icon className="w-4 h-4 text-slate" />
        </div>
      </div>

      <div className="mt-4">
        <span className="text-currency-lg text-ink">{value}</span>
      </div>

      <div className={cn("mt-2 text-caption flex items-center gap-1", trendColors[trend])}>
        {trend === "up" && <TrendingUp className="w-3 h-3" />}
        {trend === "down" && <TrendingDown className="w-3 h-3" />}
        {change}
      </div>
    </div>
  );
}

export function KPICardSkeleton() {
  return (
    <div className="bg-paper rounded-2xl p-6 border border-stone/10">
      <div className="flex items-start justify-between">
        <div className="w-24 h-3 rounded skeleton" />
        <div className="w-8 h-8 rounded-lg skeleton" />
      </div>
      <div className="mt-4">
        <div className="w-32 h-7 rounded skeleton" />
      </div>
      <div className="mt-3">
        <div className="w-20 h-3 rounded skeleton" />
      </div>
    </div>
  );
}
