"use client";

import { useArAging, type AgingInvoice } from "@/hooks/use-ar-aging";
import { formatCents } from "@/lib/financial/budget";
import { INVOICE_STATUS_LABELS } from "@/lib/validations/invoice";
import { StatusBadge, getInvoiceStatusVariant } from "@/components/shared/status-badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/shared/spinner";
import { cn } from "@/lib/utils";

interface ArAgingViewProps {
  projectId?: string;
}

const BUCKET_COLORS = [
  "bg-success-soft text-success",
  "bg-info-soft text-info",
  "bg-warning-soft text-warning",
  "bg-error-soft/60 text-error",
  "bg-error-soft text-error",
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
      {/* Aging Buckets */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Accounts Receivable Aging</CardTitle>
            <div className="text-right">
              <p className="text-xs text-slate">Total Outstanding</p>
              <p className="text-lg font-mono font-semibold text-ink">
                {formatCents(totalOutstanding)}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Stacked bar */}
          {totalOutstanding > 0 && (
            <div className="mb-6">
              <div className="flex h-4 rounded-full overflow-hidden">
                {aging.buckets.map((bucket, i) => {
                  const pct =
                    totalOutstanding > 0
                      ? ((bucket.totalCents as number) / totalOutstanding) * 100
                      : 0;
                  if (pct === 0) return null;
                  return (
                    <div
                      key={bucket.label}
                      className={cn("transition-all", BUCKET_COLORS[i])}
                      style={{ width: `${pct}%` }}
                      title={`${bucket.label}: ${formatCents(bucket.totalCents as number)} (${pct.toFixed(1)}%)`}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* Bucket cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {aging.buckets.map((bucket, i) => (
              <div
                key={bucket.label}
                className={cn(
                  "rounded-xl p-3 text-center",
                  BUCKET_COLORS[i]?.split(" ")[0] ?? "bg-linen",
                )}
              >
                <p className="text-xs font-medium text-slate">{bucket.label}</p>
                <p className="text-sm font-mono font-semibold text-ink mt-1">
                  {formatCents(bucket.totalCents as number)}
                </p>
                <p className="text-[10px] text-stone mt-0.5">
                  {bucket.invoiceCount} invoice{bucket.invoiceCount !== 1 ? "s" : ""}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Outstanding Invoices Detail */}
      {invoices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>
              Outstanding Invoices ({invoices.length})
            </CardTitle>
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
                      className="border-b border-stone/5 hover:bg-linen/50 transition-colors"
                    >
                      <td className="px-3 py-3 text-sm font-mono font-medium text-ink">
                        {inv.invoiceNumber}
                      </td>
                      <td className="px-3 py-3 text-sm text-slate">
                        {inv.clientName}
                      </td>
                      {!projectId && (
                        <td className="px-3 py-3 text-sm text-slate">
                          {inv.project.name}
                        </td>
                      )}
                      <td className="px-3 py-3 text-sm text-slate">
                        {new Date(inv.dueDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td className={cn(
                        "px-3 py-3 text-sm text-right font-mono",
                        inv.daysOverdue > 0 ? "text-error font-medium" : "text-slate",
                      )}>
                        {inv.daysOverdue > 0 ? inv.daysOverdue : "--"}
                      </td>
                      <td className="px-3 py-3 text-sm text-right font-mono text-ink">
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
