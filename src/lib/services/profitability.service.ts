import { prisma } from "@/lib/prisma";
import { cents, type Cents } from "@/lib/financial/types";

export interface ProjectProfitability {
  projectId: string;
  projectName: string;
  projectType: string;
  status: string;
  budgetCents: Cents;
  invoicedCents: Cents;
  receivedCents: Cents;
  expensesCents: Cents;
  profitCents: Cents;
  marginBasisPoints: number;
  budgetUtilizationBasisPoints: number;
}

/**
 * Calculate profitability for all projects in an organization,
 * or for a single project.
 */
export interface ProfitabilityResult {
  projects: ProjectProfitability[];
  total: number;
}

export async function calculateProjectProfitability(params: {
  organizationId: string;
  projectId?: string;
  page?: number;
  pageSize?: number;
}): Promise<ProfitabilityResult> {
  const { organizationId, projectId, page = 1, pageSize = 20 } = params;

  const where = {
    organizationId,
    ...(projectId ? { id: projectId } : {}),
  };

  const [projects, total] = await Promise.all([
    prisma.project.findMany({
      where,
      select: {
        id: true,
        name: true,
        type: true,
        status: true,
        budgets: {
          select: {
            totalAmountCents: true,
          },
          take: 1,
        },
        invoices: {
          where: { deletedAt: null, status: { not: "DRAFT" } },
          select: {
            totalCents: true,
            balanceDueCents: true,
            payments: { select: { amountCents: true } },
          },
        },
        expenses: {
          where: { deletedAt: null, status: "APPROVED" },
          select: { amountCents: true },
        },
      },
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.project.count({ where }),
  ]);

  const result = projects.map((project) => {
    const budgetTotal = project.budgets[0]?.totalAmountCents ?? 0;

    const invoicedTotal = project.invoices.reduce((sum, inv) => sum + inv.totalCents, 0);

    const receivedTotal = project.invoices.reduce(
      (sum, inv) => sum + inv.payments.reduce((s, p) => s + p.amountCents, 0),
      0,
    );

    const expensesTotal = project.expenses.reduce((sum, exp) => sum + exp.amountCents, 0);

    const profit = invoicedTotal - expensesTotal;
    const marginBp = invoicedTotal > 0 ? Math.round((profit / invoicedTotal) * 10000) : 0;
    const budgetUtilBp = budgetTotal > 0 ? Math.round((expensesTotal / budgetTotal) * 10000) : 0;

    return {
      projectId: project.id,
      projectName: project.name,
      projectType: project.type,
      status: project.status,
      budgetCents: cents(budgetTotal),
      invoicedCents: cents(invoicedTotal),
      receivedCents: cents(receivedTotal),
      expensesCents: cents(expensesTotal),
      profitCents: cents(profit),
      marginBasisPoints: marginBp,
      budgetUtilizationBasisPoints: budgetUtilBp,
    };
  });

  return { projects: result, total };
}
