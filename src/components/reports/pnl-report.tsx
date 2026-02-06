"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { usePnlReport, type PnlFilters } from "@/hooks/use-reports";
import { formatCents } from "@/lib/financial/budget";
import { formatBasisPoints } from "@/lib/financial/money";
import type { BasisPoints } from "@/lib/financial/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/shared/spinner";
import { cn } from "@/lib/utils";

function getMonthRange(monthsAgo: number): { start: string; end: string } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1);
  const end = new Date(now.getFullYear(), now.getMonth() - monthsAgo + 1, 0);
  return {
    start: start.toISOString().split("T")[0],
    end: end.toISOString().split("T")[0],
  };
}

const PRESETS = [
  { label: "This Month", value: "this" },
  { label: "Last Month", value: "last" },
  { label: "Last 3 Months", value: "3m" },
  { label: "Year to Date", value: "ytd" },
  { label: "Custom", value: "custom" },
];

function getPresetDates(preset: string): { start: string; end: string } {
  const now = new Date();
  switch (preset) {
    case "this":
      return getMonthRange(0);
    case "last":
      return getMonthRange(1);
    case "3m": {
      const start = new Date(now.getFullYear(), now.getMonth() - 2, 1);
      return {
        start: start.toISOString().split("T")[0],
        end: now.toISOString().split("T")[0],
      };
    }
    case "ytd": {
      const start = new Date(now.getFullYear(), 0, 1);
      return {
        start: start.toISOString().split("T")[0],
        end: now.toISOString().split("T")[0],
      };
    }
    default:
      return getMonthRange(0);
  }
}

