import type { Cents } from "./types";
import { cents } from "./types";

export interface AgingBucket {
  label: string;
  minDays: number;
  maxDays: number | null;
  totalCents: Cents;
  invoiceCount: number;
}

export interface AgingSummary {
  buckets: AgingBucket[];
  totalOutstandingCents: Cents;
  totalOverdueCount: number;
}

/**
 * Calculate AR aging buckets from a list of outstanding invoices.
 * Buckets: Current (not yet due), 1-30 days, 31-60 days, 61-90 days, 90+ days.
 */
export function calculateAgingBuckets(
  invoices: {
    balanceDueCents: number;
    dueDate: Date;
    status: string;
  }[],
  asOfDate: Date = new Date(),
): AgingSummary {
  const buckets: AgingBucket[] = [
    { label: "Current", minDays: -Infinity, maxDays: 0, totalCents: cents(0), invoiceCount: 0 },
    { label: "1-30 days", minDays: 1, maxDays: 30, totalCents: cents(0), invoiceCount: 0 },
    { label: "31-60 days", minDays: 31, maxDays: 60, totalCents: cents(0), invoiceCount: 0 },
    { label: "61-90 days", minDays: 61, maxDays: 90, totalCents: cents(0), invoiceCount: 0 },
    { label: "90+ days", minDays: 91, maxDays: null, totalCents: cents(0), invoiceCount: 0 },
  ];

  let totalOutstanding = 0;
  let totalOverdue = 0;

  for (const inv of invoices) {
    if (inv.balanceDueCents <= 0) continue;

    const dueDate = new Date(inv.dueDate);
    const diffMs = asOfDate.getTime() - dueDate.getTime();
    const daysOverdue = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    totalOutstanding += inv.balanceDueCents;

    for (const bucket of buckets) {
      const inMin = daysOverdue >= bucket.minDays;
      const inMax = bucket.maxDays === null || daysOverdue <= bucket.maxDays;

      if (inMin && inMax) {
        bucket.totalCents = cents((bucket.totalCents as number) + inv.balanceDueCents);
        bucket.invoiceCount++;
        if (daysOverdue > 0) totalOverdue++;
        break;
      }
    }
  }

  return {
    buckets,
    totalOutstandingCents: cents(totalOutstanding),
    totalOverdueCount: totalOverdue,
  };
}

/**
 * Determine which invoices should be marked as overdue.
 * An invoice is overdue if:
 * - Status is SENT or VIEWED or PARTIALLY_PAID
 * - Due date has passed
 */
export function findOverdueInvoices(
  invoices: {
    id: string;
    status: string;
    dueDate: Date;
    balanceDueCents: number;
  }[],
  asOfDate: Date = new Date(),
): string[] {
  return invoices
    .filter((inv) => {
      const isEligible = ["SENT", "VIEWED", "PARTIALLY_PAID"].includes(inv.status);
      const isPastDue = new Date(inv.dueDate) < asOfDate;
      const hasBalance = inv.balanceDueCents > 0;
      return isEligible && isPastDue && hasBalance;
    })
    .map((inv) => inv.id);
}
