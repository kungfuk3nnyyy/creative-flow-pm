import { prisma } from "@/lib/prisma";
import { cents, type Cents } from "@/lib/financial/types";

export interface PnlLineItem {
  label: string;
  amountCents: Cents;
  children?: PnlLineItem[];
}

export interface PnlReport {
  periodStart: Date;
  periodEnd: Date;
  revenue: {
    invoicedCents: Cents;
    receivedCents: Cents;
    items: PnlLineItem[];
  };
  expenses: {
    totalCents: Cents;
    approvedCents: Cents;
    items: PnlLineItem[];
  };
  grossProfitCents: Cents;
  grossMarginBasisPoints: number;
  netProfitCents: Cents;
  netMarginBasisPoints: number;
}

/**
 * Generate a P&L report for an organization within a date range.
 * Supports both cash basis (payments received) and accrual basis (invoiced).
 */
export async function generatePnlReport(params: {
  organizationId: string;
  startDate: Date;
  endDate: Date;
  projectId?: string;
  basis: "cash" | "accrual";
}): Promise<PnlReport> {
  const { organizationId, startDate, endDate, projectId, basis } = params;

  const projectFilter = projectId ? { projectId } : {};

  // --- Revenue ---
  let invoicedCents = 0;
  let receivedCents = 0;
  const revenueByProject: Map<string, { name: string; cents: number }> = new Map();

  if (basis === "accrual") {
    // Accrual: count invoices issued in period
    const invoices = await prisma.invoice.findMany({
      where: {
        organizationId,
        deletedAt: null,
        issueDate: { gte: startDate, lte: endDate },
        status: { not: "DRAFT" },
        ...projectFilter,
      },
      select: {
        totalCents: true,
        project: { select: { id: true, name: true } },
      },
    });

    for (const inv of invoices) {
      invoicedCents += inv.totalCents;
      const key = inv.project.id;
      const existing = revenueByProject.get(key);
      if (existing) {
        existing.cents += inv.totalCents;
      } else {
        revenueByProject.set(key, { name: inv.project.name, cents: inv.totalCents });
      }
    }
  } else {
    // Cash: count payments received in period
    const payments = await prisma.payment.findMany({
      where: {
        paymentDate: { gte: startDate, lte: endDate },
        invoice: {
          organizationId,
          deletedAt: null,
          ...projectFilter,
        },
      },
      select: {
        amountCents: true,
        invoice: {
          select: {
            project: { select: { id: true, name: true } },
          },
        },
      },
    });

    for (const pay of payments) {
      receivedCents += pay.amountCents;
      const key = pay.invoice.project.id;
      const existing = revenueByProject.get(key);
      if (existing) {
        existing.cents += pay.amountCents;
      } else {
        revenueByProject.set(key, {
          name: pay.invoice.project.name,
          cents: pay.amountCents,
        });
      }
    }
  }

  // Also get total payments received for the invoiced period
  if (basis === "accrual") {
    const allPayments = await prisma.payment.findMany({
      where: {
        paymentDate: { gte: startDate, lte: endDate },
        invoice: {
          organizationId,
          deletedAt: null,
          ...projectFilter,
        },
      },
      select: { amountCents: true },
    });
    receivedCents = allPayments.reduce((sum, p) => sum + p.amountCents, 0);
  } else {
    // For cash basis, get invoiced total for context
    const allInvoices = await prisma.invoice.findMany({
      where: {
        organizationId,
        deletedAt: null,
        issueDate: { gte: startDate, lte: endDate },
        status: { not: "DRAFT" },
        ...projectFilter,
      },
      select: { totalCents: true },
    });
    invoicedCents = allInvoices.reduce((sum, i) => sum + i.totalCents, 0);
  }

  const revenueItems: PnlLineItem[] = Array.from(revenueByProject.values())
    .sort((a, b) => b.cents - a.cents)
    .map((item) => ({
      label: item.name,
      amountCents: cents(item.cents),
    }));

  const totalRevenue = basis === "accrual" ? invoicedCents : receivedCents;

  // --- Expenses ---
  const expenses = await prisma.expense.findMany({
    where: {
      organizationId,
      deletedAt: null,
      date: { gte: startDate, lte: endDate },
      status: "APPROVED",
      ...projectFilter,
    },
    select: {
      amountCents: true,
      budgetCategory: { select: { name: true } },
      project: { select: { id: true, name: true } },
    },
  });

  let totalExpenses = 0;
  const expenseByCategory: Map<string, number> = new Map();

  for (const exp of expenses) {
    totalExpenses += exp.amountCents;
    const cat = exp.budgetCategory?.name ?? "Uncategorized";
    expenseByCategory.set(cat, (expenseByCategory.get(cat) ?? 0) + exp.amountCents);
  }

  // Also count all statuses for context
  const allExpenses = await prisma.expense.findMany({
    where: {
      organizationId,
      deletedAt: null,
      date: { gte: startDate, lte: endDate },
      ...projectFilter,
    },
    select: { amountCents: true },
  });
  const totalAllExpenses = allExpenses.reduce((sum, e) => sum + e.amountCents, 0);

  const expenseItems: PnlLineItem[] = Array.from(expenseByCategory.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([name, amount]) => ({
      label: name,
      amountCents: cents(amount),
    }));

  // --- Profit ---
  const grossProfit = totalRevenue - totalExpenses;
  const grossMarginBp =
    totalRevenue > 0 ? Math.round((grossProfit / totalRevenue) * 10000) : 0;

  return {
    periodStart: startDate,
    periodEnd: endDate,
    revenue: {
      invoicedCents: cents(invoicedCents),
      receivedCents: cents(receivedCents),
      items: revenueItems,
    },
    expenses: {
      totalCents: cents(totalAllExpenses),
      approvedCents: cents(totalExpenses),
      items: expenseItems,
    },
    grossProfitCents: cents(grossProfit),
    grossMarginBasisPoints: grossMarginBp,
    netProfitCents: cents(grossProfit),
    netMarginBasisPoints: grossMarginBp,
  };
}
