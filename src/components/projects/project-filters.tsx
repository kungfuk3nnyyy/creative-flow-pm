"use client";

import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { PROJECT_TYPE_LABELS, PROJECT_STATUS_LABELS } from "@/lib/validations/project";

interface ProjectFiltersProps {
  search: string;
  status: string;
  type: string;
  sortBy?: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onTypeChange: (value: string) => void;
  onSortChange?: (value: string) => void;
}

const SORT_OPTIONS = [
  { label: "Newest First", value: "createdAt:desc" },
  { label: "Oldest First", value: "createdAt:asc" },
  { label: "Recently Updated", value: "updatedAt:desc" },
  { label: "Name (A-Z)", value: "name:asc" },
  { label: "Name (Z-A)", value: "name:desc" },
  { label: "Status", value: "status:asc" },
];

export function ProjectFilters({
  search,
  status,
  type,
  sortBy,
  onSearchChange,
  onStatusChange,
  onTypeChange,
  onSortChange,
}: ProjectFiltersProps) {
  const hasFilters = search || status || type;

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone" />
        <input
          type="text"
          placeholder="Search projects..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className={cn(
            "w-full pl-10 pr-4 py-2.5 rounded-xl",
            "bg-paper border border-stone/20",
            "text-ink placeholder:text-stone text-sm",
            "focus:outline-none focus:border-terracotta-300 focus:ring-2 focus:ring-terracotta-100",
            "transition-all duration-150",
          )}
        />
      </div>

      <select
        value={status}
        onChange={(e) => onStatusChange(e.target.value)}
        className={cn(
          "px-4 py-2.5 rounded-xl",
          "bg-paper border border-stone/20",
          "text-sm",
          status ? "text-ink" : "text-stone",
          "focus:outline-none focus:border-terracotta-300 focus:ring-2 focus:ring-terracotta-100",
          "transition-all duration-150",
        )}
      >
        <option value="">All Statuses</option>
        {Object.entries(PROJECT_STATUS_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>

      <select
        value={type}
        onChange={(e) => onTypeChange(e.target.value)}
        className={cn(
          "px-4 py-2.5 rounded-xl",
          "bg-paper border border-stone/20",
          "text-sm",
          type ? "text-ink" : "text-stone",
          "focus:outline-none focus:border-terracotta-300 focus:ring-2 focus:ring-terracotta-100",
          "transition-all duration-150",
        )}
      >
        <option value="">All Types</option>
        {Object.entries(PROJECT_TYPE_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>

      {onSortChange && (
        <select
          value={sortBy ?? "createdAt:desc"}
          onChange={(e) => onSortChange(e.target.value)}
          className={cn(
            "px-4 py-2.5 rounded-xl",
            "bg-paper border border-stone/20",
            "text-sm text-ink",
            "focus:outline-none focus:border-terracotta-300 focus:ring-2 focus:ring-terracotta-100",
            "transition-all duration-150",
          )}
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      )}

      {hasFilters && (
        <button
          onClick={() => {
            onSearchChange("");
            onStatusChange("");
            onTypeChange("");
          }}
          className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm text-slate hover:text-ink hover:bg-linen transition-colors"
        >
          <X className="w-3.5 h-3.5" />
          Clear
        </button>
      )}
    </div>
  );
}
