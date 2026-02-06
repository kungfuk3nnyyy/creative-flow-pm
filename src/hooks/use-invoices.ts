"use client";

import { useQuery } from "@tanstack/react-query";
import type { InvoiceStatus, PaymentTerms } from "@prisma/client";

interface InvoiceLineItem {
  id: string;
  description: string;
  quantityThousandths: number;
  unitPriceCents: number;
  amountCents: number;
  sortOrder: number;
}

interface InvoiceItem {
  id: string;
  invoiceNumber: string;
  clientName: string;
  clientEmail: string | null;
  clientAddress: string | null;
  issueDate: string;
  dueDate: string;
  paymentTerms: PaymentTerms;
  status: InvoiceStatus;
  subtotalCents: number;
  taxRateBasisPoints: number;
  taxAmountCents: number;
  totalCents: number;
  balanceDueCents: number;
  notes: string | null;
  sentAt: string | null;
  createdAt: string;
  lineItems: InvoiceLineItem[];
  _count: { payments: number };
}

interface InvoiceFilters {
  status?: InvoiceStatus;
  search?: string;
  page?: number;
  pageSize?: number;
}

interface InvoiceResponse {
  invoices: InvoiceItem[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export function useInvoices(projectId: string, filters: InvoiceFilters = {}) {
  return useQuery<InvoiceResponse>({
    queryKey: ["invoices", projectId, filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.status) params.set("status", filters.status);
      if (filters.search) params.set("search", filters.search);
      if (filters.page) params.set("page", String(filters.page));
      if (filters.pageSize) params.set("pageSize", String(filters.pageSize));

      const res = await fetch(
        `/api/projects/${projectId}/invoices?${params.toString()}`,
      );
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to fetch invoices.");
      }
      return res.json();
    },
    enabled: !!projectId,
    staleTime: 30 * 1000,
  });
}

export type { InvoiceItem, InvoiceLineItem, InvoiceFilters };
