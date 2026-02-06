"use client";

import { useQuery } from "@tanstack/react-query";
import type { InvoiceStatus, PaymentTerms } from "@prisma/client";

interface AllInvoiceLineItem {
  id: string;
  description: string;
  quantityThousandths: number;
  unitPriceCents: number;
  amountCents: number;
  sortOrder: number;
}

interface AllInvoiceItem {
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
  project: {
    id: string;
    name: string;
  };
  lineItems: AllInvoiceLineItem[];
  _count: { payments: number };
}

interface AllInvoiceFilters {
  status?: InvoiceStatus;
  projectId?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

interface AllInvoiceResponse {
  invoices: AllInvoiceItem[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export function useAllInvoices(filters: AllInvoiceFilters = {}) {
  return useQuery<AllInvoiceResponse>({
    queryKey: ["all-invoices", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.status) params.set("status", filters.status);
      if (filters.projectId) params.set("projectId", filters.projectId);
      if (filters.search) params.set("search", filters.search);
      if (filters.page) params.set("page", String(filters.page));
      if (filters.pageSize) params.set("pageSize", String(filters.pageSize));

      const res = await fetch(`/api/invoices?${params.toString()}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to fetch invoices.");
      }
      return res.json();
    },
    staleTime: 30 * 1000,
  });
}

export type { AllInvoiceItem, AllInvoiceLineItem, AllInvoiceFilters };
