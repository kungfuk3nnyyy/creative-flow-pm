import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, AuthError } from "@/lib/auth-utils";

/**
 * GET /api/reports/dashboard
 * Returns all dashboard KPIs in a single request.
 * Consolidated to minimize round-trips.
 */
export async function GET(request: NextRequest) {
  let user;
  try {
    user = await requireAuth();
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    throw error;
  }

  const orgId = user.organizationId;
  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

  // Run all queries in parallel
  const [
    projectCounts,
    activeProjects,
    invoiceSummary,
    expenseSummary,
    paymentsSummary,
    overdueInvoices,
    pendingExpenses,
    recentActivity,
    teamSize,
    pendingApprovalExpenses,
    staleDraftInvoices,
    overdueTasks,
  ] = await Promise.all([
    // Project counts by status
    prisma.project.groupBy({
      by: ["status"],
      where: { organizationId: orgId },
      _count: { id: true },
    }),

    // Active projects (top 5 by recent activity)
    prisma.project.findMany({
      where: { organizationId: orgId, status: "ACTIVE" },
      select: {
        id: true,
        name: true,
        type: true,
        clientName: true,
        updatedAt: true,
        _count: { select: { milestones: true, expenses: true, invoices: true } },
      },
      orderBy: { updatedAt: "desc" },
      take: 5,
    }),

    // Invoice summary (this month vs last month)
    Promise.all([
      prisma.invoice.aggregate({
        where: {
          organizationId: orgId,
          deletedAt: null,
          status: { not: "DRAFT" },
          issueDate: { gte: startOfMonth },
        },
        _sum: { totalCents: true },
        _count: { id: true },
      }),
      prisma.invoice.aggregate({
        where: {
          organizationId: orgId,
          deletedAt: null,
          status: { not: "DRAFT" },
          issueDate: { gte: startOfLastMonth, lte: endOfLastMonth },
        },
        _sum: { totalCents: true },
        _count: { id: true },
      }),
    ]),

    // Expense summary (this month vs last month)
    Promise.all([
      prisma.expense.aggregate({
        where: {
          organizationId: orgId,
          deletedAt: null,
          status: "APPROVED",
          date: { gte: startOfMonth },
        },
        _sum: { amountCents: true },
        _count: { id: true },
      }),
      prisma.expense.aggregate({
        where: {
          organizationId: orgId,
          deletedAt: null,
          status: "APPROVED",
          date: { gte: startOfLastMonth, lte: endOfLastMonth },
        },
        _sum: { amountCents: true },
        _count: { id: true },
      }),
    ]),

    // Payments received this month
    prisma.payment.aggregate({
      where: {
        invoice: { organizationId: orgId, deletedAt: null },
        paymentDate: { gte: startOfMonth },
      },
      _sum: { amountCents: true },
      _count: { id: true },
    }),

    // Overdue invoices
    prisma.invoice.findMany({
      where: {
        organizationId: orgId,
        deletedAt: null,
        status: "OVERDUE",
        balanceDueCents: { gt: 0 },
      },
      select: {
        id: true,
        invoiceNumber: true,
        clientName: true,
        balanceDueCents: true,
        dueDate: true,
      },
      orderBy: { dueDate: "asc" },
      take: 5,
    }),

    // Pending expense approvals
    prisma.expense.count({
      where: {
        organizationId: orgId,
        deletedAt: null,
        status: "SUBMITTED",
      },
    }),

    // Recent activity (last 10)
    prisma.activityLog.findMany({
      where: { organizationId: orgId },
      select: {
        id: true,
        action: true,
        entityType: true,
        entityId: true,
        createdAt: true,
        user: { select: { name: true } },
        project: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),

    // Team size
    prisma.user.count({
      where: { organizationId: orgId },
    }),

    // Pending actions: expenses awaiting approval (top 5)
    prisma.expense.findMany({
      where: {
        organizationId: orgId,
        deletedAt: null,
        status: "SUBMITTED",
      },
      select: {
        id: true,
        description: true,
        amountCents: true,
        project: { select: { id: true, name: true } },
        submittedBy: { select: { name: true } },
      },
      orderBy: { createdAt: "asc" },
      take: 5,
    }),

    // Pending actions: draft invoices older than 3 days
    prisma.invoice.findMany({
      where: {
        organizationId: orgId,
        deletedAt: null,
        status: "DRAFT",
        createdAt: {
          lt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
        },
      },
      select: {
        id: true,
        invoiceNumber: true,
        clientName: true,
        totalCents: true,
        project: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "asc" },
      take: 5,
    }),

    // Pending actions: overdue tasks assigned to current user
    prisma.task.findMany({
      where: {
        milestone: { project: { organizationId: orgId } },
        assigneeId: user.userId,
        status: { not: "DONE" },
        dueDate: { lt: now },
      },
      select: {
        id: true,
        title: true,
        dueDate: true,
        milestone: {
          select: {
            project: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { dueDate: "asc" },
      take: 5,
    }),
  ]);

  // Process project counts
  const statusMap: Record<string, number> = {};
  for (const row of projectCounts) {
    statusMap[row.status] = row._count.id;
  }
  const totalProjects = Object.values(statusMap).reduce((s, v) => s + v, 0);

  // Process invoice trend
  const [thisMonthInvoices, lastMonthInvoices] = invoiceSummary;
  const invoicedThisMonth = thisMonthInvoices._sum.totalCents ?? 0;
  const invoicedLastMonth = lastMonthInvoices._sum.totalCents ?? 0;
  const invoiceTrend =
    invoicedLastMonth > 0
      ? Math.round(((invoicedThisMonth - invoicedLastMonth) / invoicedLastMonth) * 10000)
      : 0;

  // Process expense trend
  const [thisMonthExpenses, lastMonthExpenses] = expenseSummary;
  const expensesThisMonth = thisMonthExpenses._sum.amountCents ?? 0;
  const expensesLastMonth = lastMonthExpenses._sum.amountCents ?? 0;
  const expenseTrend =
    expensesLastMonth > 0
      ? Math.round(((expensesThisMonth - expensesLastMonth) / expensesLastMonth) * 10000)
      : 0;

  // Total outstanding
  const totalOutstanding = overdueInvoices.reduce((s, inv) => s + inv.balanceDueCents, 0);

  const response = NextResponse.json({
    kpis: {
      totalProjects,
      activeProjects: statusMap["ACTIVE"] ?? 0,
      invoicedThisMonth,
      invoicedLastMonth,
      invoiceTrendBasisPoints: invoiceTrend,
      expensesThisMonth,
      expensesLastMonth,
      expenseTrendBasisPoints: expenseTrend,
      receivedThisMonth: paymentsSummary._sum.amountCents ?? 0,
      paymentsCount: paymentsSummary._count.id,
      totalOverdue: totalOutstanding,
      overdueCount: overdueInvoices.length,
      pendingApprovals: pendingExpenses,
      teamSize,
    },
    activeProjects,
    overdueInvoices,
    recentActivity,
    needsAttention: {
      pendingApprovalExpenses,
      staleDraftInvoices,
      overdueTasks,
    },
  });

  response.headers.set("Cache-Control", "private, max-age=60, stale-while-revalidate=120");

  return response;
}
