"use client";

import { useQuery } from "@tanstack/react-query";
import type { InvoiceStatus } from "@prisma/client";

interface PaymentItem {
  id: string;
  amountCents: number;
  paymentDate: string;
  paymentMethod: string | null;
  reference: string | null;
  notes: string | null;
  createdAt: string;
  invoice: {
    id: string;
    invoiceNumber: string;
    clientName: string;
    totalCents: number;
    balanceDueCents: number;
    status: InvoiceStatus;
  };
}

interface PaymentResponse {
  payments: PaymentItem[];
  summary: {
    totalReceived: number;
    paymentCount: number;
  };
}

export function usePayments(projectId: string) {
  return useQuery<PaymentResponse>({
    queryKey: ["payments", projectId],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${projectId}/payments`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to fetch payments.");
      }
      return res.json();
    },
    enabled: !!projectId,
    staleTime: 15 * 1000,
  });
}

export type { PaymentItem };
