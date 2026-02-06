"use client";

import { useState } from "react";
import { Plus, FileText, Search, ChevronDown, ChevronRight } from "lucide-react";
import { useInvoices, type InvoiceItem } from "@/hooks/use-invoices";
import { formatCents } from "@/lib/financial/budget";
import { formatQuantity } from "@/lib/financial/invoice";
import {
  INVOICE_STATUS_LABELS,
  PAYMENT_TERMS_LABELS,
} from "@/lib/validations/invoice";
import { InvoiceActions } from "./invoice-actions";
import { InvoiceForm } from "./invoice-form";
import { Card, CardContent } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { StatusBadge, getInvoiceStatusVariant } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Spinner } from "@/components/shared/spinner";
import { Pagination } from "@/components/ui/pagination";
import { cn } from "@/lib/utils";
import type { InvoiceStatus } from "@prisma/client";

interface InvoiceListProps {
  projectId: string;
  currentUserRole: string;
  defaultClientName?: string;
  defaultClientEmail?: string;
}

export function InvoiceList({
  projectId,
  currentUserRole,
  defaultClientName,
  defaultClientEmail,
}: InvoiceListProps) {
  const [showForm, setShowForm] = useState(false);
  const [filters, setFilters] = useState<{
    status?: InvoiceStatus;
    search?: string;
    page: number;
    pageSize: number;
  }>({ page: 1, pageSize: 20 });
  const [searchInput, setSearchInput] = useState("");

  const { data, isLoading } = useInvoices(projectId, filters);

  const isAdmin = currentUserRole === "ADMIN";
  const canCreate = ["ADMIN", "MANAGER", "FINANCE"].includes(currentUserRole);

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

  const invoices = data?.invoices ?? [];
  const pagination = data?.pagination;

  // Summary
  const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.totalCents, 0);
  const totalOutstanding = invoices.reduce((sum, inv) => sum + inv.balanceDueCents, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Search invoices..."
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
                status: (e.target.value || undefined) as InvoiceStatus | undefined,
                page: 1,
              }))
            }
            options={[
              { label: "All Statuses", value: "" },
              ...Object.entries(INVOICE_STATUS_LABELS).map(([val, label]) => ({
                label,
                value: val,
              })),
            ]}
          />
        </div>

        {canCreate && (
          <Button
            variant="accent"
            size="sm"
            onClick={() => setShowForm(!showForm)}
          >
            <Plus className="w-4 h-4" />
            New Invoice
          </Button>
        )}
      </div>

      {/* Summary Cards */}
      {invoices.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="bg-linen rounded-xl p-4">
            <p className="text-xs font-medium text-slate">Total Invoiced</p>
            <p className="text-lg font-mono font-semibold text-ink mt-1">
              {formatCents(totalInvoiced)}
            </p>
          </div>
          <div className="bg-linen rounded-xl p-4">
            <p className="text-xs font-medium text-slate">Outstanding</p>
            <p className="text-lg font-mono font-semibold text-ink mt-1">
              {formatCents(totalOutstanding)}
            </p>
          </div>
          <div className="bg-linen rounded-xl p-4">
            <p className="text-xs font-medium text-slate">Invoice Count</p>
            <p className="text-lg font-semibold text-ink mt-1">
              {pagination?.total ?? invoices.length}
            </p>
          </div>
        </div>
      )}

      {/* New Invoice Form */}
      {showForm && (
        <InvoiceForm
          projectId={projectId}
          defaultClientName={defaultClientName}
          defaultClientEmail={defaultClientEmail}
          onSuccess={() => setShowForm(false)}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Invoice Table */}
      {invoices.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <EmptyState
              icon={FileText}
              title="No invoices found"
              description={
                filters.status || filters.search
                  ? "Try adjusting your filters."
                  : "Create your first invoice to start billing."
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
                    <th className="text-left text-label text-slate px-3 py-2 font-medium w-8" />
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
                      Due
                    </th>
                    <th className="text-right text-label text-slate px-3 py-2 font-medium">
                      Total
                    </th>
                    <th className="text-right text-label text-slate px-3 py-2 font-medium">
                      Balance
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
                  {invoices.map((invoice) => (
                    <InvoiceRow
                      key={invoice.id}
                      invoice={invoice}
                      isAdmin={isAdmin}
                    />
                  ))}
                </tbody>
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

function InvoiceRow({
  invoice,
  isAdmin,
}: {
  invoice: InvoiceItem;
  isAdmin: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <tr
        className="border-b border-stone/5 hover:bg-linen/50 transition-colors cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <td className="px-3 py-3 text-stone">
          {expanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </td>
        <td className="px-3 py-3">
          <span className="text-sm font-mono font-medium text-ink">
            {invoice.invoiceNumber}
          </span>
        </td>
        <td className="px-3 py-3 text-sm text-slate">
          {invoice.clientName}
        </td>
        <td className="px-3 py-3 text-sm text-slate">
          {new Date(invoice.issueDate).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </td>
        <td className="px-3 py-3 text-sm text-slate">
          {new Date(invoice.dueDate).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </td>
        <td className="px-3 py-3 text-right text-sm font-mono text-ink">
          {formatCents(invoice.totalCents)}
        </td>
        <td className="px-3 py-3 text-right text-sm font-mono text-ink">
          {formatCents(invoice.balanceDueCents)}
        </td>
        <td className="px-3 py-3 text-center">
          <StatusBadge
            label={INVOICE_STATUS_LABELS[invoice.status] ?? invoice.status}
            variant={getInvoiceStatusVariant(invoice.status)}
          />
        </td>
        <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
          <InvoiceActions
            invoiceId={invoice.id}
            status={invoice.status}
            isAdmin={isAdmin}
          />
        </td>
      </tr>

      {/* Expanded: line items */}
      {expanded && (
        <tr className="bg-linen/30">
          <td colSpan={9} className="px-6 py-4">
            <div className="space-y-3">
              <h4 className="text-xs font-medium text-slate">Line Items</h4>
              <table className="w-full max-w-2xl">
                <thead>
                  <tr className="border-b border-stone/10">
                    <th className="text-left text-xs text-slate px-2 py-1 font-medium">
                      Description
                    </th>
                    <th className="text-right text-xs text-slate px-2 py-1 font-medium">
                      Qty
                    </th>
                    <th className="text-right text-xs text-slate px-2 py-1 font-medium">
                      Unit Price
                    </th>
                    <th className="text-right text-xs text-slate px-2 py-1 font-medium">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.lineItems.map((li) => (
                    <tr key={li.id} className="border-b border-stone/5">
                      <td className="px-2 py-1.5 text-sm text-ink">
                        {li.description}
                      </td>
                      <td className="px-2 py-1.5 text-sm text-right text-slate">
                        {formatQuantity(li.quantityThousandths)}
                      </td>
                      <td className="px-2 py-1.5 text-sm text-right font-mono text-slate">
                        {formatCents(li.unitPriceCents)}
                      </td>
                      <td className="px-2 py-1.5 text-sm text-right font-mono text-ink">
                        {formatCents(li.amountCents)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={3} className="px-2 py-1.5 text-sm text-right text-slate">
                      Subtotal
                    </td>
                    <td className="px-2 py-1.5 text-sm text-right font-mono text-ink">
                      {formatCents(invoice.subtotalCents)}
                    </td>
                  </tr>
                  {invoice.taxAmountCents > 0 && (
                    <tr>
                      <td colSpan={3} className="px-2 py-1.5 text-sm text-right text-slate">
                        Tax ({(invoice.taxRateBasisPoints / 100).toFixed(2)}%)
                      </td>
                      <td className="px-2 py-1.5 text-sm text-right font-mono text-ink">
                        {formatCents(invoice.taxAmountCents)}
                      </td>
                    </tr>
                  )}
                  <tr className="border-t border-stone/10">
                    <td colSpan={3} className="px-2 py-1.5 text-sm text-right font-medium text-ink">
                      Total
                    </td>
                    <td className="px-2 py-1.5 text-sm text-right font-mono font-medium text-ink">
                      {formatCents(invoice.totalCents)}
                    </td>
                  </tr>
                </tfoot>
              </table>

              <div className="flex items-center gap-4 text-xs text-slate">
                <span>
                  Terms: {PAYMENT_TERMS_LABELS[invoice.paymentTerms] ?? invoice.paymentTerms}
                </span>
                {invoice._count.payments > 0 && (
                  <span>
                    {invoice._count.payments} payment{invoice._count.payments !== 1 ? "s" : ""} recorded
                  </span>
                )}
              </div>

              {invoice.notes && (
                <div>
                  <span className="text-xs font-medium text-slate">Notes:</span>
                  <p className="text-sm text-ink mt-0.5">{invoice.notes}</p>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
