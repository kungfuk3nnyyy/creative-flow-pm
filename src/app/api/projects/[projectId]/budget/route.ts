import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, AuthError } from "@/lib/auth-utils";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> },
) {
  let user;
  try {
    user = await requireAuth();
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode },
      );
    }
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 },
    );
  }

  const { projectId } = await params;

  const project = await prisma.project.findFirst({
    where: { id: projectId, organizationId: user.organizationId },
    select: { id: true },
  });

  if (!project) {
    return NextResponse.json(
      { error: "Project not found." },
      { status: 404 },
    );
  }

  const budget = await prisma.budget.findFirst({
    where: { projectId },
    include: {
      categories: {
        orderBy: { sortOrder: "asc" },
        include: {
          _count: { select: { expenses: true } },
          expenses: {
            where: {
              status: { in: ["APPROVED", "REIMBURSED"] },
              deletedAt: null,
            },
            select: { amountCents: true },
          },
        },
      },
    },
  });

  if (!budget) {
    return NextResponse.json({ budget: null });
  }

  // Calculate spent per category
  const categoriesWithSpent = budget.categories.map((cat) => {
    const spentCents = cat.expenses.reduce(
      (sum, exp) => sum + exp.amountCents,
      0,
    );
    return {
      id: cat.id,
      name: cat.name,
      allocatedCents: cat.allocatedCents,
      sortOrder: cat.sortOrder,
      spentCents,
      remainingCents: cat.allocatedCents - spentCents,
      isOverBudget: spentCents > cat.allocatedCents,
      expenseCount: cat._count.expenses,
    };
  });

  const totalAllocated = categoriesWithSpent.reduce(
    (sum, c) => sum + c.allocatedCents,
    0,
  );
  const totalSpent = categoriesWithSpent.reduce(
    (sum, c) => sum + c.spentCents,
    0,
  );

  return NextResponse.json({
    budget: {
      id: budget.id,
      totalAmountCents: budget.totalAmountCents,
      notes: budget.notes,
      approvedAt: budget.approvedAt,
      categories: categoriesWithSpent,
      summary: {
        totalAllocated,
        totalUnallocated: budget.totalAmountCents - totalAllocated,
        totalSpent,
        totalRemaining: budget.totalAmountCents - totalSpent,
      },
    },
  });
}
