"use client";

import { useState } from "react";
import Link from "next/link";
import { Receipt, Search, Download, Plus } from "lucide-react";
import {
  useAllExpenses,
  type AllExpenseItem,
  type AllExpenseFilters,
} from "@/hooks/use-all-expenses";
import { formatCents } from "@/lib/financial/budget";
import { EXPENSE_STATUS_LABELS } from "@/lib/validations/expense";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { StatusBadge, getExpenseStatusVariant } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Spinner } from "@/components/shared/spinner";
import { Pagination } from "@/components/ui/pagination";
import { cn } from "@/lib/utils";
import type { ExpenseStatus } from "@prisma/client";

export default function AllExpensesPage() {
  const [filters, setFilters] = useState<AllExpenseFilters>({
    page: 1,
    pageSize: 20,
  });
  const [searchInput, setSearchInput] = useState("");

  const { data, isLoading } = useAllExpenses(filters);

  function handleSearch() {
    setFilters((prev) => ({
      ...prev,
      search: searchInput || undefined,
      page: 1,
    }));
  }

  const expenses = data?.expenses ?? [];
  const pagination = data?.pagination;
  const totalAmount = expenses.reduce((sum, e) => sum + e.amountCents, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Expenses"
        description="All expenses across projects."
        actions={
          <div className="flex items-center gap-2">
            <a
              href={`/api/exports/expenses${filters.status ? `?status=${filters.status}` : ""}`}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-paper border border-stone/20 text-ink hover:bg-linen transition-colors"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </a>
            <Link
              href="/projects"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-ink text-paper hover:bg-charcoal transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Expense
            </Link>
          </div>
        }
      />

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1">
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Search expenses..."
            className="px-3 py-1.5 rounded-lg border border-stone/20 text-sm text-ink bg-paper focus:outline-none focus:border-terracotta-300 w-48"
          />
          <button
            onClick={handleSearch}
            className="p-1.5 rounded-lg text-stone hover:text-ink hover:bg-linen transition-colors"
            aria-label="Search"
          >
            <Search className="w-4 h-4" />
          </button>
        </div>

        <Select
          value={filters.status ?? ""}
          onChange={(e) =>
            setFilters((prev) => ({
              ...prev,
              status: (e.target.value || undefined) as ExpenseStatus | undefined,
              page: 1,
            }))
          }
          options={[
            { label: "All Statuses", value: "" },
            ...Object.entries(EXPENSE_STATUS_LABELS).map(([val, label]) => ({
              label,
              value: val,
            })),
          ]}
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : expenses.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <EmptyState
              icon={Receipt}
              title="No expenses found"
              description={
                filters.status || filters.search
                  ? "Try adjusting your filters or clearing the search."
                  : "Expenses will appear here once added to projects. Go to a project to add your first expense."
              }
              actionLabel={!(filters.status || filters.search) ? "Go to Projects" : undefined}
              actionHref={!(filters.status || filters.search) ? "/projects" : undefined}
            />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-stone/10">
                    <th className="text-left text-label text-slate px-3 py-2 font-medium">
                      Description
                    </th>
                    <th className="text-left text-label text-slate px-3 py-2 font-medium">
                      Project
                    </th>
                    <th className="text-right text-label text-slate px-3 py-2 font-medium">
                      Amount
                    </th>
                    <th className="text-left text-label text-slate px-3 py-2 font-medium">Date</th>
                    <th className="text-left text-label text-slate px-3 py-2 font-medium">
                      Category
                    </th>
                    <th className="text-left text-label text-slate px-3 py-2 font-medium">
                      Submitted By
                    </th>
                    <th className="text-center text-label text-slate px-3 py-2 font-medium">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((expense) => (
                    <ExpenseRow key={expense.id} expense={expense} />
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-stone/10">
                    <td className="px-3 py-3 text-sm font-medium text-ink">
                      Total ({pagination?.total ?? expenses.length} expenses)
                    </td>
                    <td />
                    <td className="px-3 py-3 text-right text-sm font-mono font-medium text-ink">
                      {formatCents(totalAmount)}
                    </td>
                    <td colSpan={4} />
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {pagination && pagination.totalPages > 1 && (
        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          total={pagination.total}
          perPage={pagination.pageSize}
          onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
        />
      )}
    </div>
  );
}

function ExpenseRow({ expense }: { expense: AllExpenseItem }) {
  return (
    <tr className="border-b border-stone/5 hover:bg-linen/50 transition-colors">
      <td className="px-3 py-3">
        <div>
          <span className="text-sm text-ink font-medium">{expense.description}</span>
          {expense.vendor && (
            <span className="text-xs text-stone ml-2">via {expense.vendor.name}</span>
          )}
        </div>
      </td>
      <td className="px-3 py-3">
        <Link
          href={`/projects/${expense.project.id}/expenses`}
          className="text-sm text-terracotta-600 hover:text-terracotta-700 hover:underline"
        >
          {expense.project.name}
        </Link>
      </td>
      <td className="px-3 py-3 text-right text-sm font-mono text-ink">
        {formatCents(expense.amountCents)}
      </td>
      <td className="px-3 py-3 text-sm text-slate">
        {new Date(expense.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}
      </td>
      <td className="px-3 py-3 text-sm text-slate">{expense.budgetCategory?.name ?? "--"}</td>
      <td className="px-3 py-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-linen flex items-center justify-center shrink-0">
            <span className="text-[10px] font-medium text-slate">
              {expense.submittedBy.name
                ?.split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2) ?? "?"}
            </span>
          </div>
          <span className="text-sm text-slate truncate">
            {expense.submittedBy.name ?? "Unknown"}
          </span>
        </div>
      </td>
      <td className="px-3 py-3 text-center">
        <StatusBadge
          label={EXPENSE_STATUS_LABELS[expense.status] ?? expense.status}
          variant={getExpenseStatusVariant(expense.status)}
        />
      </td>
    </tr>
  );
}
