"use client";

import { useQuery } from "@tanstack/react-query";

interface BudgetCategory {
  id: string;
  name: string;
  allocatedCents: number;
  sortOrder: number;
  spentCents: number;
  remainingCents: number;
  isOverBudget: boolean;
  expenseCount: number;
}

interface BudgetData {
  id: string;
  totalAmountCents: number;
  notes: string | null;
  approvedAt: string | null;
  categories: BudgetCategory[];
  summary: {
    totalAllocated: number;
    totalUnallocated: number;
    totalSpent: number;
    totalRemaining: number;
  };
}

interface BudgetResponse {
  budget: BudgetData | null;
}

export function useBudget(projectId: string) {
  return useQuery<BudgetResponse>({
    queryKey: ["budget", projectId],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${projectId}/budget`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to fetch budget.");
      }
      return res.json();
    },
    enabled: !!projectId,
    staleTime: 10 * 1000,
  });
}

export type { BudgetData, BudgetCategory };
