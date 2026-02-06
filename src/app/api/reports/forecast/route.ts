import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, AuthError } from "@/lib/auth-utils";
import { generateCashFlowForecast } from "@/lib/financial/forecast";
import { UserRole } from "@prisma/client";

export async function GET(request: NextRequest) {
  let user;
  try {
    user = await requireRole(UserRole.MANAGER);
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    throw error;
  }

  const params = request.nextUrl.searchParams;
  const weeks = parseInt(params.get("weeks") ?? "12", 10);
  const startingBalance = parseInt(params.get("startingBalance") ?? "0", 10);

  // Fetch outstanding invoices
  const invoices = await prisma.invoice.findMany({
    where: {
      organizationId: user.organizationId,
      deletedAt: null,
      balanceDueCents: { gt: 0 },
      status: { in: ["SENT", "VIEWED", "PARTIALLY_PAID", "OVERDUE"] },
    },
    select: {
      balanceDueCents: true,
      dueDate: true,
      status: true,
    },
  });

  // Fetch approved expenses not yet reimbursed (upcoming outflows)
  const expenses = await prisma.expense.findMany({
    where: {
      organizationId: user.organizationId,
      deletedAt: null,
      status: { in: ["APPROVED", "SUBMITTED"] },
      date: { gte: new Date() },
    },
    select: {
      amountCents: true,
      date: true,
    },
  });

  const forecast = generateCashFlowForecast({
    startingBalanceCents: startingBalance,
    outstandingInvoices: invoices,
    plannedExpenses: expenses,
    weeks: Math.min(weeks, 52),
  });

  return NextResponse.json({ forecast });
}
