"use client";

import { useState } from "react";
import { DollarSign, CreditCard, Plus } from "lucide-react";
import { usePayments, type PaymentItem } from "@/hooks/use-payments";
import { useInvoices, type InvoiceItem } from "@/hooks/use-invoices";
import { formatCents } from "@/lib/financial/budget";
import { PAYMENT_METHOD_OPTIONS } from "@/lib/validations/payment";
import { RecordPaymentForm } from "./record-payment-form";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { Spinner } from "@/components/shared/spinner";
import { Button } from "@/components/ui/button";

interface PaymentHistoryProps {
  projectId: string;
  canRecord: boolean;
}

function methodLabel(value: string | null): string {
  if (!value) return "--";
  const found = PAYMENT_METHOD_OPTIONS.find((o) => o.value === value);
  return found?.label ?? value;
}

export function PaymentHistory({ projectId, canRecord }: PaymentHistoryProps) {
  const { data: paymentData, isLoading: paymentsLoading } = usePayments(projectId);
  const { data: invoiceData, isLoading: invoicesLoading } = useInvoices(projectId);
  const [recordingForInvoiceId, setRecordingForInvoiceId] = useState<string | null>(null);

  if (paymentsLoading || invoicesLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  const payments = paymentData?.payments ?? [];
  const summary = paymentData?.summary;

  // Find invoices that can receive payments
  const payableInvoices =
    invoiceData?.invoices.filter((inv) =>
      ["SENT", "VIEWED", "PARTIALLY_PAID", "OVERDUE"].includes(inv.status) &&
      inv.balanceDueCents > 0,
    ) ?? [];

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-linen rounded-xl p-4">
          <p className="text-xs font-medium text-slate">Total Received</p>
          <p className="text-lg font-mono font-semibold text-ink mt-1">
            {formatCents(summary?.totalReceived ?? 0)}
          </p>
        </div>
        <div className="bg-linen rounded-xl p-4">
          <p className="text-xs font-medium text-slate">Payments Recorded</p>
          <p className="text-lg font-semibold text-ink mt-1">
            {summary?.paymentCount ?? 0}
          </p>
        </div>
        <div className="bg-linen rounded-xl p-4">
          <p className="text-xs font-medium text-slate">Invoices Awaiting Payment</p>
          <p className="text-lg font-semibold text-ink mt-1">
            {payableInvoices.length}
          </p>
        </div>
      </div>

      {/* Record Payment (select from payable invoices) */}
      {canRecord && payableInvoices.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Record Payment</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {recordingForInvoiceId ? (
              (() => {
                const inv = payableInvoices.find(
                  (i) => i.id === recordingForInvoiceId,
                );
                if (!inv) return null;
                return (
                  <RecordPaymentForm
                    invoiceId={inv.id}
                    invoiceNumber={inv.invoiceNumber}
                    balanceDueCents={inv.balanceDueCents}
                    onSuccess={() => setRecordingForInvoiceId(null)}
                    onCancel={() => setRecordingForInvoiceId(null)}
                  />
                );
              })()
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-slate">
                  Select an invoice to record a payment against:
                </p>
                <div className="space-y-1.5">
                  {payableInvoices.map((inv) => (
                    <button
                      key={inv.id}
                      onClick={() => setRecordingForInvoiceId(inv.id)}
                      className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg border border-stone/10 hover:bg-linen transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-mono font-medium text-ink">
                          {inv.invoiceNumber}
                        </span>
                        <span className="text-sm text-slate">
                          {inv.clientName}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-mono text-slate">
                          Due: {formatCents(inv.balanceDueCents)}
                        </span>
                        <Plus className="w-4 h-4 text-stone" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <EmptyState
              icon={CreditCard}
              title="No payments recorded"
              description="Payments will appear here as they are recorded against invoices."
            />
          ) : (
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
                    <th className="text-left text-label text-slate px-3 py-2 font-medium">
                      Date
                    </th>
                    <th className="text-left text-label text-slate px-3 py-2 font-medium">
                      Method
                    </th>
                    <th className="text-left text-label text-slate px-3 py-2 font-medium">
                      Reference
                    </th>
                    <th className="text-right text-label text-slate px-3 py-2 font-medium">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr
                      key={payment.id}
                      className="border-b border-stone/5 hover:bg-linen/50 transition-colors"
                    >
                      <td className="px-3 py-3 text-sm font-mono text-ink">
                        {payment.invoice.invoiceNumber}
                      </td>
                      <td className="px-3 py-3 text-sm text-slate">
                        {payment.invoice.clientName}
                      </td>
                      <td className="px-3 py-3 text-sm text-slate">
                        {new Date(payment.paymentDate).toLocaleDateString(
                          "en-US",
                          { month: "short", day: "numeric", year: "numeric" },
                        )}
                      </td>
                      <td className="px-3 py-3 text-sm text-slate">
                        {methodLabel(payment.paymentMethod)}
                      </td>
                      <td className="px-3 py-3 text-sm text-slate font-mono">
                        {payment.reference ?? "--"}
                      </td>
                      <td className="px-3 py-3 text-sm text-right font-mono font-medium text-ink">
                        {formatCents(payment.amountCents)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-stone/10">
                    <td colSpan={5} className="px-3 py-3 text-sm font-medium text-ink">
                      Total ({payments.length} payment{payments.length !== 1 ? "s" : ""})
                    </td>
                    <td className="px-3 py-3 text-right text-sm font-mono font-medium text-ink">
                      {formatCents(summary?.totalReceived ?? 0)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
