"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createExpenseAction } from "@/actions/expense.actions";
import { parseDollarsToCents } from "@/lib/financial/budget";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface Category {
  id: string;
  name: string;
}

interface Vendor {
  id: string;
  name: string;
}

interface ExpenseFormProps {
  projectId: string;
  categories: Category[];
  vendors: Vendor[];
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ExpenseForm({
  projectId,
  categories,
  vendors,
  onSuccess,
  onCancel,
}: ExpenseFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [categoryId, setCategoryId] = useState("");
  const [vendorId, setVendorId] = useState("");
  const [notes, setNotes] = useState("");

  function handleSubmit() {
    setError(null);

    if (!description.trim()) {
      setError("Description is required.");
      return;
    }

    if (!amount) {
      setError("Amount is required.");
      return;
    }

    let amountCents: number;
    try {
      amountCents = parseDollarsToCents(amount);
    } catch {
      setError("Enter a valid dollar amount.");
      return;
    }

    if (!date) {
      setError("Date is required.");
      return;
    }

    startTransition(async () => {
      const result = await createExpenseAction({
        projectId,
        description: description.trim(),
        amountCents,
        date: new Date(date),
        budgetCategoryId: categoryId || undefined,
        vendorId: vendorId || undefined,
        notes: notes.trim() || undefined,
      });

      if (result.success) {
        router.refresh();
        onSuccess?.();
      } else {
        setError(result.error ?? "Failed to create expense.");
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>New Expense</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {error && (
            <p className="text-sm text-error text-center">{error}</p>
          )}

          <Input
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What was this expense for?"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Amount (USD)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g., 250.00"
              type="text"
              inputMode="decimal"
            />
            <Input
              label="Date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              type="date"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Budget Category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              options={[
                { label: "None", value: "" },
                ...categories.map((c) => ({ label: c.name, value: c.id })),
              ]}
            />
            <Select
              label="Vendor"
              value={vendorId}
              onChange={(e) => setVendorId(e.target.value)}
              options={[
                { label: "None", value: "" },
                ...vendors.map((v) => ({ label: v.name, value: v.id })),
              ]}
            />
          </div>

          <Textarea
            label="Notes (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Additional details..."
            rows={3}
          />

          <div className="flex items-center gap-3 pt-2">
            <Button
              variant="accent"
              loading={isPending}
              onClick={handleSubmit}
            >
              Create Expense
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
