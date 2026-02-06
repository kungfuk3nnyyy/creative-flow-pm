import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import {
  Calendar,
  Mail,
  Phone,
  MapPin,
  Users,
  Milestone,
  Receipt,
  FileText,
  TrendingUp,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PROJECT_TYPE_LABELS } from "@/lib/validations/project";
import { formatCents } from "@/lib/financial/budget";

export default async function ProjectOverviewPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const session = await auth();
  if (!session?.user?.organizationId) {
    notFound();
  }

  const { projectId } = await params;

  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      organizationId: session.user.organizationId,
    },
    include: {
      teams: {
        include: {
          team: {
            select: { id: true, name: true },
          },
        },
      },
      _count: {
        select: {
          milestones: true,
          expenses: true,
          invoices: true,
          files: true,
        },
      },
    },
  });

  if (!project) {
    notFound();
  }

  // Fetch financial aggregates in parallel
  const [budgetAgg, expenseAgg, invoiceAgg, paymentAgg] = await Promise.all([
    prisma.budgetCategory.aggregate({
      where: { budget: { projectId } },
      _sum: { allocatedCents: true },
    }),
    prisma.expense.aggregate({
      where: { projectId, status: "APPROVED", deletedAt: null },
      _sum: { amountCents: true },
    }),
    prisma.invoice.aggregate({
      where: { projectId, deletedAt: null },
      _sum: { totalCents: true, balanceDueCents: true },
    }),
    prisma.payment.aggregate({
      where: { invoice: { projectId, deletedAt: null } },
      _sum: { amountCents: true },
    }),
  ]);

  const financials = {
    budgetTotal: budgetAgg._sum.allocatedCents ?? 0,
    expensesApproved: expenseAgg._sum.amountCents ?? 0,
    invoicedTotal: invoiceAgg._sum.totalCents ?? 0,
    paymentsReceived: paymentAgg._sum.amountCents ?? 0,
    outstandingBalance: invoiceAgg._sum.balanceDueCents ?? 0,
  };

  const budgetUtilization =
    financials.budgetTotal > 0
      ? Math.round((financials.expensesApproved / financials.budgetTotal) * 100)
      : 0;

  const formatDate = (date: Date | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
      {/* Main Content - 8 cols */}
      <div className="lg:col-span-8 space-y-6">
        {/* Description */}
        <Card>
          <CardHeader>
            <CardTitle>About</CardTitle>
          </CardHeader>
          <CardContent>
            {project.description ? (
              <p className="text-body-sm text-slate whitespace-pre-wrap">{project.description}</p>
            ) : (
              <p className="text-body-sm text-stone text-center py-4">No description provided.</p>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard icon={Milestone} label="Milestones" value={project._count.milestones} />
          <StatCard icon={Receipt} label="Expenses" value={project._count.expenses} />
          <StatCard icon={FileText} label="Invoices" value={project._count.invoices} />
          <StatCard icon={Users} label="Teams" value={project.teams.length} />
        </div>

        {/* Financial Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-stone" />
              Financial Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <FinancialItem label="Budget" value={formatCents(financials.budgetTotal)} />
              <FinancialItem
                label="Expenses (Approved)"
                value={formatCents(financials.expensesApproved)}
              />
              <FinancialItem label="Invoiced" value={formatCents(financials.invoicedTotal)} />
              <FinancialItem
                label="Payments Received"
                value={formatCents(financials.paymentsReceived)}
              />
              <FinancialItem
                label="Outstanding"
                value={formatCents(financials.outstandingBalance)}
                highlight={financials.outstandingBalance > 0}
              />
            </div>

            {financials.budgetTotal > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate">Budget Utilization</span>
                  <span className="text-ink font-medium">{budgetUtilization}%</span>
                </div>
                <div className="w-full h-2 bg-stone/10 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      budgetUtilization > 100
                        ? "bg-error"
                        : budgetUtilization > 80
                          ? "bg-warning"
                          : "bg-terracotta-500"
                    }`}
                    style={{ width: `${Math.min(budgetUtilization, 100)}%` }}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Teams */}
        {project.teams.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Assigned Teams</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {project.teams.map((pt) => (
                  <span
                    key={pt.team.id}
                    className="inline-flex items-center px-3 py-1.5 rounded-lg bg-linen text-sm text-ink font-medium"
                  >
                    <Users className="w-3.5 h-3.5 mr-1.5 text-slate" />
                    {pt.team.name}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Sidebar - 4 cols */}
      <div className="lg:col-span-4 space-y-6">
        {/* Project Details */}
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <DetailRow label="Type">{PROJECT_TYPE_LABELS[project.type] ?? project.type}</DetailRow>
            <DetailRow label="Created">{formatDate(project.createdAt)}</DetailRow>
            <DetailRow label="Start Date" icon={Calendar}>
              {formatDate(project.startDate)}
            </DetailRow>
            <DetailRow label="End Date" icon={Calendar}>
              {formatDate(project.endDate)}
            </DetailRow>
          </CardContent>
        </Card>

        {/* Client Info */}
        {project.clientName && (
          <Card>
            <CardHeader>
              <CardTitle>Client</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm font-medium text-ink">{project.clientName}</p>
              {project.clientEmail && (
                <div className="flex items-center gap-2 text-sm text-slate">
                  <Mail className="w-4 h-4 text-stone" />
                  <a
                    href={`mailto:${project.clientEmail}`}
                    className="hover:text-terracotta-500 transition-colors"
                  >
                    {project.clientEmail}
                  </a>
                </div>
              )}
              {project.clientPhone && (
                <div className="flex items-center gap-2 text-sm text-slate">
                  <Phone className="w-4 h-4 text-stone" />
                  {project.clientPhone}
                </div>
              )}
              {project.clientAddress && (
                <div className="flex items-start gap-2 text-sm text-slate">
                  <MapPin className="w-4 h-4 text-stone shrink-0 mt-0.5" />
                  <span className="whitespace-pre-wrap">{project.clientAddress}</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
}) {
  return (
    <div className="bg-paper rounded-xl border border-stone/10 p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4 text-stone" />
        <span className="text-caption text-slate">{label}</span>
      </div>
      <span className="text-h3 text-ink">{value}</span>
    </div>
  );
}

function DetailRow({
  label,
  children,
  icon: Icon,
}: {
  label: string;
  children: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-slate flex items-center gap-1.5">
        {Icon && <Icon className="w-3.5 h-3.5" />}
        {label}
      </span>
      <span className="text-sm text-ink font-medium">{children}</span>
    </div>
  );
}

function FinancialItem({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div>
      <p className="text-xs text-slate mb-1">{label}</p>
      <p
        className={`text-sm font-mono font-medium ${highlight ? "text-terracotta-600" : "text-ink"}`}
      >
        {value}
      </p>
    </div>
  );
}