export function PnlReport() {
  const [preset, setPreset] = useState("this");
  const defaultDates = getPresetDates("this");
  const [startDate, setStartDate] = useState(defaultDates.start);
  const [endDate, setEndDate] = useState(defaultDates.end);
  const [basis, setBasis] = useState<"cash" | "accrual">("accrual");

  const filters: PnlFilters = { startDate, endDate, basis };
  const { data, isLoading } = usePnlReport(filters);
  const report = data?.report;

  function handlePresetChange(value: string) {
    setPreset(value);
    if (value !== "custom") {
      const dates = getPresetDates(value);
      setStartDate(dates.start);
      setEndDate(dates.end);
    }
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-end gap-4 flex-wrap">
        <Select
          label="Period"
          value={preset}
          onChange={(e) => handlePresetChange(e.target.value)}
          options={PRESETS}
        />

        {preset === "custom" && (
          <>
            <Input
              label="Start"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <Input
              label="End"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </>
        )}

        <Select
          label="Basis"
          value={basis}
          onChange={(e) => setBasis(e.target.value as "cash" | "accrual")}
          options={[
            { label: "Accrual", value: "accrual" },
            { label: "Cash", value: "cash" },
          ]}
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : report ? (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <SummaryCard
              label={basis === "accrual" ? "Revenue (Invoiced)" : "Revenue (Received)"}
              value={formatCents(
                basis === "accrual"
                  ? (report.revenue.invoicedCents as number)
                  : (report.revenue.receivedCents as number),
              )}
              variant="default"
            />
            <SummaryCard
              label="Expenses (Approved)"
              value={formatCents(report.expenses.approvedCents as number)}
              variant="default"
            />
            <SummaryCard
              label="Gross Profit"
              value={formatCents(report.grossProfitCents as number)}
              variant={(report.grossProfitCents as number) >= 0 ? "positive" : "negative"}
            />
            <SummaryCard
              label="Margin"
              value={formatBasisPoints(report.grossMarginBasisPoints as BasisPoints)}
              variant={(report.grossMarginBasisPoints as number) >= 0 ? "positive" : "negative"}
            />
          </div>

          {/* Visual Summary */}
          {(() => {
            const revCents =
              basis === "accrual"
                ? (report.revenue.invoicedCents as number)
                : (report.revenue.receivedCents as number);
            const expCents = report.expenses.approvedCents as number;
            const maxVal = Math.max(revCents, expCents, 1);
            return (
              <Card>
                <CardHeader>
                  <CardTitle>Revenue vs Expenses</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate">Revenue</span>
                      <span className="font-mono text-ink">{formatCents(revCents)}</span>
                    </div>
                    <div className="w-full h-6 bg-stone/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-success rounded-full transition-all"
                        style={{ width: `${Math.max(2, (revCents / maxVal) * 100)}%` }}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate">Expenses</span>
                      <span className="font-mono text-ink">{formatCents(expCents)}</span>
                    </div>
                    <div className="w-full h-6 bg-stone/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-terracotta-400 rounded-full transition-all"
                        style={{ width: `${Math.max(2, (expCents / maxVal) * 100)}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-stone/10">
                    <span className="text-sm font-medium text-ink">Gross Profit</span>
                    <span
                      className={cn(
                        "text-sm font-mono font-semibold",
                        (report.grossProfitCents as number) >= 0 ? "text-success" : "text-error",
                      )}
                    >
                      {formatCents(report.grossProfitCents as number)}{" "}
                      <span className="text-xs text-slate font-normal">
                        ({formatBasisPoints(report.grossMarginBasisPoints as BasisPoints)} margin)
                      </span>
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })()}

          {/* P&L Statement */}
          <Card>
            <CardHeader>
              <CardTitle>Profit & Loss Statement</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {/* Revenue Section */}
                <PnlSection
                  title="Revenue"
                  items={report.revenue.items.map((i) => ({
                    label: i.label,
                    amountCents: i.amountCents as number,
                  }))}
                  totalCents={
                    basis === "accrual"
                      ? (report.revenue.invoicedCents as number)
                      : (report.revenue.receivedCents as number)
                  }
                  totalLabel="Total Revenue"
                />

                <div className="h-2" />

                {/* Expenses Section */}
                <PnlSection
                  title="Expenses"
                  items={report.expenses.items.map((i) => ({
                    label: i.label,
                    amountCents: i.amountCents as number,
                  }))}
                  totalCents={report.expenses.approvedCents as number}
                  totalLabel="Total Expenses"
                  negative
                />

                {/* Gross Profit */}
                <div className="border-t-2 border-stone/20 mt-4 pt-3">
                  <div className="flex items-center justify-between px-3 py-2">
                    <span className="text-sm font-semibold text-ink">Gross Profit</span>
                    <span
                      className={cn(
                        "text-sm font-mono font-semibold",
                        (report.grossProfitCents as number) >= 0 ? "text-success" : "text-error",
                      )}
                    >
                      {formatCents(report.grossProfitCents as number)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional context */}
          <div className="flex items-center gap-6 text-xs text-stone">
            <span>Invoiced: {formatCents(report.revenue.invoicedCents as number)}</span>
            <span>Received: {formatCents(report.revenue.receivedCents as number)}</span>
            <span>All Expenses: {formatCents(report.expenses.totalCents as number)}</span>
          </div>
        </>
      ) : null}
    </div>
  );
}

function SummaryCard({
  label,
  value,
  variant,
}: {
  label: string;
  value: string;
  variant: "default" | "positive" | "negative";
}) {
  return (
    <div className="bg-linen rounded-xl p-4">
      <p className="text-xs font-medium text-slate">{label}</p>
      <p
        className={cn(
          "text-lg font-mono font-semibold mt-1",
          variant === "positive" && "text-success",
          variant === "negative" && "text-error",
          variant === "default" && "text-ink",
        )}
      >
        {value}
      </p>
    </div>
  );
}

function PnlSection({
  title,
  items,
  totalCents,
  totalLabel,
  negative = false,
}: {
  title: string;
  items: { label: string; amountCents: number }[];
  totalCents: number;
  totalLabel: string;
  negative?: boolean;
}) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-linen transition-colors"
      >
        <div className="flex items-center gap-2">
          {expanded ? (
            <ChevronDown className="w-4 h-4 text-stone" />
          ) : (
            <ChevronRight className="w-4 h-4 text-stone" />
          )}
          <span className="text-sm font-medium text-ink">{title}</span>
        </div>
        <span className="text-sm font-mono font-medium text-ink">
          {negative && totalCents > 0 ? "(" : ""}
          {formatCents(totalCents)}
          {negative && totalCents > 0 ? ")" : ""}
        </span>
      </button>

      {expanded && items.length > 0 && (
        <div className="ml-6 space-y-0.5">
          {items.map((item) => (
            <div key={item.label} className="flex items-center justify-between px-3 py-1.5">
              <span className="text-sm text-slate">{item.label}</span>
              <span className="text-sm font-mono text-slate">{formatCents(item.amountCents)}</span>
            </div>
          ))}
          <div className="flex items-center justify-between px-3 py-1.5 border-t border-stone/10">
            <span className="text-sm font-medium text-slate">{totalLabel}</span>
            <span className="text-sm font-mono font-medium text-ink">
              {formatCents(totalCents)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
