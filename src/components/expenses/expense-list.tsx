"use client";

import { useState } from "react";
import { Plus, Receipt, Search, Filter } from "lucide-react";
import { useExpenses, type ExpenseItem, type ExpenseFilters } from "@/hooks/use-expenses";
import { formatCents } from "@/lib/financial/budget";
import { EXPENSE_STATUS_LABELS } from "@/lib/validations/expense";
import { ExpenseActions } from "./expense-actions";
import { ReceiptUpload } from "./receipt-upload";
import { ExpenseForm } from "./expense-form";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { StatusBadge, getExpenseStatusVariant } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Spinner } from "@/components/shared/spinner";
import { Pagination } from "@/components/ui/pagination";
import { cn } from "@/lib/utils";
import type { ExpenseStatus } from "@prisma/client";

interface Category {
  id: string;
  name: string;
}

interface Vendor {
  id: string;
  name: string;
}

interface ExpenseListProps {
  projectId: string;
  currentUserId: string;
  currentUserRole: string;
  categories: Category[];
  vendors: Vendor[];
}

export function ExpenseList({
  projectId,
  currentUserId,
  currentUserRole,
  categories,
  vendors,
}: ExpenseListProps) {
  const [showForm, setShowForm] = useState(false);
  const [filters, setFilters] = useState<ExpenseFilters>({
    page: 1,
    pageSize: 20,
  });
  const [searchInput, setSearchInput] = useState("");

  const { data, isLoading } = useExpenses(projectId, filters);

  const isManager = ["ADMIN", "MANAGER", "FINANCE"].includes(currentUserRole);

  function handleSearch() {
    setFilters((prev) => ({
      ...prev,
      search: searchInput || undefined,
      page: 1,
    }));
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  const expenses = data?.expenses ?? [];
  const pagination = data?.pagination;

  // Calculate totals for the header
  const totalAmount = expenses.reduce((sum, e) => sum + e.amountCents, 0);

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          {/* Search */}
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

          {/* Status filter */}
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

          {/* Category filter */}
          {categories.length > 0 && (
            <Select
              value={filters.budgetCategoryId ?? ""}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  budgetCategoryId: e.target.value || undefined,
                  page: 1,
                }))
              }
              options={[
                { label: "All Categories", value: "" },
                ...categories.map((c) => ({ label: c.name, value: c.id })),
              ]}
            />
          )}
        </div>

        <Button
          variant="accent"
          size="sm"
          onClick={() => setShowForm(!showForm)}
        >
          <Plus className="w-4 h-4" />
          New Expense
        </Button>
      </div>

      {/* New Expense Form */}
      {showForm && (
        <ExpenseForm
          projectId={projectId}
          categories={categories}
          vendors={vendors}
          onSuccess={() => setShowForm(false)}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Expense Table */}
      {expenses.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <EmptyState
              icon={Receipt}
              title="No expenses found"
              description={
                filters.status || filters.search || filters.budgetCategoryId
                  ? "Try adjusting your filters."
                  : "Track project spending by adding expenses."
              }
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
                    <th className="text-right text-label text-slate px-3 py-2 font-medium">
                      Amount
                    </th>
                    <th className="text-left text-label text-slate px-3 py-2 font-medium">
                      Date
                    </th>
                    <th className="text-left text-label text-slate px-3 py-2 font-medium">
                      Category
                    </th>
                    <th className="text-left text-label text-slate px-3 py-2 font-medium">
                      Submitted By
                    </th>
                    <th className="text-center text-label text-slate px-3 py-2 font-medium">
                      Status
                    </th>
                    <th className="text-left text-label text-slate px-3 py-2 font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((expense) => (
                    <ExpenseRow
                      key={expense.id}
                      expense={expense}
                      currentUserId={currentUserId}
                      isManager={isManager}
                    />
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-stone/10">
                    <td className="px-3 py-3 text-sm font-medium text-ink">
                      Total ({expenses.length} expenses)
                    </td>
                    <td className="px-3 py-3 text-right text-sm font-mono font-medium text-ink">
                      {formatCents(totalAmount)}
                    </td>
                    <td colSpan={5} />
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          total={pagination.total}
          perPage={pagination.pageSize}
          onPageChange={(page) =>
            setFilters((prev) => ({ ...prev, page }))
          }
        />
      )}
    </div>
  );
}

function ExpenseRow({
  expense,
  currentUserId,
  isManager,
}: {
  expense: ExpenseItem;
  currentUserId: string;
  isManager: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const isSubmitter = expense.submittedBy.id === currentUserId;
  const canEdit = isSubmitter && expense.status === "DRAFT";

  return (
    <>
      <tr
        className={cn(
          "border-b border-stone/5 hover:bg-linen/50 transition-colors cursor-pointer",
        )}
        onClick={() => setExpanded(!expanded)}
      >
        <td className="px-3 py-3">
          <div>
            <span className="text-sm text-ink font-medium">
              {expense.description}
            </span>
            {expense.vendor && (
              <span className="text-xs text-stone ml-2">
                via {expense.vendor.name}
              </span>
            )}
            {expense.attachments.length > 0 && (
              <span className="text-xs text-stone ml-2">
                ({expense.attachments.length} receipt{expense.attachments.length !== 1 ? "s" : ""})
              </span>
            )}
          </div>
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
        <td className="px-3 py-3 text-sm text-slate">
          {expense.budgetCategory?.name ?? "--"}
        </td>
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
        <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
          <ExpenseActions
            expenseId={expense.id}
            status={expense.status}
            isSubmitter={isSubmitter}
            isManager={isManager}
          />
        </td>
      </tr>

      {/* Expanded detail row */}
      {expanded && (
        <tr className="bg-linen/30">
          <td colSpan={7} className="px-6 py-4">
            <div className="space-y-3">
              {expense.notes && (
                <div>
                  <span className="text-xs font-medium text-slate">Notes:</span>
                  <p className="text-sm text-ink mt-0.5">{expense.notes}</p>
                </div>
              )}

              {expense.rejectionReason && (
                <div className="bg-error-soft rounded-lg p-3">
                  <span className="text-xs font-medium text-error">Rejection Reason:</span>
                  <p className="text-sm text-error mt-0.5">{expense.rejectionReason}</p>
                </div>
              )}

              {expense.approvedBy && (
                <div>
                  <span className="text-xs font-medium text-slate">
                    {expense.status === "APPROVED" ? "Approved" : "Reviewed"} by:
                  </span>
                  <span className="text-sm text-ink ml-1">
                    {expense.approvedBy.name ?? "Unknown"}
                  </span>
                </div>
              )}

              <ReceiptUpload
                expenseId={expense.id}
                attachments={expense.attachments}
                canEdit={canEdit}
              />
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
