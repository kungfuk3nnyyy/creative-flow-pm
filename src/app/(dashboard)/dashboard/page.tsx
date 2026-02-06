"use client";

import Link from "next/link";
import { FolderKanban, DollarSign, AlertCircle, Wallet, Receipt, Clock, Users } from "lucide-react";
import { useDashboard } from "@/hooks/use-dashboard";
import { formatCents } from "@/lib/financial/budget";
import { PROJECT_TYPE_LABELS } from "@/lib/validations/project";
import { PageHeader } from "@/components/shared/page-header";
import { KPICard, KPICardSkeleton } from "@/components/dashboard/kpi-card";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";

function formatTrendChange(currentCents: number, previousCents: number, label: string): string {
  if (currentCents === 0 && previousCents === 0) return `No activity yet`;
  if (previousCents === 0 && currentCents > 0) return `New activity this month`;
  if (currentCents === 0 && previousCents > 0) return `No activity this month`;
  const basisPoints = Math.round(((currentCents - previousCents) / previousCents) * 10000);
  if (basisPoints === 0) return `No change from ${label}`;
  const pct = (basisPoints / 100).toFixed(1);
  const direction = basisPoints > 0 ? "+" : "";
  return `${direction}${pct}% vs ${label}`;
}

function trendDirection(
  currentCents: number,
  previousCents: number,
  inverted = false,
): "up" | "down" | "neutral" {
  if (currentCents === 0 && previousCents === 0) return "neutral";
  if (previousCents === 0 && currentCents > 0) return inverted ? "down" : "up";
  if (currentCents === 0 && previousCents > 0) return inverted ? "up" : "down";
  const basisPoints = Math.round(((currentCents - previousCents) / previousCents) * 10000);
  if (basisPoints === 0) return "neutral";
  const isUp = inverted ? basisPoints < 0 : basisPoints > 0;
  return isUp ? "up" : "down";
}

function formatAction(action: string): string {
  const map: Record<string, string> = {
    "project.created": "Created project",
    "project.updated": "Updated project",
    "project.status_changed": "Changed project status",
    "expense.created": "Added expense",
    "expense.submitted": "Submitted expense",
    "expense.approved": "Approved expense",
    "expense.rejected": "Rejected expense",
    "invoice.created": "Created invoice",
    "invoice.sent": "Sent invoice",
    "payment.recorded": "Recorded payment",
    "budget.created": "Created budget",
    "file.uploaded": "Uploaded file",
    "comment.created": "Added comment",
    "milestone.created": "Created milestone",
    "task.created": "Created task",
  };
  return map[action] ?? action.replace(/\./g, " ").replace(/^\w/, (c) => c.toUpperCase());
}

