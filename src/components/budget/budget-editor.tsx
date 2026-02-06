"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Wallet } from "lucide-react";
import { useBudget, type BudgetCategory } from "@/hooks/use-budget";
import {
  createBudgetAction,
  addBudgetCategoryAction,
  updateBudgetCategoryAction,
  deleteBudgetCategoryAction,
} from "@/actions/budget.actions";
import { formatCents, parseDollarsToCents } from "@/lib/financial/budget";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { Spinner } from "@/components/shared/spinner";
import { cn } from "@/lib/utils";

interface BudgetEditorProps {
  projectId: string;
}

export function BudgetEditor({ projectId }: BudgetEditorProps) {
  const router = useRouter();
  const { data, isLoading } = useBudget(projectId);
  const [isPending, startTransition] = useTransition();

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  const budget = data?.budget;

  if (!budget) {
    return <CreateBudgetForm projectId={projectId} />;
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <SummaryCard
          label="Total Budget"
          value={formatCents(budget.totalAmountCents)}
        />
        <SummaryCard
          label="Allocated"
          value={formatCents(budget.summary.totalAllocated)}
          subtext={
            budget.summary.totalUnallocated > 0
              ? `${formatCents(budget.summary.totalUnallocated)} unallocated`
              : undefined
          }
        />
        <SummaryCard
          label="Spent"
          value={formatCents(budget.summary.totalSpent)}
          variant={budget.summary.totalSpent > budget.totalAmountCents ? "danger" : "default"}
        />
        <SummaryCard
          label="Remaining"
          value={formatCents(budget.summary.totalRemaining)}
          variant={budget.summary.totalRemaining < 0 ? "danger" : "success"}
        />
      </div>

      {/* Budget Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="h-3 bg-parchment rounded-full overflow-hidden flex">
            {budget.categories.map((cat) => {
              const width = budget.totalAmountCents > 0
                ? (cat.allocatedCents / budget.totalAmountCents) * 100
                : 0;
              return (
                <div
                  key={cat.id}
                  className={cn(
                    "h-full transition-all",
                    cat.isOverBudget ? "bg-error" : "bg-sage-400",
                  )}
                  style={{ width: `${width}%` }}
                  title={`${cat.name}: ${formatCents(cat.allocatedCents)}`}
                />
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Categories Table */}
      <Card>
        <CardHeader>
          <CardTitle>Budget Categories</CardTitle>
          <AddCategoryButton budgetId={budget.id} />
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-stone/10">
                  <th className="text-left text-label text-slate px-3 py-2 font-medium">Category</th>
                  <th className="text-right text-label text-slate px-3 py-2 font-medium">Allocated</th>
                  <th className="text-right text-label text-slate px-3 py-2 font-medium">Spent</th>
                  <th className="text-right text-label text-slate px-3 py-2 font-medium">Remaining</th>
                  <th className="text-right text-label text-slate px-3 py-2 font-medium">Variance</th>
                  <th className="w-10" />
                </tr>
              </thead>
              <tbody>
                {budget.categories.map((category) => (
                  <CategoryRow
                    key={category.id}
                    category={category}
                    budgetTotal={budget.totalAmountCents}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function CreateBudgetForm({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleCreate() {
    setError(null);
    if (!amount) {
      setError("Enter a budget amount.");
      return;
    }

    let totalCents: number;
    try {
      totalCents = parseDollarsToCents(amount);
    } catch {
      setError("Enter a valid dollar amount.");
      return;
    }

    startTransition(async () => {
      const result = await createBudgetAction({
        projectId,
        totalAmountCents: totalCents,
        useTemplate: true,
      });
      if (result.success) {
        router.refresh();
      } else {
        setError(result.error ?? "Failed to create budget.");
      }
    });
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <EmptyState
          icon={Wallet}
          title="No budget set"
          description="Set a total budget and categories will be auto-allocated from a template based on the project type."
        />
        <div className="max-w-sm mx-auto mt-6 space-y-4">
          {error && (
            <p className="text-sm text-error text-center">{error}</p>
          )}
          <Input
            label="Total Budget (USD)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g., 50000"
            type="text"
            inputMode="decimal"
          />
          <Button
            variant="accent"
            className="w-full"
            loading={isPending}
            onClick={handleCreate}
          >
            Create Budget
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function SummaryCard({
  label,
  value,
  subtext,
  variant = "default",
}: {
  label: string;
  value: string;
  subtext?: string;
  variant?: "default" | "success" | "danger";
}) {
  return (
    <div className="bg-paper rounded-xl border border-stone/10 p-4">
      <span className="text-caption text-slate">{label}</span>
      <p
        className={cn(
          "text-h4 font-mono mt-1",
          variant === "danger" && "text-error",
          variant === "success" && "text-sage-600",
          variant === "default" && "text-ink",
        )}
      >
        {value}
      </p>
      {subtext && <p className="text-xs text-stone mt-1">{subtext}</p>}
    </div>
  );
}

function CategoryRow({
  category,
  budgetTotal,
}: {
  category: BudgetCategory;
  budgetTotal: number;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const percentage = budgetTotal > 0
    ? ((category.allocatedCents / budgetTotal) * 100).toFixed(1)
    : "0.0";
  const spentPct = category.allocatedCents > 0
    ? ((category.spentCents / category.allocatedCents) * 100).toFixed(0)
    : "0";

  function handleDelete() {
    if (!window.confirm(`Delete category "${category.name}"?`)) return;
    startTransition(async () => {
      await deleteBudgetCategoryAction(category.id);
      router.refresh();
    });
  }

  return (
    <tr className={cn(
      "border-b border-stone/5 hover:bg-linen/50 transition-colors",
      isPending && "opacity-60",
    )}>
      <td className="px-3 py-3">
        <div>
          <span className="text-sm text-ink font-medium">{category.name}</span>
          <div className="mt-1 w-full h-1.5 bg-parchment rounded-full overflow-hidden max-w-[120px]">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                category.isOverBudget ? "bg-error" : "bg-sage-400",
              )}
              style={{ width: `${Math.min(Number(spentPct), 100)}%` }}
            />
          </div>
        </div>
      </td>
      <td className="px-3 py-3 text-right">
        <span className="text-sm font-mono text-ink">
          {formatCents(category.allocatedCents)}
        </span>
        <span className="text-xs text-stone ml-1">({percentage}%)</span>
      </td>
      <td className="px-3 py-3 text-right text-sm font-mono text-slate">
        {formatCents(category.spentCents)}
      </td>
      <td className={cn(
        "px-3 py-3 text-right text-sm font-mono",
        category.isOverBudget ? "text-error" : "text-ink",
      )}>
        {formatCents(category.remainingCents)}
      </td>
      <td className={cn(
        "px-3 py-3 text-right text-sm font-mono",
        category.isOverBudget ? "text-error" : "text-sage-600",
      )}>
        {category.isOverBudget ? "-" : ""}{spentPct}%
      </td>
      <td className="px-3 py-3">
        <button
          onClick={handleDelete}
          disabled={isPending || category.expenseCount > 0}
          className={cn(
            "p-1 rounded text-stone hover:text-error hover:bg-error-soft transition-colors",
            category.expenseCount > 0 && "opacity-30 cursor-not-allowed",
          )}
          aria-label={`Delete ${category.name}`}
          title={category.expenseCount > 0 ? "Has linked expenses" : "Delete category"}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </td>
    </tr>
  );
}

function AddCategoryButton({ budgetId }: { budgetId: string }) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleAdd() {
    if (!name.trim()) return;

    let allocatedCents = 0;
    if (amount) {
      try {
        allocatedCents = parseDollarsToCents(amount);
      } catch {
        return;
      }
    }

    startTransition(async () => {
      await addBudgetCategoryAction({
        budgetId,
        name: name.trim(),
        allocatedCents,
      });
      setName("");
      setAmount("");
      setShowForm(false);
      router.refresh();
    });
  }

  if (!showForm) {
    return (
      <Button variant="ghost" size="sm" onClick={() => setShowForm(true)}>
        <Plus className="w-4 h-4" />
        Add Category
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Category name"
        className="px-3 py-1.5 rounded-lg border border-stone/20 text-sm text-ink bg-paper focus:outline-none focus:border-terracotta-300"
        autoFocus
      />
      <input
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Amount"
        className="w-28 px-3 py-1.5 rounded-lg border border-stone/20 text-sm text-ink bg-paper focus:outline-none focus:border-terracotta-300"
      />
      <Button size="sm" loading={isPending} onClick={handleAdd}>
        Add
      </Button>
      <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>
        Cancel
      </Button>
    </div>
  );
}
