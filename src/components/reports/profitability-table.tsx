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
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <div className="bg-linen rounded-xl p-4">
            <p className="text-xs font-medium text-slate">Projects</p>
            <p className="text-lg font-semibold text-ink mt-1">{summary.projectCount}</p>
          </div>
          <div className="bg-linen rounded-xl p-4">
            <p className="text-xs font-medium text-slate">Total Invoiced</p>
            <p className="text-lg font-mono font-semibold text-ink mt-1">
              {formatCents(summary.totalInvoicedCents)}
            </p>
          </div>
          <div className="bg-linen rounded-xl p-4">
            <p className="text-xs font-medium text-slate">Total Received</p>
            <p className="text-lg font-mono font-semibold text-ink mt-1">
              {formatCents(summary.totalReceivedCents)}
            </p>
          </div>
          <div className="bg-linen rounded-xl p-4">
            <p className="text-xs font-medium text-slate">Total Expenses</p>
            <p className="text-lg font-mono font-semibold text-ink mt-1">
              {formatCents(summary.totalExpensesCents)}
            </p>
          </div>
          <div className="bg-linen rounded-xl p-4">
            <p className="text-xs font-medium text-slate">Avg Margin</p>
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

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Project Profitability</CardTitle>
        </CardHeader>
        <CardContent>
          {projects.length === 0 ? (
            <p className="text-sm text-slate text-center py-8">
              No project data available.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-stone/10">
                    <th className="text-left text-label text-slate px-3 py-2 font-medium">
                      Project
                    </th>
                    <th className="text-left text-label text-slate px-3 py-2 font-medium">
                      Type
                    </th>
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
                              {formatBasisPoints(project.budgetUtilizationBasisPoints as BasisPoints)}
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