export default function DashboardPage() {
  const { data, isLoading } = useDashboard();

  const kpis = data?.kpis;
  const activeProjects = data?.activeProjects ?? [];
  const overdueInvoices = data?.overdueInvoices ?? [];
  const recentActivity = data?.recentActivity ?? [];
  const needsAttention = data?.needsAttention;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description="Welcome back. Here is what is happening today."
        actions={
          <Link href="/projects/new">
            <Button variant="accent">New Project</Button>
          </Link>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {isLoading ? (
          <>
            <KPICardSkeleton />
            <KPICardSkeleton />
            <KPICardSkeleton />
            <KPICardSkeleton />
          </>
        ) : kpis ? (
          <>
            <KPICard
              label="Active Projects"
              value={String(kpis.activeProjects)}
              change={`${kpis.totalProjects} total projects`}
              trend="neutral"
              icon={FolderKanban}
            />
            <KPICard
              label="Invoiced This Month"
              value={formatCents(kpis.invoicedThisMonth)}
              change={formatTrendChange(
                kpis.invoicedThisMonth,
                kpis.invoicedLastMonth,
                "last month",
              )}
              trend={trendDirection(kpis.invoicedThisMonth, kpis.invoicedLastMonth)}
              icon={DollarSign}
            />
            <KPICard
              label="Expenses This Month"
              value={formatCents(kpis.expensesThisMonth)}
              change={formatTrendChange(
                kpis.expensesThisMonth,
                kpis.expensesLastMonth,
                "last month",
              )}
              trend={trendDirection(kpis.expensesThisMonth, kpis.expensesLastMonth, true)}
              icon={Receipt}
            />
            <KPICard
              label="Overdue"
              value={formatCents(kpis.totalOverdue)}
              change={
                kpis.overdueCount > 0
                  ? `${kpis.overdueCount} overdue invoice${kpis.overdueCount !== 1 ? "s" : ""}`
                  : "No overdue invoices"
              }
              trend={kpis.overdueCount > 0 ? "warning" : "neutral"}
              icon={AlertCircle}
            />
          </>
        ) : null}
      </div>

      {/* Second Row KPIs */}
      {kpis && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <KPICard
            label="Received This Month"
            value={formatCents(kpis.receivedThisMonth)}
            change={`${kpis.paymentsCount} payment${kpis.paymentsCount !== 1 ? "s" : ""}`}
            trend={kpis.receivedThisMonth > 0 ? "up" : "neutral"}
            icon={Wallet}
          />
          <KPICard
            label="Pending Approvals"
            value={String(kpis.pendingApprovals)}
            change="Expenses awaiting review"
            trend={kpis.pendingApprovals > 0 ? "warning" : "neutral"}
            icon={Clock}
          />
          <KPICard
            label="Team Members"
            value={String(kpis.teamSize)}
            change="Organization members"
            trend="neutral"
            icon={Users}
          />
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Active Projects - 8 cols */}
        <div className="xl:col-span-8 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Active Projects</CardTitle>
              <Link
                href="/projects"
                className="text-sm text-terracotta-500 hover:text-terracotta-600 font-medium transition-colors"
              >
                View all
              </Link>
            </CardHeader>
            <CardContent>
              {activeProjects.length === 0 ? (
                <EmptyState
                  icon={FolderKanban}
                  title="No projects yet"
                  description="Create your first project to start tracking budgets, milestones, and invoices."
                  actionLabel="Create Project"
                  actionHref="/projects/new"
                />
              ) : (
                <div className="space-y-2">
                  {activeProjects.map((project) => (
                    <Link
                      key={project.id}
                      href={`/projects/${project.id}`}
                      className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-linen transition-colors"
                    >
                      <div>
                        <span className="text-sm font-medium text-ink">{project.name}</span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-stone">
                            {PROJECT_TYPE_LABELS[project.type] ?? project.type}
                          </span>
                          {project.clientName && (
                            <span className="text-xs text-stone">-- {project.clientName}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-stone">
                        <span>{project._count.milestones} milestones</span>
                        <span>{project._count.expenses} expenses</span>
                        <span>{project._count.invoices} invoices</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Overdue Invoices */}
          {overdueInvoices.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Overdue Invoices</CardTitle>
                <Link
                  href="/ar-aging"
                  className="text-sm text-terracotta-500 hover:text-terracotta-600 font-medium transition-colors"
                >
                  View AR Aging
                </Link>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {overdueInvoices.map((inv) => {
                    const daysOverdue = Math.floor(
                      (Date.now() - new Date(inv.dueDate).getTime()) / (1000 * 60 * 60 * 24),
                    );
                    return (
                      <div
                        key={inv.id}
                        className="flex items-center justify-between px-4 py-3 rounded-xl bg-error-soft/30"
                      >
                        <div>
                          <span className="text-sm font-mono font-medium text-ink">
                            {inv.invoiceNumber}
                          </span>
                          <span className="text-sm text-slate ml-2">{inv.clientName}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-xs text-error font-medium">
                            {daysOverdue} days overdue
                          </span>
                          <span className="text-sm font-mono font-medium text-ink">
                            {formatCents(inv.balanceDueCents)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
          {/* Needs Attention */}
          {needsAttention &&
            (needsAttention.pendingApprovalExpenses.length > 0 ||
              needsAttention.staleDraftInvoices.length > 0 ||
              needsAttention.overdueTasks.length > 0) && (
              <Card>
                <CardHeader>
                  <CardTitle>Needs Attention</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {needsAttention.pendingApprovalExpenses.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-slate mb-2">
                        Expenses Awaiting Approval
                      </p>
                      <div className="space-y-1">
                        {needsAttention.pendingApprovalExpenses.map((exp) => (
                          <Link
                            key={exp.id}
                            href={`/projects/${exp.project.id}/expenses`}
                            className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-linen transition-colors"
                          >
                            <div>
                              <span className="text-sm text-ink">{exp.description}</span>
                              <span className="text-xs text-stone ml-2">
                                by {exp.submittedBy.name} -- {exp.project.name}
                              </span>
                            </div>
                            <span className="text-sm font-mono text-ink">
                              {formatCents(exp.amountCents)}
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {needsAttention.staleDraftInvoices.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-slate mb-2">Stale Draft Invoices</p>
                      <div className="space-y-1">
                        {needsAttention.staleDraftInvoices.map((inv) => (
                          <Link
                            key={inv.id}
                            href={`/projects/${inv.project.id}/invoices`}
                            className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-linen transition-colors"
                          >
                            <div>
                              <span className="text-sm font-mono text-ink">
                                {inv.invoiceNumber}
                              </span>
                              <span className="text-xs text-stone ml-2">
                                {inv.clientName} -- {inv.project.name}
                              </span>
                            </div>
                            <span className="text-sm font-mono text-ink">
                              {formatCents(inv.totalCents)}
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {needsAttention.overdueTasks.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-slate mb-2">Your Overdue Tasks</p>
                      <div className="space-y-1">
                        {needsAttention.overdueTasks.map((task) => (
                          <Link
                            key={task.id}
                            href={`/projects/${task.milestone.project.id}/tasks`}
                            className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-linen transition-colors"
                          >
                            <span className="text-sm text-ink">{task.title}</span>
                            <span className="text-xs text-error">
                              Due{" "}
                              {new Date(task.dueDate).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
        </div>

        {/* Sidebar - 4 cols */}
        <div className="xl:col-span-4 space-y-6">
          {/* Quick Links */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Link
                  href="/projects/new"
                  className="block px-3 py-2 rounded-lg text-sm text-slate hover:bg-linen hover:text-ink transition-colors"
                >
                  Create new project
                </Link>
                <Link
                  href="/reports"
                  className="block px-3 py-2 rounded-lg text-sm text-slate hover:bg-linen hover:text-ink transition-colors"
                >
                  View financial reports
                </Link>
                <Link
                  href="/ar-aging"
                  className="block px-3 py-2 rounded-lg text-sm text-slate hover:bg-linen hover:text-ink transition-colors"
                >
                  Review AR aging
                </Link>
                <Link
                  href="/vendors"
                  className="block px-3 py-2 rounded-lg text-sm text-slate hover:bg-linen hover:text-ink transition-colors"
                >
                  Manage vendors
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {recentActivity.length === 0 ? (
                <p className="text-body-sm text-slate text-center py-6">No recent activity.</p>
              ) : (
                <div className="space-y-3">
                  {recentActivity.map((entry) => (
                    <div key={entry.id} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-stone/40 mt-2 shrink-0" />
                      <div>
                        <p className="text-sm text-ink">
                          <span className="font-medium">{entry.user.name ?? "Someone"}</span>{" "}
                          {formatAction(entry.action).toLowerCase()}
                          {entry.project?.name && (
                            <span className="text-slate"> in {entry.project.name}</span>
                          )}
                        </p>
                        <p className="text-xs text-stone">
                          {new Date(entry.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
