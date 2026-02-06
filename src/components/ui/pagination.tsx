"use client";

import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  perPage: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, total, perPage, onPageChange }: PaginationProps) {
  const start = (page - 1) * perPage + 1;
  const end = Math.min(page * perPage, total);

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-1 py-3">
      <p className="text-sm text-slate">
        {start}-{end} of {total}
      </p>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className={cn(
            "p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-sm transition-colors",
            page <= 1
              ? "text-stone/40 cursor-not-allowed"
              : "text-slate hover:bg-linen hover:text-ink",
          )}
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {generatePageNumbers(page, totalPages).map((p, i) =>
          p === null ? (
            <span key={`ellipsis-${i}`} className="px-1 text-stone">
              ...
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={cn(
                "w-10 h-10 sm:w-9 sm:h-9 rounded-lg text-sm font-medium transition-colors",
                p === page ? "bg-ink text-paper" : "text-slate hover:bg-linen hover:text-ink",
              )}
              aria-current={p === page ? "page" : undefined}
            >
              {p}
            </button>
          ),
        )}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className={cn(
            "p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-sm transition-colors",
            page >= totalPages
              ? "text-stone/40 cursor-not-allowed"
              : "text-slate hover:bg-linen hover:text-ink",
          )}
          aria-label="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function generatePageNumbers(current: number, total: number): (number | null)[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | null)[] = [1];

  if (current > 3) {
    pages.push(null);
  }

  const rangeStart = Math.max(2, current - 1);
  const rangeEnd = Math.min(total - 1, current + 1);

  for (let i = rangeStart; i <= rangeEnd; i++) {
    pages.push(i);
  }

  if (current < total - 2) {
    pages.push(null);
  }

  pages.push(total);

  return pages;
}
