import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, AuthError } from "@/lib/auth-utils";
import { calculateAgingBuckets } from "@/lib/financial/ar-aging";

/**
 * GET /api/ar-aging
 * Returns AR aging summary for the current organization.
 * Groups outstanding invoices into aging buckets.
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

  const projectId = request.nextUrl.searchParams.get("projectId");

  // Fetch all outstanding invoices for the organization
  const where: Record<string, unknown> = {
    organizationId: user.organizationId,
    deletedAt: null,
    balanceDueCents: { gt: 0 },
    status: {
      in: ["SENT", "VIEWED", "PARTIALLY_PAID", "OVERDUE"],
    },
  };

  if (projectId) {
    where.projectId = projectId;
  }

  const invoices = await prisma.invoice.findMany({
    where,
    select: {
      id: true,
      invoiceNumber: true,
      clientName: true,
      balanceDueCents: true,
      dueDate: true,
      status: true,
      totalCents: true,
      project: { select: { id: true, name: true } },
    },
    orderBy: { dueDate: "asc" },
  });

  const aging = calculateAgingBuckets(invoices);

  return NextResponse.json({
    aging,
    invoices: invoices.map((inv) => ({
      id: inv.id,
      invoiceNumber: inv.invoiceNumber,
      clientName: inv.clientName,
      balanceDueCents: inv.balanceDueCents,
      totalCents: inv.totalCents,
      dueDate: inv.dueDate.toISOString(),
      status: inv.status,
      daysOverdue: Math.max(
        0,
        Math.floor((Date.now() - inv.dueDate.getTime()) / (1000 * 60 * 60 * 24)),
      ),
      project: inv.project,
    })),
  });
}
