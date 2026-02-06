"use client";

import { useProfitability } from "@/hooks/use-reports";
import { formatCents } from "@/lib/financial/budget";
import { formatBasisPoints } from "@/lib/financial/money";
import type { BasisPoints } from "@/lib/financial/types";
import { PROJECT_TYPE_LABELS } from "@/lib/validations/project";
import { StatusBadge, getProjectStatusVariant } from "@/components/shared/status-badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/shared/spinner";
import { cn } from "@/lib/utils";

export function ProfitabilityTable() {
  const { data, isLoading } = useProfitability();

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  const projects = data?.projects ?? [];
  const summary = data?.summary;

  return (
    <div className="space-y-6">
      {/* Summary */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="bg-linen rounded-xl p-4">
            <p className="text-sm sm:text-xs font-medium text-slate">Projects</p>
            <p className="text-base sm:text-lg font-semibold text-ink mt-1">
              {summary.projectCount}
            </p>
          </div>
          <div className="bg-linen rounded-xl p-4">
            <p className="text-sm sm:text-xs font-medium text-slate">Total Invoiced</p>
            <p className="text-base sm:text-lg font-mono font-semibold text-ink mt-1">
              {formatCents(summary.totalInvoicedCents)}
            </p>
          </div>
          <div className="bg-linen rounded-xl p-4">
            <p className="text-sm sm:text-xs font-medium text-slate">Total Received</p>
            <p className="text-base sm:text-lg font-mono font-semibold text-ink mt-1">
              {formatCents(summary.totalReceivedCents)}
            </p>
          </div>
          <div className="bg-linen rounded-xl p-4">
            <p className="text-sm sm:text-xs font-medium text-slate">Total Expenses</p>
            <p className="text-base sm:text-lg font-mono font-semibold text-ink mt-1">
              {formatCents(summary.totalExpensesCents)}
            </p>
          </div>
          <div className="bg-linen rounded-xl p-4">
            <p className="text-sm sm:text-xs font-medium text-slate">Avg Margin</p>
            <p
              className={cn(
                "text-lg font-mono font-semibold mt-1",
                summary.avgMarginBasisPoints >= 0 ? "text-success" : "text-error",
              )}
            >
              {formatBasisPoints(summary.avgMarginBasisPoints as BasisPoints)}
            </p>
          </div>
        </div>
      )}

      {/* Visual Comparison */}
      {projects.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Revenue vs Expenses by Project</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {/* Legend */}
              <div className="flex items-center gap-4 mb-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm bg-terracotta-500" />
                  <span className="text-xs text-slate">Revenue</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm bg-stone/40" />
                  <span className="text-xs text-slate">Expenses</span>
                </div>
              </div>
              {(() => {
                const maxVal = Math.max(
                  ...projects.map((p) =>
                    Math.max(p.invoicedCents as number, p.expensesCents as number),
                  ),
                  1,
                );
                return projects.map((project) => {
                  const revPct = ((project.invoicedCents as number) / maxVal) * 100;
                  const expPct = ((project.expensesCents as number) / maxVal) * 100;
                  return (
                    <div key={project.projectId} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span
                          className="text-sm text-ink font-medium truncate max-w-[200px]"
                          title={project.projectName}
                        >
                          {project.projectName}
                        </span>
                        <span
                          className={cn(
                            "text-xs font-mono font-medium",
                            (project.profitCents as number) >= 0 ? "text-success" : "text-error",
                          )}
                        >
                          {formatBasisPoints(project.marginBasisPoints as BasisPoints)} margin
                        </span>
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-3 bg-stone/5 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-terracotta-500 rounded-full transition-all"
                              style={{ width: `${Math.max(1, revPct)}%` }}
                            />
                          </div>
                          <span className="text-xs font-mono text-slate w-24 text-right">
                            {formatCents(project.invoicedCents as number)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-3 bg-stone/5 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-stone/40 rounded-full transition-all"
                              style={{ width: `${Math.max(1, expPct)}%` }}
                            />
                          </div>
                          <span className="text-xs font-mono text-slate w-24 text-right">
                            {formatCents(project.expensesCents as number)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Project Profitability</CardTitle>
        </CardHeader>
        <CardContent>
          {projects.length === 0 ? (
            <p className="text-sm text-slate text-center py-8">No project data available.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-stone/10">
                    <th className="text-left text-label text-slate px-3 py-2 font-medium">
                      Project
                    </th>
                    <th className="text-left text-label text-slate px-3 py-2 font-medium">Type</th>
                    <th className="text-center text-label text-slate px-3 py-2 font-medium">
                      Status
                    </th>
                    <th className="text-right text-label text-slate px-3 py-2 font-medium">
                      Budget
                    </th>
                    <th className="text-right text-label text-slate px-3 py-2 font-medium">
                      Invoiced
                    </th>
                    <th className="text-right text-label text-slate px-3 py-2 font-medium">
                      Expenses
                    </th>
                    <th className="text-right text-label text-slate px-3 py-2 font-medium">
                      Profit
                    </th>
                    <th className="text-right text-label text-slate px-3 py-2 font-medium">
                      Margin
                    </th>
                    <th className="text-right text-label text-slate px-3 py-2 font-medium">
                      Budget Used
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((project) => (
                    <tr
                      key={project.projectId}
                      className="border-b border-stone/5 hover:bg-linen/50 transition-colors"
                    >
                      <td className="px-3 py-3 text-sm font-medium text-ink">
                        {project.projectName}
                      </td>
                      <td className="px-3 py-3 text-sm text-slate">
                        {PROJECT_TYPE_LABELS[project.projectType] ?? project.projectType}
                      </td>
                      <td className="px-3 py-3 text-center">
                        <StatusBadge
                          label={project.status}
                          variant={getProjectStatusVariant(project.status)}
                        />
                      </td>
                      <td className="px-3 py-3 text-sm text-right font-mono text-slate">
                        {(project.budgetCents as number) > 0
                          ? formatCents(project.budgetCents as number)
                          : "--"}
                      </td>
                      <td className="px-3 py-3 text-sm text-right font-mono text-ink">
                        {formatCents(project.invoicedCents as number)}
                      </td>
                      <td className="px-3 py-3 text-sm text-right font-mono text-slate">
                        {formatCents(project.expensesCents as number)}
                      </td>
                      <td
                        className={cn(
                          "px-3 py-3 text-sm text-right font-mono font-medium",
                          (project.profitCents as number) >= 0 ? "text-success" : "text-error",
                        )}
                      >
                        {formatCents(project.profitCents as number)}
                      </td>
                      <td
                        className={cn(
                          "px-3 py-3 text-sm text-right font-mono",
                          project.marginBasisPoints >= 0 ? "text-success" : "text-error",
                        )}
                      >
                        {formatBasisPoints(project.marginBasisPoints as BasisPoints)}
                      </td>
                      <td className="px-3 py-3 text-sm text-right">
                        {project.budgetUtilizationBasisPoints > 0 ? (
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-16 h-2 bg-stone/10 rounded-full overflow-hidden">
                              <div
                                className={cn(
                                  "h-full rounded-full transition-all",
                                  project.budgetUtilizationBasisPoints > 10000
                                    ? "bg-error"
                                    : project.budgetUtilizationBasisPoints > 8000
                                      ? "bg-warning"
                                      : "bg-success",
                                )}
                                style={{
                                  width: `${Math.min(100, project.budgetUtilizationBasisPoints / 100)}%`,
                                }}
                              />
                            </div>
                            <span className="text-xs font-mono text-slate">
                              {formatBasisPoints(
                                project.budgetUtilizationBasisPoints as BasisPoints,
                              )}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-stone">--</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
