"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { PnlReport } from "@/components/reports/pnl-report";
import { ProfitabilityTable } from "@/components/reports/profitability-table";
import { CashFlowForecast } from "@/components/reports/cash-flow-forecast";
import { cn } from "@/lib/utils";

const TABS = [
  { key: "pnl", label: "Profit & Loss" },
  { key: "profitability", label: "Project Profitability" },
  { key: "cashflow", label: "Cash Flow Forecast" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("pnl");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description="Financial reports and project profitability analysis."
      />

      <div className="border-b border-stone/10">
        <nav className="flex gap-0 -mb-px">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                activeTab === tab.key
                  ? "border-terracotta-400 text-ink"
                  : "border-transparent text-slate hover:text-ink hover:border-stone/20",
              )}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === "pnl" && <PnlReport />}
      {activeTab === "profitability" && <ProfitabilityTable />}
      {activeTab === "cashflow" && <CashFlowForecast />}
    </div>
  );
}
