import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { InvoiceStatus } from "@prisma/client";

/**
 * GET /api/cron/payment-reminders
 *
 * Cron job to identify invoices due soon or recently overdue.
 * In production, this would trigger email reminders via Resend.
 * Runs weekly via Vercel Cron.
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
  const sevenDaysFromNow = new Date(now);
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

  // Find invoices due within the next 7 days
  const dueSoon = await prisma.invoice.findMany({
    where: {
      status: { in: [InvoiceStatus.SENT, InvoiceStatus.VIEWED] },
      dueDate: {
        gte: now,
        lte: sevenDaysFromNow,
      },
      balanceDueCents: { gt: 0 },
      deletedAt: null,
    },
    select: {
      id: true,
      invoiceNumber: true,
      clientName: true,
      clientEmail: true,
      dueDate: true,
      balanceDueCents: true,
      project: { select: { name: true } },
    },
  });

  // Find recently overdue invoices (1-7 days past due)
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const recentlyOverdue = await prisma.invoice.findMany({
    where: {
      status: InvoiceStatus.OVERDUE,
      dueDate: {
        gte: sevenDaysAgo,
        lt: now,
      },
      balanceDueCents: { gt: 0 },
      deletedAt: null,
    },
    select: {
      id: true,
      invoiceNumber: true,
      clientName: true,
      clientEmail: true,
      dueDate: true,
      balanceDueCents: true,
      project: { select: { name: true } },
    },
  });

  // In production, send email reminders via Resend here
  // For now, just return the counts

  return NextResponse.json({
    success: true,
    dueSoon: dueSoon.length,
    recentlyOverdue: recentlyOverdue.length,
    timestamp: now.toISOString(),
  });
}
