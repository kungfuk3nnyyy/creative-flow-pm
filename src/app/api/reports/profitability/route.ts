import { NextRequest, NextResponse } from "next/server";
import { requireRole, AuthError } from "@/lib/auth-utils";
import { calculateProjectProfitability } from "@/lib/services/profitability.service";
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

  const { searchParams } = request.nextUrl;
  const projectId = searchParams.get("projectId") ?? undefined;
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") ?? "20", 10)));

  const { projects: profitability, total } = await calculateProjectProfitability({
    organizationId: user.organizationId,
    projectId,
    page,
    pageSize,
  });

  // Summary totals
  const summary = {
    totalInvoicedCents: profitability.reduce((s, p) => s + (p.invoicedCents as number), 0),
    totalReceivedCents: profitability.reduce((s, p) => s + (p.receivedCents as number), 0),
    totalExpensesCents: profitability.reduce((s, p) => s + (p.expensesCents as number), 0),
    totalProfitCents: profitability.reduce((s, p) => s + (p.profitCents as number), 0),
    projectCount: total,
  };

  const avgMarginBp =
    summary.totalInvoicedCents > 0
      ? Math.round((summary.totalProfitCents / summary.totalInvoicedCents) * 10000)
      : 0;

  return NextResponse.json({
    projects: profitability,
    summary: { ...summary, avgMarginBasisPoints: avgMarginBp },
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  });
}
