"use client";

import { useState, useCallback } from "react";
import { Building2, Search, X, Star, Mail, Phone } from "lucide-react";
import Link from "next/link";
import { useVendors } from "@/hooks/use-vendors";
import { VENDOR_CATEGORY_LABELS } from "@/lib/validations/vendor";
import { Pagination } from "@/components/ui/pagination";
import { Spinner } from "@/components/shared/spinner";
import { EmptyState } from "@/components/shared/empty-state";
import { cn } from "@/lib/utils";

export function VendorList() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const handleCategoryChange = useCallback((value: string) => {
    setCategory(value);
    setPage(1);
  }, []);

  const { data, isLoading, error } = useVendors({
    search: search || undefined,
    category: category as never || undefined,
    page,
    perPage: 20,
  });

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone" />
          <input
            type="text"
            placeholder="Search vendors..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className={cn(
              "w-full pl-10 pr-4 py-2.5 rounded-xl",
              "bg-paper border border-stone/20",
              "text-ink placeholder:text-stone text-sm",
              "focus:outline-none focus:border-terracotta-300 focus:ring-2 focus:ring-terracotta-100",
              "transition-all duration-150",
            )}
          />
        </div>

        <select
          value={category}
          onChange={(e) => handleCategoryChange(e.target.value)}
          className={cn(
            "px-4 py-2.5 rounded-xl",
            "bg-paper border border-stone/20",
            "text-sm",
            category ? "text-ink" : "text-stone",
            "focus:outline-none focus:border-terracotta-300 focus:ring-2 focus:ring-terracotta-100",
            "transition-all duration-150",
          )}
        >
          <option value="">All Categories</option>
          {Object.entries(VENDOR_CATEGORY_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>

        {(search || category) && (
          <button
            onClick={() => {
              setSearch("");
              setCategory("");
              setPage(1);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm text-slate hover:text-ink hover:bg-linen transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            Clear
          </button>
        )}
      </div>

      {isLoading && (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      )}

      {error && (
        <div className="bg-error-soft border border-error/20 rounded-xl p-4 text-sm text-error">
          {error.message}
        </div>
      )}

      {data && data.vendors.length === 0 && (
        <EmptyState
          icon={Building2}
          title={search || category ? "No matching vendors" : "No vendors yet"}
          description={
            search || category
              ? "Try adjusting your filters."
              : "Add vendors to your directory to track contacts and assign them to projects."
          }
          actionLabel={!(search || category) ? "Add Vendor" : undefined}
          actionHref={!(search || category) ? "/vendors/new" : undefined}
        />
      )}

      {data && data.vendors.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {data.vendors.map((vendor) => (
              <Link
                key={vendor.id}
                href={`/vendors/${vendor.id}`}
                className="block bg-paper rounded-xl border border-stone/10 p-5 shadow-sm hover:shadow-md hover:border-stone/20 transition-all group"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-ink truncate group-hover:text-terracotta-500 transition-colors">
                      {vendor.name}
                    </h3>
                    <span className="text-xs text-slate">
                      {VENDOR_CATEGORY_LABELS[vendor.category] ?? vendor.category}
                    </span>
                  </div>
                  {!vendor.isActive && (
                    <span className="text-xs text-stone bg-parchment px-2 py-0.5 rounded">
                      Inactive
                    </span>
                  )}
                </div>

                {vendor.rating && (
                  <div className="flex items-center gap-0.5 mb-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "w-3.5 h-3.5",
                          i < vendor.rating!
                            ? "text-warning fill-warning"
                            : "text-stone/30",
                        )}
                      />
                    ))}
                  </div>
                )}

                <div className="space-y-1 mt-3">
                  {vendor.contactName && (
                    <p className="text-xs text-slate">{vendor.contactName}</p>
                  )}
                  {vendor.email && (
                    <p className="flex items-center gap-1.5 text-xs text-stone">
                      <Mail className="w-3 h-3" />
                      {vendor.email}
                    </p>
                  )}
                  {vendor.phone && (
                    <p className="flex items-center gap-1.5 text-xs text-stone">
                      <Phone className="w-3 h-3" />
                      {vendor.phone}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3 mt-3 pt-3 border-t border-stone/5 text-xs text-stone">
                  <span>{vendor._count.projects} project{vendor._count.projects !== 1 ? "s" : ""}</span>
                  <span>{vendor._count.expenses} expense{vendor._count.expenses !== 1 ? "s" : ""}</span>
                </div>
              </Link>
            ))}
          </div>

          <Pagination
            page={data.pagination.page}
            totalPages={data.pagination.totalPages}
            total={data.pagination.total}
            perPage={data.pagination.perPage}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}
