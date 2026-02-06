import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { InvoiceStatus } from "@prisma/client";

/**
 * GET /api/cron/overdue-detection
 *
 * Cron job to mark invoices as OVERDUE when past their due date.
 * Protected by CRON_SECRET header in production.
 * Runs daily via Vercel Cron.
 */
export async function GET(request: NextRequest) {
  // Verify cron secret in production
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const now = new Date();

  // Find invoices that are past due but not yet marked as OVERDUE
  const eligibleStatuses = [
    InvoiceStatus.SENT,
    InvoiceStatus.VIEWED,
    InvoiceStatus.PARTIALLY_PAID,
  ];

  const result = await prisma.invoice.updateMany({
    where: {
      status: { in: eligibleStatuses },
      dueDate: { lt: now },
      balanceDueCents: { gt: 0 },
      deletedAt: null,
    },
    data: {
      status: InvoiceStatus.OVERDUE,
    },
  });

  return NextResponse.json({
    success: true,
    markedOverdue: result.count,
    timestamp: now.toISOString(),
  });
}
