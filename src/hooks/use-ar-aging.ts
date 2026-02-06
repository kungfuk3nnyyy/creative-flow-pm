"use client";

import { useQuery } from "@tanstack/react-query";
import type { AgingSummary } from "@/lib/financial/ar-aging";
import type { InvoiceStatus } from "@prisma/client";

interface AgingInvoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  balanceDueCents: number;
  totalCents: number;
  dueDate: string;
  status: InvoiceStatus;
  daysOverdue: number;
  project: { id: string; name: string };
}

interface ArAgingResponse {
  aging: AgingSummary;
  invoices: AgingInvoice[];
}

export function useArAging(projectId?: string) {
  return useQuery<ArAgingResponse>({
    queryKey: ["ar-aging", projectId],
    queryFn: async () => {
      const params = projectId ? `?projectId=${projectId}` : "";
      const res = await fetch(`/api/ar-aging${params}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to fetch AR aging.");
      }
      return res.json();
    },
    staleTime: 30 * 1000,
  });
}

export type { AgingInvoice };
