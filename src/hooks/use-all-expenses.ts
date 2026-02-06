"use client";

import { useQuery } from "@tanstack/react-query";
import type { ExpenseStatus } from "@prisma/client";

interface AllExpenseItem {
  id: string;
  description: string;
  amountCents: number;
  date: string;
  status: ExpenseStatus;
  notes: string | null;
  rejectionReason: string | null;
  createdAt: string;
  project: {
    id: string;
    name: string;
  };
  submittedBy: {
    id: string;
    name: string | null;
    avatarUrl: string | null;
  };
  approvedBy: {
    id: string;
    name: string | null;
  } | null;
  budgetCategory: {
    id: string;
    name: string;
  } | null;
  vendor: {
    id: string;
    name: string;
  } | null;
  attachments: {
    id: string;
    name: string;
    mimeType: string;
    sizeBytes: number;
  }[];
}

interface AllExpenseFilters {
  status?: ExpenseStatus;
  projectId?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

interface AllExpenseResponse {
  expenses: AllExpenseItem[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export function useAllExpenses(filters: AllExpenseFilters = {}) {
  return useQuery<AllExpenseResponse>({
    queryKey: ["all-expenses", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.status) params.set("status", filters.status);
      if (filters.projectId) params.set("projectId", filters.projectId);
      if (filters.search) params.set("search", filters.search);
      if (filters.page) params.set("page", String(filters.page));
      if (filters.pageSize) params.set("pageSize", String(filters.pageSize));

      const res = await fetch(`/api/expenses?${params.toString()}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to fetch expenses.");
      }
      return res.json();
    },
    staleTime: 15 * 1000,
  });
}

export type { AllExpenseItem, AllExpenseFilters };
