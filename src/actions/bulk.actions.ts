"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole, AuthError } from "@/lib/auth-utils";
import { logActivity } from "@/lib/activity";
import { createFinancialAuditLog } from "@/lib/services/audit.service";
import { ExpenseStatus, InvoiceStatus, UserRole } from "@prisma/client";

type BulkResult = {
  success: boolean;
  processed: number;
  failed: number;
  errors: string[];
};

/**
 * Bulk approve multiple submitted expenses.
 * Requires MANAGER role. Self-approval prevention still applies.
 */
export async function bulkApproveExpensesAction(
  expenseIds: string[],
): Promise<BulkResult> {
  let user;
  try {
    user = await requireRole(UserRole.MANAGER);
  } catch (error) {
    if (error instanceof AuthError) {
      return { success: false, processed: 0, failed: 0, errors: [error.message] };
    }
    throw error;
  }

  if (expenseIds.length === 0) {
    return { success: false, processed: 0, failed: 0, errors: ["No expenses selected."] };
  }

  if (expenseIds.length > 50) {
    return { success: false, processed: 0, failed: 0, errors: ["Maximum 50 expenses per batch."] };
  }

  const expenses = await prisma.expense.findMany({
    where: {
      id: { in: expenseIds },
      deletedAt: null,
    },
    include: {
      project: { select: { id: true, organizationId: true } },
    },
  });

  let processed = 0;
  const errors: string[] = [];

  for (const expense of expenses) {
    if (expense.project.organizationId !== user.organizationId) {
      errors.push(`Expense not found: ${expense.id.slice(0, 8)}`);
      continue;
    }

    if (expense.status !== ExpenseStatus.SUBMITTED) {
      errors.push(`${expense.description}: not in submitted status`);
      continue;
    }

    if (expense.submittedById === user.userId) {
      errors.push(`${expense.description}: cannot approve own expense`);
      continue;
    }

    await prisma.expense.update({
      where: { id: expense.id },
      data: {
        status: ExpenseStatus.APPROVED,
        approvedById: user.userId,
        approvedAt: new Date(),
      },
    });

    await createFinancialAuditLog({
      organizationId: user.organizationId,
      userId: user.userId,
      action: "expense.approved",
      entityType: "Expense",
      entityId: expense.id,
      beforeData: { status: ExpenseStatus.SUBMITTED },
      afterData: { status: ExpenseStatus.APPROVED },
    });

    await logActivity({
      organizationId: user.organizationId,
      userId: user.userId,
      action: "expense.approved",
      entityType: "Expense",
      entityId: expense.id,
      projectId: expense.project.id,
      metadata: {
        description: expense.description,
        amountCents: expense.amountCents,
        bulk: true,
      },
    });

    processed++;
  }

  // Revalidate all affected project paths
  const projectIds = new Set(expenses.map((e) => e.project.id));
  for (const pid of projectIds) {
    revalidatePath(`/projects/${pid}/expenses`);
  }

  return {
    success: errors.length === 0,
    processed,
    failed: errors.length,
    errors,
  };
}

/**
 * Bulk send multiple draft invoices.
 * Requires MANAGER role.
 */
export async function bulkSendInvoicesAction(
  invoiceIds: string[],
): Promise<BulkResult> {
  let user;
  try {
    user = await requireRole(UserRole.MANAGER);
  } catch (error) {
    if (error instanceof AuthError) {
      return { success: false, processed: 0, failed: 0, errors: [error.message] };
    }
    throw error;
  }

  if (invoiceIds.length === 0) {
    return { success: false, processed: 0, failed: 0, errors: ["No invoices selected."] };
  }

  if (invoiceIds.length > 50) {
    return { success: false, processed: 0, failed: 0, errors: ["Maximum 50 invoices per batch."] };
  }

  const invoices = await prisma.invoice.findMany({
    where: {
      id: { in: invoiceIds },
      organizationId: user.organizationId,
      deletedAt: null,
    },
    include: {
      project: { select: { id: true } },
    },
  });

  let processed = 0;
  const errors: string[] = [];

  for (const invoice of invoices) {
    if (invoice.status !== InvoiceStatus.DRAFT) {
      errors.push(`${invoice.invoiceNumber}: not in draft status`);
      continue;
    }

    await prisma.invoice.update({
      where: { id: invoice.id },
      data: {
        status: InvoiceStatus.SENT,
        sentAt: new Date(),
      },
    });

    await createFinancialAuditLog({
      organizationId: user.organizationId,
      userId: user.userId,
      action: "invoice.sent",
      entityType: "Invoice",
      entityId: invoice.id,
      beforeData: { status: InvoiceStatus.DRAFT },
      afterData: { status: InvoiceStatus.SENT },
    });

    await logActivity({
      organizationId: user.organizationId,
      userId: user.userId,
      action: "invoice.sent",
      entityType: "Invoice",
      entityId: invoice.id,
      projectId: invoice.project.id,
      metadata: {
        invoiceNumber: invoice.invoiceNumber,
        totalCents: invoice.totalCents,
        bulk: true,
      },
    });

    processed++;
  }

  const projectIds = new Set(invoices.map((i) => i.project.id));
  for (const pid of projectIds) {
    revalidatePath(`/projects/${pid}/invoices`);
  }

  return {
    success: errors.length === 0,
    processed,
    failed: errors.length,
    errors,
  };
}
