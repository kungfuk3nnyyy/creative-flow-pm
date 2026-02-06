"use client";

import { useQuery } from "@tanstack/react-query";
import type { ExpenseStatus } from "@prisma/client";

interface ExpenseAttachment {
  id: string;
  name: string;
  mimeType: string;
  sizeBytes: number;
}

interface ExpenseItem {
  id: string;
  description: string;
  amountCents: number;
  date: string;
  status: ExpenseStatus;
  notes: string | null;
  rejectionReason: string | null;
  createdAt: string;
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
  attachments: ExpenseAttachment[];
}

interface ExpenseFilters {
  status?: ExpenseStatus;
  budgetCategoryId?: string;
  vendorId?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

interface ExpenseResponse {
  expenses: ExpenseItem[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export function useExpenses(projectId: string, filters: ExpenseFilters = {}) {
  return useQuery<ExpenseResponse>({
    queryKey: ["expenses", projectId, filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.status) params.set("status", filters.status);
      if (filters.budgetCategoryId) params.set("budgetCategoryId", filters.budgetCategoryId);
      if (filters.vendorId) params.set("vendorId", filters.vendorId);
      if (filters.search) params.set("search", filters.search);
      if (filters.page) params.set("page", String(filters.page));
      if (filters.pageSize) params.set("pageSize", String(filters.pageSize));

      const res = await fetch(
        `/api/projects/${projectId}/expenses?${params.toString()}`,
      );
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to fetch expenses.");
      }
      return res.json();
    },
    enabled: !!projectId,
    staleTime: 15 * 1000,
  });
}

export type { ExpenseItem, ExpenseAttachment, ExpenseFilters };
