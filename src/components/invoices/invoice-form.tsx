"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { createInvoiceAction } from "@/actions/invoice.actions";
import { parseDollarsToCents, formatCents } from "@/lib/financial/budget";
import { PAYMENT_TERMS_LABELS } from "@/lib/validations/invoice";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface LineItemDraft {
  key: string;
  description: string;
  quantity: string;
  unitPrice: string;
}

function newLineItem(): LineItemDraft {
  return {
    key: crypto.randomUUID(),
    description: "",
    quantity: "1",
    unitPrice: "",
  };
}

function parseQuantityToThousandths(input: string): number {
  const num = parseFloat(input);
  if (isNaN(num) || num <= 0) return 0;
  return Math.round(num * 1000);
}

function lineItemAmountDisplay(quantity: string, unitPrice: string): string {
  try {
    const qty = parseFloat(quantity);
    const price = parseDollarsToCents(unitPrice);
    if (isNaN(qty) || qty <= 0 || price <= 0) return "--";
    const amount = Math.round((price * qty * 1000) / 1000);
    return formatCents(amount);
  } catch {
    return "--";
  }
}

interface InvoiceFormProps {
  projectId: string;
  defaultClientName?: string;
  defaultClientEmail?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function InvoiceForm({
  projectId,
  defaultClientName = "",
  defaultClientEmail = "",
  onSuccess,
  onCancel,
}: InvoiceFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [clientName, setClientName] = useState(defaultClientName);
  const [clientEmail, setClientEmail] = useState(defaultClientEmail);
  const [clientAddress, setClientAddress] = useState("");
  const [issueDate, setIssueDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [paymentTerms, setPaymentTerms] = useState("NET_30");
  const [taxRate, setTaxRate] = useState("");
  const [notes, setNotes] = useState("");
  const [lineItems, setLineItems] = useState<LineItemDraft[]>([newLineItem()]);

  function addLineItem() {
    setLineItems((prev) => [...prev, newLineItem()]);
  }

  function removeLineItem(key: string) {
    setLineItems((prev) => prev.filter((item) => item.key !== key));
  }

  function updateLineItem(key: string, field: keyof LineItemDraft, value: string) {
    setLineItems((prev) =>
      prev.map((item) => (item.key === key ? { ...item, [field]: value } : item)),
    );
  }

  function calculateSubtotal(): number {
    let total = 0;
    for (const item of lineItems) {
      try {
        const qty = parseFloat(item.quantity);
        const price = parseDollarsToCents(item.unitPrice);
        if (!isNaN(qty) && qty > 0 && price > 0) {
          total += Math.round((price * qty * 1000) / 1000);
        }
      } catch {
        // skip invalid items
      }
    }
    return total;
  }

  function parseTaxRateBasisPoints(): number {
    if (!taxRate) return 0;
    const rate = parseFloat(taxRate);
    if (isNaN(rate) || rate < 0) return 0;
    return Math.round(rate * 100);
  }

  function handleSubmit() {
    setError(null);

    if (!clientName.trim()) {
      setError("Client name is required.");
      return;
    }

    const validLineItems = lineItems.filter(
      (item) => item.description.trim() && item.unitPrice,
    );

    if (validLineItems.length === 0) {
      setError("At least one line item with description and unit price is required.");
      return;
    }

    const parsedLineItems: { description: string; quantityThousandths: number; unitPriceCents: number }[] = [];
    for (const item of validLineItems) {
      try {
        const quantityThousandths = parseQuantityToThousandths(item.quantity);
        const unitPriceCents = parseDollarsToCents(item.unitPrice);
        if (quantityThousandths <= 0 || unitPriceCents < 0) {
          setError(`Invalid quantity or price for "${item.description}".`);
          return;
        }
        parsedLineItems.push({
          description: item.description.trim(),
          quantityThousandths,
          unitPriceCents: unitPriceCents as number,
        });
      } catch {
        setError(`Invalid price for "${item.description}".`);
        return;
      }
    }

    startTransition(async () => {
      const result = await createInvoiceAction({
        projectId,
        clientName: clientName.trim(),
        clientEmail: clientEmail.trim() || undefined,
        clientAddress: clientAddress.trim() || undefined,
        issueDate: new Date(issueDate),
        paymentTerms,
        taxRateBasisPoints: parseTaxRateBasisPoints(),
        notes: notes.trim() || undefined,
        lineItems: parsedLineItems,
      });

      if (result.success) {
        router.refresh();
        onSuccess?.();
      } else {
        setError(result.error ?? "Failed to create invoice.");
      }
    });
  }

  const subtotal = calculateSubtotal();
  const taxBp = parseTaxRateBasisPoints();
  const taxAmount = taxBp > 0 ? Math.round((subtotal * taxBp) / 10000) : 0;
  const total = subtotal + taxAmount;

  return (
    <Card>
      <CardHeader>
        <CardTitle>New Invoice</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {error && (
            <p className="text-sm text-error text-center">{error}</p>
          )}

          {/* Client Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-slate">Client Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Client Name"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Client or company name"
              />
              <Input
                label="Client Email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                placeholder="client@example.com"
                type="email"
              />
            </div>
            <Textarea
              label="Client Address (optional)"
              value={clientAddress}
              onChange={(e) => setClientAddress(e.target.value)}
              placeholder="Billing address..."
              rows={2}
            />
          </div>

          {/* Invoice Settings */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-slate">Invoice Settings</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Issue Date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                type="date"
              />
              <Select
                label="Payment Terms"
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                options={Object.entries(PAYMENT_TERMS_LABELS).map(
                  ([val, label]) => ({ label, value: val }),
                )}
              />
              <Input
                label="Tax Rate (%)"
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
                placeholder="e.g., 16"
                type="text"
                inputMode="decimal"
              />
            </div>
          </div>

          {/* Line Items */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-slate">Line Items</h3>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-stone/10">
                    <th className="text-left text-xs text-slate px-2 py-1.5 font-medium w-[40%]">
                      Description
                    </th>
                    <th className="text-right text-xs text-slate px-2 py-1.5 font-medium w-[15%]">
                      Qty
                    </th>
                    <th className="text-right text-xs text-slate px-2 py-1.5 font-medium w-[20%]">
                      Unit Price
                    </th>
                    <th className="text-right text-xs text-slate px-2 py-1.5 font-medium w-[20%]">
                      Amount
                    </th>
                    <th className="w-[5%]" />
                  </tr>
                </thead>
                <tbody>
                  {lineItems.map((item) => (
                    <tr key={item.key} className="border-b border-stone/5">
                      <td className="px-1 py-1.5">
                        <input
                          value={item.description}
                          onChange={(e) =>
                            updateLineItem(item.key, "description", e.target.value)
                          }
                          placeholder="Service or item description"
                          className="w-full px-2 py-1.5 rounded border border-stone/15 text-sm text-ink bg-paper focus:outline-none focus:border-terracotta-300"
                        />
                      </td>
                      <td className="px-1 py-1.5">
                        <input
                          value={item.quantity}
                          onChange={(e) =>
                            updateLineItem(item.key, "quantity", e.target.value)
                          }
                          placeholder="1"
                          className="w-full px-2 py-1.5 rounded border border-stone/15 text-sm text-ink bg-paper text-right focus:outline-none focus:border-terracotta-300"
                          inputMode="decimal"
                        />
                      </td>
                      <td className="px-1 py-1.5">
                        <input
                          value={item.unitPrice}
                          onChange={(e) =>
                            updateLineItem(item.key, "unitPrice", e.target.value)
                          }
                          placeholder="0.00"
                          className="w-full px-2 py-1.5 rounded border border-stone/15 text-sm text-ink bg-paper text-right focus:outline-none focus:border-terracotta-300"
                          inputMode="decimal"
                        />
                      </td>
                      <td className="px-2 py-1.5 text-right text-sm font-mono text-slate">
                        {lineItemAmountDisplay(item.quantity, item.unitPrice)}
                      </td>
                      <td className="px-1 py-1.5">
                        {lineItems.length > 1 && (
                          <button
                            onClick={() => removeLineItem(item.key)}
                            className="p-1 text-stone hover:text-error transition-colors"
                            aria-label="Remove line item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button
              onClick={addLineItem}
              className="flex items-center gap-1.5 text-xs text-slate hover:text-ink transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add line item
            </button>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-64 space-y-1 text-sm">
              <div className="flex justify-between text-slate">
                <span>Subtotal</span>
                <span className="font-mono">{formatCents(subtotal)}</span>
              </div>
              {taxBp > 0 && (
                <div className="flex justify-between text-slate">
                  <span>Tax ({taxRate}%)</span>
                  <span className="font-mono">{formatCents(taxAmount)}</span>
                </div>
              )}
              <div className="flex justify-between font-medium text-ink border-t border-stone/10 pt-1">
                <span>Total</span>
                <span className="font-mono">{formatCents(total)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <Textarea
            label="Notes (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Payment instructions, additional terms..."
            rows={3}
          />

          {/* Submit */}
          <div className="flex items-center gap-3 pt-2">
            <Button
              variant="accent"
              loading={isPending}
              onClick={handleSubmit}
            >
              Create Invoice
            </Button>
            {onCancel && (
              <Button variant="ghost" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
