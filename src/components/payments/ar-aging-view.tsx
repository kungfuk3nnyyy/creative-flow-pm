"use client";

import { useArAging } from "@/hooks/use-ar-aging";
import { formatCents } from "@/lib/financial/budget";
import { INVOICE_STATUS_LABELS } from "@/lib/validations/invoice";
import { StatusBadge, getInvoiceStatusVariant } from "@/components/shared/status-badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/shared/spinner";
import { cn } from "@/lib/utils";

interface ArAgingViewProps {
  projectId?: string;
}

const BUCKET_BAR_COLORS = ["bg-success", "bg-info", "bg-warning", "bg-terracotta-500", "bg-error"];

const BUCKET_BORDER_COLORS = [
  "border-l-success",
  "border-l-info",
  "border-l-warning",
  "border-l-terracotta-500",
  "border-l-error",
];

export function ArAgingView({ projectId }: ArAgingViewProps) {
  const { data, isLoading } = useArAging(projectId);

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  const aging = data?.aging;
  const invoices = data?.invoices ?? [];

  if (!aging) {
    return null;
  }

  const totalOutstanding = aging.totalOutstandingCents as number;

  return (
    <div className="space-y-6">
      {/* Summary + Aging Buckets */}
      <Card>
        <CardContent className="pt-6">
          {/* Total Outstanding - prominent display */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
            <div>
              <p className="text-sm text-slate">Total Outstanding</p>
              <p className="text-2xl font-mono font-bold text-ink mt-1">
                {formatCents(totalOutstanding)}
              </p>
            </div>
            <p className="text-sm text-slate">
              {invoices.length} outstanding invoice{invoices.length !== 1 ? "s" : ""}
            </p>
          </div>

          {/* Stacked bar */}
          {totalOutstanding > 0 && (
            <div className="mb-6">
              <div className="flex h-8 rounded-xl overflow-hidden gap-0.5">
                {aging.buckets.map((bucket, i) => {
                  const pct =
                    totalOutstanding > 0
                      ? ((bucket.totalCents as number) / totalOutstanding) * 100
                      : 0;
                  if (pct === 0) return null;
                  return (
                    <div
                      key={bucket.label}
                      className={cn(
                        "transition-all flex items-center justify-center",
                        BUCKET_BAR_COLORS[i],
                      )}
                      style={{ width: `${Math.max(pct, 3)}%` }}
                      title={`${bucket.label}: ${formatCents(bucket.totalCents as number)} (${pct.toFixed(1)}%)`}
                    >
                      {pct > 15 && (
                        <span className="text-[10px] font-medium text-white/90">
                          {pct.toFixed(0)}%
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
              {/* Legend - always show all buckets for context */}
              <div className="flex items-center gap-4 mt-3 flex-wrap">
                {aging.buckets.map((bucket, i) => (
                  <div key={bucket.label} className="flex items-center gap-1.5">
                    <div className={cn("w-2.5 h-2.5 rounded-sm", BUCKET_BAR_COLORS[i])} />
                    <span
                      className={cn(
                        "text-xs",
                        (bucket.totalCents as number) > 0 ? "text-ink" : "text-stone",
                      )}
                    >
                      {bucket.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bucket cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {aging.buckets.map((bucket, i) => {
              const hasMoney = (bucket.totalCents as number) > 0;
              return (
                <div
                  key={bucket.label}
                  className={cn(
                    "rounded-xl p-4 border-l-4",
                    BUCKET_BORDER_COLORS[i],
                    hasMoney ? "bg-linen" : "bg-paper border border-stone/10 opacity-60",
                  )}
                >
                  <p className="text-xs font-medium text-slate">{bucket.label}</p>
                  <p
                    className={cn(
                      "text-base font-mono font-semibold mt-1",
                      hasMoney ? "text-ink" : "text-stone",
                    )}
                  >
                    {hasMoney ? formatCents(bucket.totalCents as number) : "--"}
                  </p>
                  <p className="text-xs text-stone mt-1">
                    {bucket.invoiceCount} invoice{bucket.invoiceCount !== 1 ? "s" : ""}
                  </p>
                  {hasMoney && totalOutstanding > 0 && (
                    <p className="text-xs text-slate mt-0.5 font-medium">
                      {(((bucket.totalCents as number) / totalOutstanding) * 100).toFixed(0)}% of
                      total
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Outstanding Invoices Detail */}
      {invoices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Outstanding Invoices</CardTitle>
            <span className="text-sm text-slate">
              {invoices.length} invoice{invoices.length !== 1 ? "s" : ""}
            </span>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-stone/10">
                    <th className="text-left text-label text-slate px-3 py-2 font-medium">
                      Invoice
                    </th>
                    <th className="text-left text-label text-slate px-3 py-2 font-medium">
                      Client
                    </th>
                    {!projectId && (
                      <th className="text-left text-label text-slate px-3 py-2 font-medium">
                        Project
                      </th>
                    )}
                    <th className="text-left text-label text-slate px-3 py-2 font-medium">
                      Due Date
                    </th>
                    <th className="text-right text-label text-slate px-3 py-2 font-medium">
                      Days Overdue
                    </th>
                    <th className="text-right text-label text-slate px-3 py-2 font-medium">
                      Balance
                    </th>
                    <th className="text-center text-label text-slate px-3 py-2 font-medium">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv) => (
                    <tr
                      key={inv.id}
                      className={cn(
                        "border-b border-stone/5 hover:bg-linen/50 transition-colors",
                        inv.daysOverdue > 90 && "bg-error-soft/20",
                        inv.daysOverdue > 60 && inv.daysOverdue <= 90 && "bg-terracotta-50/30",
                      )}
                    >
                      <td className="px-3 py-3 text-sm font-mono font-medium text-ink">
                        {inv.invoiceNumber}
                      </td>
                      <td className="px-3 py-3 text-sm text-slate">{inv.clientName}</td>
                      {!projectId && (
                        <td className="px-3 py-3 text-sm text-slate">{inv.project.name}</td>
                      )}
                      <td className="px-3 py-3 text-sm text-slate">
                        {new Date(inv.dueDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td
                        className={cn(
                          "px-3 py-3 text-sm text-right font-mono",
                          inv.daysOverdue > 0 ? "text-error font-medium" : "text-slate",
                        )}
                      >
                        {inv.daysOverdue > 0 ? inv.daysOverdue : "--"}
                      </td>
                      <td className="px-3 py-3 text-sm text-right font-mono font-medium text-ink">
                        {formatCents(inv.balanceDueCents)}
                      </td>
                      <td className="px-3 py-3 text-center">
                        <StatusBadge
                          label={INVOICE_STATUS_LABELS[inv.status] ?? inv.status}
                          variant={getInvoiceStatusVariant(inv.status)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
