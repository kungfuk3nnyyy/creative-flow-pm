"use client";

import { useState } from "react";
import Link from "next/link";
import { FileText, Search, ChevronDown, ChevronRight, Download, Plus } from "lucide-react";
import { useAllInvoices, type AllInvoiceItem } from "@/hooks/use-all-invoices";
import { formatCents } from "@/lib/financial/budget";
import { formatQuantity } from "@/lib/financial/invoice";
import { INVOICE_STATUS_LABELS, PAYMENT_TERMS_LABELS } from "@/lib/validations/invoice";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { StatusBadge, getInvoiceStatusVariant } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Spinner } from "@/components/shared/spinner";
import { Pagination } from "@/components/ui/pagination";
import type { InvoiceStatus } from "@prisma/client";

interface InvoiceFilters {
  status?: InvoiceStatus;
  search?: string;
  page: number;
  pageSize: number;
}

export default function AllInvoicesPage() {
  const [filters, setFilters] = useState<InvoiceFilters>({
    page: 1,
    pageSize: 20,
  });
  const [searchInput, setSearchInput] = useState("");

  const { data, isLoading } = useAllInvoices(filters);

  function handleSearch() {
    setFilters((prev) => ({
      ...prev,
      search: searchInput || undefined,
      page: 1,
    }));
  }

  const invoices = data?.invoices ?? [];
  const pagination = data?.pagination;
  const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.totalCents, 0);
  const totalOutstanding = invoices.reduce((sum, inv) => sum + inv.balanceDueCents, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Invoices"
        description="All invoices across projects."
        actions={
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <a
              href={`/api/exports/invoices${filters.status ? `?status=${filters.status}` : ""}`}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-paper border border-stone/20 text-ink hover:bg-linen transition-colors"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </a>
            <Link
              href="/projects"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-ink text-paper hover:bg-charcoal transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Invoice
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

      {/* Summary Cards */}
      {!isLoading && invoices.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-linen rounded-xl p-4">
            <p className="text-sm sm:text-xs font-medium text-slate">Total Invoiced</p>
            <p className="text-base sm:text-lg font-mono font-semibold text-ink mt-1">
              {formatCents(totalInvoiced)}
            </p>
          </div>
          <div className="bg-linen rounded-xl p-4">
            <p className="text-sm sm:text-xs font-medium text-slate">Outstanding</p>
            <p className="text-base sm:text-lg font-mono font-semibold text-ink mt-1">
              {formatCents(totalOutstanding)}
            </p>
          </div>
          <div className="bg-linen rounded-xl p-4">
            <p className="text-sm sm:text-xs font-medium text-slate">Invoice Count</p>
            <p className="text-base sm:text-lg font-semibold text-ink mt-1">
              {pagination?.total ?? invoices.length}
            </p>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : invoices.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <EmptyState
              icon={FileText}
              title="No invoices found"
              description={
                filters.status || filters.search
                  ? "Try adjusting your filters or clearing the search."
                  : "Invoices will appear here once created in projects. Go to a project to create your first invoice."
              }
              actionLabel={!(filters.status || filters.search) ? "Go to Projects" : undefined}
              actionHref={!(filters.status || filters.search) ? "/projects" : undefined}
            />
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Mobile card view */}
          <div className="sm:hidden space-y-3">
            {invoices.map((invoice) => (
              <div
                key={invoice.id}
                className="bg-paper rounded-xl border border-stone/10 p-4 space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-mono font-medium text-ink">
                      {invoice.invoiceNumber}
                    </p>
                    <p className="text-sm text-slate mt-0.5">{invoice.clientName}</p>
                  </div>
                  <StatusBadge
                    label={INVOICE_STATUS_LABELS[invoice.status] ?? invoice.status}
                    variant={getInvoiceStatusVariant(invoice.status)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Link
                    href={`/projects/${invoice.project.id}/invoices`}
                    className="text-sm text-terracotta-600 hover:text-terracotta-700"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {invoice.project.name}
                  </Link>
                  <span className="text-sm font-mono font-medium text-ink">
                    {formatCents(invoice.totalCents)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm text-slate">
                  <span>
                    Due:{" "}
                    {new Date(invoice.dueDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  <span>Balance: {formatCents(invoice.balanceDueCents)}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table view */}
          <Card className="hidden sm:block">
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
                        Project
                      </th>
                      <th className="text-left text-label text-slate px-3 py-2 font-medium">
                        Client
                      </th>
                      <th className="text-left text-label text-slate px-3 py-2 font-medium">
                        Date
                      </th>
                      <th className="text-left text-label text-slate px-3 py-2 font-medium">Due</th>
                      <th className="text-right text-label text-slate px-3 py-2 font-medium">
                        Total
                      </th>
                      <th className="text-right text-label text-slate px-3 py-2 font-medium">
                        Balance
                      </th>
                      <th className="text-center text-label text-slate px-3 py-2 font-medium">
                        Status
                      </th>
                      <th className="text-center text-label text-slate px-3 py-2 font-medium w-12" />
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((invoice) => (
                      <InvoiceRow key={invoice.id} invoice={invoice} />
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
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

function InvoiceRow({ invoice }: { invoice: AllInvoiceItem }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <tr
        className="border-b border-stone/5 hover:bg-linen/50 transition-colors cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <td className="px-3 py-3 text-stone">
          {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </td>
        <td className="px-3 py-3">
          <span className="text-sm font-mono font-medium text-ink">{invoice.invoiceNumber}</span>
        </td>
        <td className="px-3 py-3">
          <Link
            href={`/projects/${invoice.project.id}/invoices`}
            className="text-sm text-terracotta-600 hover:text-terracotta-700 hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {invoice.project.name}
          </Link>
        </td>
        <td className="px-3 py-3 text-sm text-slate">{invoice.clientName}</td>
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
        <td className="px-3 py-3 text-center">
          <a
            href={`/api/invoices/${invoice.id}/pdf`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-stone hover:text-ink hover:bg-linen transition-colors"
            title="Download PDF"
          >
            <Download className="w-4 h-4" />
          </a>
        </td>
      </tr>

      {expanded && (
        <tr className="bg-linen/30">
          <td colSpan={10} className="px-6 py-4">
            <div className="space-y-3">
              <h4 className="text-xs font-medium text-slate">Line Items</h4>
              <table className="w-full max-w-2xl">
                <thead>
                  <tr className="border-b border-stone/10">
                    <th className="text-left text-xs text-slate px-2 py-1 font-medium">
                      Description
                    </th>
                    <th className="text-right text-xs text-slate px-2 py-1 font-medium">Qty</th>
                    <th className="text-right text-xs text-slate px-2 py-1 font-medium">
                      Unit Price
                    </th>
                    <th className="text-right text-xs text-slate px-2 py-1 font-medium">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.lineItems.map((li) => (
                    <tr key={li.id} className="border-b border-stone/5">
                      <td className="px-2 py-1.5 text-sm text-ink">{li.description}</td>
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
                    {invoice._count.payments} payment{invoice._count.payments !== 1 ? "s" : ""}{" "}
                    recorded
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
