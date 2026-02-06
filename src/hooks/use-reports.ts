"use client";

import { useQuery } from "@tanstack/react-query";
import type { PnlReport } from "@/lib/services/pnl.service";
import type { ProjectProfitability } from "@/lib/services/profitability.service";

// --- P&L ---

interface PnlFilters {
  startDate: string;
  endDate: string;
  basis: "cash" | "accrual";
  projectId?: string;
}

interface PnlResponse {
  report: PnlReport;
}

export function usePnlReport(filters: PnlFilters) {
  return useQuery<PnlResponse>({
    queryKey: ["pnl", filters],
    queryFn: async () => {
      const params = new URLSearchParams({
        startDate: filters.startDate,
        endDate: filters.endDate,
        basis: filters.basis,
      });
      if (filters.projectId) params.set("projectId", filters.projectId);

      const res = await fetch(`/api/reports/pnl?${params.toString()}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to fetch P&L report.");
      }
      return res.json();
    },
    staleTime: 60 * 1000,
  });
}

// --- Profitability ---

interface ProfitabilitySummary {
  totalInvoicedCents: number;
  totalReceivedCents: number;
  totalExpensesCents: number;
  totalProfitCents: number;
  projectCount: number;
  avgMarginBasisPoints: number;
}

interface ProfitabilityResponse {
  projects: ProjectProfitability[];
  summary: ProfitabilitySummary;
}

export function useProfitability(projectId?: string) {
  return useQuery<ProfitabilityResponse>({
    queryKey: ["profitability", projectId],
    queryFn: async () => {
      const params = projectId ? `?projectId=${projectId}` : "";
      const res = await fetch(`/api/reports/profitability${params}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to fetch profitability data.");
      }
      return res.json();
    },
    staleTime: 60 * 1000,
  });
}

export type { PnlFilters, ProfitabilitySummary };
