"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { recordPaymentAction } from "@/actions/payment.actions";
import { parseDollarsToCents, formatCents } from "@/lib/financial/budget";
import { PAYMENT_METHOD_OPTIONS } from "@/lib/validations/payment";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface RecordPaymentFormProps {
  invoiceId: string;
  invoiceNumber: string;
  balanceDueCents: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function RecordPaymentForm({
  invoiceId,
  invoiceNumber,
  balanceDueCents,
  onSuccess,
  onCancel,
}: RecordPaymentFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [amount, setAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [paymentMethod, setPaymentMethod] = useState("");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");

  function handleSubmit() {
    setError(null);

    if (!amount) {
      setError("Payment amount is required.");
      return;
    }

    let amountCents: number;
    try {
      amountCents = parseDollarsToCents(amount);
    } catch {
      setError("Enter a valid dollar amount.");
      return;
    }

    if (amountCents <= 0) {
      setError("Payment amount must be positive.");
      return;
    }

    if (amountCents > balanceDueCents) {
      setError(
        `Payment cannot exceed the outstanding balance of ${formatCents(balanceDueCents)}.`,
      );
      return;
    }

    startTransition(async () => {
      const result = await recordPaymentAction({
        invoiceId,
        amountCents,
        paymentDate: new Date(paymentDate),
        paymentMethod: paymentMethod || undefined,
        reference: reference.trim() || undefined,
        notes: notes.trim() || undefined,
      });

      if (result.success) {
        router.refresh();
        onSuccess?.();
      } else {
        setError(result.error ?? "Failed to record payment.");
      }
    });
  }

  return (
    <div className="space-y-4 rounded-xl border border-stone/10 bg-paper p-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-ink">
          Record Payment for {invoiceNumber}
        </h4>
        <span className="text-xs text-slate">
          Balance: {formatCents(balanceDueCents)}
        </span>
      </div>

      {error && (
        <p className="text-sm text-error text-center">{error}</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Input
          label="Amount (USD)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder={`Max: ${formatCents(balanceDueCents)}`}
          type="text"
          inputMode="decimal"
        />
        <Input
          label="Payment Date"
          value={paymentDate}
          onChange={(e) => setPaymentDate(e.target.value)}
          type="date"
        />
        <Select
          label="Method"
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          options={[
            { label: "Select method...", value: "" },
            ...PAYMENT_METHOD_OPTIONS,
          ]}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Reference / Transaction ID"
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          placeholder="e.g., TXN-12345"
        />
        <Textarea
          label="Notes (optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={1}
        />
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="primary"
          size="sm"
          loading={isPending}
          onClick={handleSubmit}
        >
          Record Payment
        </Button>
        {onCancel && (
          <Button variant="ghost" size="sm" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
}
