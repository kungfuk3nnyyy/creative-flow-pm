import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { InvoiceStatus } from "@prisma/client";
import { sendEmail } from "@/lib/email/send";
import {
  paymentReminderSubject,
  paymentReminderHtml,
} from "@/lib/email/templates/payment-reminder";
import { overdueNoticeSubject, overdueNoticeHtml } from "@/lib/email/templates/overdue-notice";
import { formatMoney, formatDate } from "@/lib/utils";

/**
 * GET /api/cron/payment-reminders
 *
 * Cron job to identify invoices due soon or recently overdue
 * and send email reminders via Resend.
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
      clientEmail: { not: null },
      deletedAt: null,
    },
    select: {
      id: true,
      invoiceNumber: true,
      clientName: true,
      clientEmail: true,
      dueDate: true,
      balanceDueCents: true,
      organizationId: true,
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
      clientEmail: { not: null },
      deletedAt: null,
    },
    select: {
      id: true,
      invoiceNumber: true,
      clientName: true,
      clientEmail: true,
      dueDate: true,
      balanceDueCents: true,
      organizationId: true,
    },
  });

  // Collect unique org IDs and fetch their names
  const orgIds = new Set([
    ...dueSoon.map((i) => i.organizationId),
    ...recentlyOverdue.map((i) => i.organizationId),
  ]);
  const orgs = await prisma.organization.findMany({
    where: { id: { in: [...orgIds] } },
    select: { id: true, name: true },
  });
  const orgMap = new Map(orgs.map((o) => [o.id, o.name]));

  let remindersSent = 0;
  let overduesSent = 0;

  // Send payment reminders for invoices due soon
  for (const inv of dueSoon) {
    if (!inv.clientEmail) continue;
    const orgName = orgMap.get(inv.organizationId) ?? "CreativeFlow";
    const emailData = {
      clientName: inv.clientName,
      invoiceNumber: inv.invoiceNumber,
      balanceFormatted: formatMoney(inv.balanceDueCents),
      dueDate: formatDate(inv.dueDate),
      orgName,
    };
    const sent = await sendEmail({
      to: inv.clientEmail,
      subject: paymentReminderSubject(emailData),
      html: paymentReminderHtml(emailData),
    });
    if (sent) remindersSent++;
  }

  // Send overdue notices
  for (const inv of recentlyOverdue) {
    if (!inv.clientEmail) continue;
    const orgName = orgMap.get(inv.organizationId) ?? "CreativeFlow";
    const daysOverdue = Math.ceil((now.getTime() - inv.dueDate.getTime()) / (1000 * 60 * 60 * 24));
    const emailData = {
      clientName: inv.clientName,
      invoiceNumber: inv.invoiceNumber,
      balanceFormatted: formatMoney(inv.balanceDueCents),
      dueDate: formatDate(inv.dueDate),
      daysOverdue,
      orgName,
    };
    const sent = await sendEmail({
      to: inv.clientEmail,
      subject: overdueNoticeSubject(emailData),
      html: overdueNoticeHtml(emailData),
    });
    if (sent) overduesSent++;
  }

  return NextResponse.json({
    success: true,
    dueSoon: dueSoon.length,
    recentlyOverdue: recentlyOverdue.length,
    remindersSent,
    overduesSent,
    timestamp: now.toISOString(),
  });
}
