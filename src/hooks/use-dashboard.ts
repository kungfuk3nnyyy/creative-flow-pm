"use client";

import { useQuery } from "@tanstack/react-query";

interface DashboardKPIs {
  totalProjects: number;
  activeProjects: number;
  invoicedThisMonth: number;
  invoicedLastMonth: number;
  invoiceTrendBasisPoints: number;
  expensesThisMonth: number;
  expensesLastMonth: number;
  expenseTrendBasisPoints: number;
  receivedThisMonth: number;
  paymentsCount: number;
  totalOverdue: number;
  overdueCount: number;
  pendingApprovals: number;
  teamSize: number;
}

interface ActiveProject {
  id: string;
  name: string;
  type: string;
  clientName: string | null;
  updatedAt: string;
  _count: { milestones: number; expenses: number; invoices: number };
}

interface OverdueInvoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  balanceDueCents: number;
  dueDate: string;
}

interface ActivityEntry {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  createdAt: string;
  user: { name: string | null };
  project: { name: string | null } | null;
}

interface PendingExpense {
  id: string;
  description: string;
  amountCents: number;
  project: { id: string; name: string };
  submittedBy: { name: string };
}

interface StaleDraftInvoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  totalCents: number;
  project: { id: string; name: string };
}

interface OverdueTask {
  id: string;
  title: string;
  dueDate: string;
  milestone: { project: { id: string; name: string } };
}

interface NeedsAttention {
  pendingApprovalExpenses: PendingExpense[];
  staleDraftInvoices: StaleDraftInvoice[];
  overdueTasks: OverdueTask[];
}

interface DashboardResponse {
  kpis: DashboardKPIs;
  activeProjects: ActiveProject[];
  overdueInvoices: OverdueInvoice[];
  recentActivity: ActivityEntry[];
  needsAttention: NeedsAttention;
}

export function useDashboard() {
  return useQuery<DashboardResponse>({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const res = await fetch("/api/reports/dashboard");
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to fetch dashboard.");
      }
      return res.json();
    },
    staleTime: 60 * 1000,
    refetchOnWindowFocus: true,
  });
}

export type {
  DashboardKPIs,
  ActiveProject,
  OverdueInvoice,
  ActivityEntry,
  NeedsAttention,
  PendingExpense,
  StaleDraftInvoice,
  OverdueTask,
};
