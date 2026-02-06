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

  const projectId = request.nextUrl.searchParams.get("projectId") ?? undefined;

  const profitability = await calculateProjectProfitability({
    organizationId: user.organizationId,
    projectId,
  });

  // Summary totals
  const summary = {
    totalInvoicedCents: profitability.reduce((s, p) => s + (p.invoicedCents as number), 0),
    totalReceivedCents: profitability.reduce((s, p) => s + (p.receivedCents as number), 0),
    totalExpensesCents: profitability.reduce((s, p) => s + (p.expensesCents as number), 0),
    totalProfitCents: profitability.reduce((s, p) => s + (p.profitCents as number), 0),
    projectCount: profitability.length,
  };

  const avgMarginBp =
    summary.totalInvoicedCents > 0
      ? Math.round((summary.totalProfitCents / summary.totalInvoicedCents) * 10000)
      : 0;

  return NextResponse.json({
    projects: profitability,
    summary: { ...summary, avgMarginBasisPoints: avgMarginBp },
  });
}
