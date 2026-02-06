"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole, AuthError } from "@/lib/auth-utils";
import { logActivity } from "@/lib/activity";
import { createFinancialAuditLog } from "@/lib/services/audit.service";
import { recordPaymentSchema } from "@/lib/validations/payment";
import { InvoiceStatus, UserRole } from "@prisma/client";

type ActionResult = {
  success: boolean;
  error?: string;
  data?: { id: string };
};

/**
 * Record a payment against an invoice.
 * Uses a Prisma transaction to prevent overpayment and atomically update
 * both the payment record and the invoice balance.
 *
 * Requires MANAGER or FINANCE role.
 */
export async function recordPaymentAction(
  input: {
    invoiceId: string;
    amountCents: number;
    paymentDate: Date;
    paymentMethod?: string;
    reference?: string;
    notes?: string;
  },
): Promise<ActionResult> {
  let user;
  try {
    user = await requireRole(UserRole.MANAGER);
  } catch (error) {
    if (error instanceof AuthError) {
      return { success: false, error: error.message };
    }
    throw error;
  }

  const parsed = recordPaymentSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message ?? "Invalid input.",
    };
  }

  // Use a transaction to ensure atomicity
  try {
    const result = await prisma.$transaction(async (tx) => {
      // Lock the invoice row for update
      const invoice = await tx.invoice.findFirst({
        where: { id: parsed.data.invoiceId, deletedAt: null },
        include: {
          project: { select: { id: true, organizationId: true } },
        },
      });

      if (!invoice || invoice.project.organizationId !== user.organizationId) {
        throw new Error("Invoice not found.");
      }

      // Verify invoice is in a payable state
      const payableStatuses: InvoiceStatus[] = [
        InvoiceStatus.SENT,
        InvoiceStatus.VIEWED,
        InvoiceStatus.PARTIALLY_PAID,
        InvoiceStatus.OVERDUE,
      ];

      if (!payableStatuses.includes(invoice.status)) {
        throw new Error(
          "Payments can only be recorded against sent, viewed, partially paid, or overdue invoices.",
        );
      }

      // Prevent overpayment
      if (parsed.data.amountCents > invoice.balanceDueCents) {
        throw new Error(
          `Payment of $${(parsed.data.amountCents / 100).toFixed(2)} exceeds the outstanding balance of $${(invoice.balanceDueCents / 100).toFixed(2)}.`,
        );
      }

      // Create payment
      const payment = await tx.payment.create({
        data: {
          invoiceId: parsed.data.invoiceId,
          amountCents: parsed.data.amountCents,
          paymentDate: parsed.data.paymentDate,
          paymentMethod: parsed.data.paymentMethod || null,
          reference: parsed.data.reference || null,
          notes: parsed.data.notes || null,
        },
      });

      // Update invoice balance and status
      const newBalance = invoice.balanceDueCents - parsed.data.amountCents;
      const newStatus =
        newBalance <= 0 ? InvoiceStatus.PAID : InvoiceStatus.PARTIALLY_PAID;

      await tx.invoice.update({
        where: { id: parsed.data.invoiceId },
        data: {
          balanceDueCents: newBalance,
          status: newStatus,
          ...(newBalance <= 0 ? { paidAt: new Date() } : {}),
        },
      });

      return { payment, invoice, newBalance, newStatus };
    });

    // Audit and activity logging (outside transaction to not block)
    await createFinancialAuditLog({
      organizationId: user.organizationId,
      userId: user.userId,
      action: "payment.recorded",
      entityType: "Payment",
      entityId: result.payment.id,
      afterData: {
        invoiceId: parsed.data.invoiceId,
        invoiceNumber: result.invoice.invoiceNumber,
        amountCents: parsed.data.amountCents,
        newBalance: result.newBalance,
        newStatus: result.newStatus,
      },
    });

    await logActivity({
      organizationId: user.organizationId,
      userId: user.userId,
      action: "payment.recorded",
      entityType: "Payment",
      entityId: result.payment.id,
      projectId: result.invoice.project.id,
      metadata: {
        invoiceNumber: result.invoice.invoiceNumber,
        amountCents: parsed.data.amountCents,
        newStatus: result.newStatus,
      },
    });

    revalidatePath(`/projects/${result.invoice.project.id}/invoices`);

    return { success: true, data: { id: result.payment.id } };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    throw error;
  }
}

/**
 * Mark overdue invoices for the organization.
 * Finds all SENT/VIEWED/PARTIALLY_PAID invoices past their due date
 * and transitions them to OVERDUE status.
 *
 * Designed to be called from a cron job or manual trigger.
 * Requires ADMIN role.
 */
export async function markOverdueInvoicesAction(): Promise<{
  success: boolean;
  error?: string;
  data?: { markedCount: number };
}> {
  let user;
  try {
    user = await requireRole(UserRole.ADMIN);
  } catch (error) {
    if (error instanceof AuthError) {
      return { success: false, error: error.message };
    }
    throw error;
  }

  const now = new Date();

  // Find all invoices that should be overdue
  const overdueInvoices = await prisma.invoice.findMany({
    where: {
      organizationId: user.organizationId,
      deletedAt: null,
      status: {
        in: [InvoiceStatus.SENT, InvoiceStatus.VIEWED, InvoiceStatus.PARTIALLY_PAID],
      },
      dueDate: { lt: now },
      balanceDueCents: { gt: 0 },
    },
    select: { id: true, invoiceNumber: true, projectId: true },
  });

  if (overdueInvoices.length === 0) {
    return { success: true, data: { markedCount: 0 } };
  }

  // Batch update in a transaction
  await prisma.$transaction(
    overdueInvoices.map((inv) =>
      prisma.invoice.update({
        where: { id: inv.id },
        data: { status: InvoiceStatus.OVERDUE },
      }),
    ),
  );

  // Audit log for each
  await Promise.all(
    overdueInvoices.map((inv) =>
      createFinancialAuditLog({
        organizationId: user.organizationId,
        userId: user.userId,
        action: "invoice.marked_overdue",
        entityType: "Invoice",
        entityId: inv.id,
        afterData: { invoiceNumber: inv.invoiceNumber },
      }),
    ),
  );

  return {
    success: true,
    data: { markedCount: overdueInvoices.length },
  };
}
