"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole, AuthError } from "@/lib/auth-utils";
import { logActivity } from "@/lib/activity";
import { createFinancialAuditLog } from "@/lib/services/audit.service";
import {
  createInvoiceSchema,
  updateInvoiceSchema,
} from "@/lib/validations/invoice";
import {
  calculateInvoiceTotals,
  generateInvoiceNumber,
  calculateDueDate,
} from "@/lib/financial/invoice";
import { InvoiceStatus, UserRole } from "@prisma/client";

type ActionResult = {
  success: boolean;
  error?: string;
  data?: { id: string };
};

/**
 * Create a new invoice with line items.
 * Server recalculates all totals from line items (client totals ignored).
 * Requires MANAGER or FINANCE role.
 */
export async function createInvoiceAction(
  input: {
    projectId: string;
    clientName: string;
    clientEmail?: string;
    clientAddress?: string;
    issueDate: Date;
    paymentTerms?: string;
    taxRateBasisPoints?: number;
    notes?: string;
    lineItems: {
      description: string;
      quantityThousandths: number;
      unitPriceCents: number;
    }[];
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

  const parsed = createInvoiceSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message ?? "Invalid input.",
    };
  }

  // Verify project belongs to org
  const project = await prisma.project.findFirst({
    where: {
      id: parsed.data.projectId,
      organizationId: user.organizationId,
    },
  });

  if (!project) {
    return { success: false, error: "Project not found." };
  }

  // Server recalculates totals
  const totals = calculateInvoiceTotals(
    parsed.data.lineItems,
    parsed.data.taxRateBasisPoints,
  );

  // Generate invoice number
  const now = new Date();
  const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;

  // Count existing invoices in this month for sequence
  const existingCount = await prisma.invoice.count({
    where: {
      organizationId: user.organizationId,
      invoiceNumber: { startsWith: `INV-${yearMonth}` },
    },
  });

  const invoiceNumber = generateInvoiceNumber(yearMonth, existingCount + 1);

  // Calculate due date from payment terms
  const dueDate = calculateDueDate(
    parsed.data.issueDate,
    parsed.data.paymentTerms,
  );

  const invoice = await prisma.invoice.create({
    data: {
      organizationId: user.organizationId,
      projectId: parsed.data.projectId,
      invoiceNumber,
      clientName: parsed.data.clientName,
      clientEmail: parsed.data.clientEmail || null,
      clientAddress: parsed.data.clientAddress || null,
      issueDate: parsed.data.issueDate,
      dueDate,
      paymentTerms: parsed.data.paymentTerms as any,
      subtotalCents: totals.subtotalCents,
      taxRateBasisPoints: parsed.data.taxRateBasisPoints,
      taxAmountCents: totals.taxAmountCents,
      totalCents: totals.totalCents,
      balanceDueCents: totals.totalCents,
      notes: parsed.data.notes || null,
      lineItems: {
        create: parsed.data.lineItems.map((item, i) => {
          const itemTotals = calculateInvoiceTotals([item], 0);
          return {
            description: item.description,
            quantityThousandths: item.quantityThousandths,
            unitPriceCents: item.unitPriceCents,
            amountCents: itemTotals.subtotalCents as number,
            sortOrder: i,
          };
        }),
      },
    },
    include: { lineItems: true },
  });

  await createFinancialAuditLog({
    organizationId: user.organizationId,
    userId: user.userId,
    action: "invoice.created",
    entityType: "Invoice",
    entityId: invoice.id,
    afterData: {
      invoiceNumber: invoice.invoiceNumber,
      totalCents: invoice.totalCents,
      lineItemCount: invoice.lineItems.length,
    },
  });

  await logActivity({
    organizationId: user.organizationId,
    userId: user.userId,
    action: "invoice.created",
    entityType: "Invoice",
    entityId: invoice.id,
    projectId: parsed.data.projectId,
    metadata: {
      invoiceNumber: invoice.invoiceNumber,
      totalCents: invoice.totalCents,
    },
  });

  revalidatePath(`/projects/${parsed.data.projectId}/invoices`);

  return { success: true, data: { id: invoice.id } };
}

/**
 * Update an invoice (only while in DRAFT status).
 * Recalculates totals from line items if provided.
 * Requires MANAGER or FINANCE role.
 */
export async function updateInvoiceAction(
  input: {
    invoiceId: string;
    clientName?: string;
    clientEmail?: string | null;
    clientAddress?: string | null;
    paymentTerms?: string;
    taxRateBasisPoints?: number;
    notes?: string | null;
    lineItems?: {
      description: string;
      quantityThousandths: number;
      unitPriceCents: number;
    }[];
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

  const parsed = updateInvoiceSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message ?? "Invalid input.",
    };
  }

  const invoice = await prisma.invoice.findFirst({
    where: { id: parsed.data.invoiceId, deletedAt: null },
    include: {
      project: { select: { id: true, organizationId: true } },
      lineItems: true,
    },
  });

  if (!invoice || invoice.project.organizationId !== user.organizationId) {
    return { success: false, error: "Invoice not found." };
  }

  if (invoice.status !== InvoiceStatus.DRAFT) {
    return { success: false, error: "Only draft invoices can be edited." };
  }

  const beforeData = {
    clientName: invoice.clientName,
    totalCents: invoice.totalCents,
    lineItemCount: invoice.lineItems.length,
  };

  const { invoiceId, lineItems: newLineItems, ...updateData } = parsed.data;

  // Recalculate if line items or tax rate changed
  let totalsUpdate = {};
  if (newLineItems) {
    const taxRate = parsed.data.taxRateBasisPoints ?? invoice.taxRateBasisPoints;
    const totals = calculateInvoiceTotals(newLineItems, taxRate);

    totalsUpdate = {
      subtotalCents: totals.subtotalCents as number,
      taxAmountCents: totals.taxAmountCents as number,
      totalCents: totals.totalCents as number,
      balanceDueCents: totals.totalCents as number,
    };

    // Replace line items in a transaction
    await prisma.$transaction([
      prisma.invoiceLineItem.deleteMany({ where: { invoiceId } }),
      ...newLineItems.map((item, i) => {
        const itemTotals = calculateInvoiceTotals([item], 0);
        return prisma.invoiceLineItem.create({
          data: {
            invoiceId,
            description: item.description,
            quantityThousandths: item.quantityThousandths,
            unitPriceCents: item.unitPriceCents,
            amountCents: itemTotals.subtotalCents as number,
            sortOrder: i,
          },
        });
      }),
    ]);
  } else if (parsed.data.taxRateBasisPoints !== undefined) {
    // Tax rate changed but line items didn't
    const existingItems = invoice.lineItems.map((li) => ({
      unitPriceCents: li.unitPriceCents,
      quantityThousandths: li.quantityThousandths,
    }));
    const totals = calculateInvoiceTotals(existingItems, parsed.data.taxRateBasisPoints);
    totalsUpdate = {
      subtotalCents: totals.subtotalCents as number,
      taxAmountCents: totals.taxAmountCents as number,
      totalCents: totals.totalCents as number,
      balanceDueCents: totals.totalCents as number,
    };
  }

  // Recalculate due date if payment terms changed
  let dueDateUpdate = {};
  if (parsed.data.paymentTerms) {
    dueDateUpdate = {
      dueDate: calculateDueDate(invoice.issueDate, parsed.data.paymentTerms),
    };
  }

  await prisma.invoice.update({
    where: { id: invoiceId },
    data: {
      ...updateData,
      ...totalsUpdate,
      ...dueDateUpdate,
    },
  });

  await createFinancialAuditLog({
    organizationId: user.organizationId,
    userId: user.userId,
    action: "invoice.updated",
    entityType: "Invoice",
    entityId: invoiceId,
    beforeData,
    afterData: { ...updateData, ...totalsUpdate },
  });

  revalidatePath(`/projects/${invoice.project.id}/invoices`);

  return { success: true };
}

/**
 * Send an invoice (transition DRAFT -> SENT).
 * Requires MANAGER or FINANCE role.
 */
export async function sendInvoiceAction(
  invoiceId: string,
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

  const invoice = await prisma.invoice.findFirst({
    where: { id: invoiceId, deletedAt: null },
    include: {
      project: { select: { id: true, organizationId: true } },
      lineItems: true,
    },
  });

  if (!invoice || invoice.project.organizationId !== user.organizationId) {
    return { success: false, error: "Invoice not found." };
  }

  if (invoice.status !== InvoiceStatus.DRAFT) {
    return { success: false, error: "Only draft invoices can be sent." };
  }

  if (invoice.lineItems.length === 0) {
    return { success: false, error: "Cannot send an invoice with no line items." };
  }

  await prisma.invoice.update({
    where: { id: invoiceId },
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
    entityId: invoiceId,
    beforeData: { status: InvoiceStatus.DRAFT },
    afterData: { status: InvoiceStatus.SENT },
  });

  await logActivity({
    organizationId: user.organizationId,
    userId: user.userId,
    action: "invoice.sent",
    entityType: "Invoice",
    entityId: invoiceId,
    projectId: invoice.project.id,
    metadata: {
      invoiceNumber: invoice.invoiceNumber,
      totalCents: invoice.totalCents,
      clientName: invoice.clientName,
    },
  });

  revalidatePath(`/projects/${invoice.project.id}/invoices`);

  return { success: true };
}

/**
 * Mark an invoice as written off.
 * Only for OVERDUE invoices.
 * Requires ADMIN role.
 */
export async function writeOffInvoiceAction(
  invoiceId: string,
): Promise<ActionResult> {
  let user;
  try {
    user = await requireRole(UserRole.ADMIN);
  } catch (error) {
    if (error instanceof AuthError) {
      return { success: false, error: error.message };
    }
    throw error;
  }

  const invoice = await prisma.invoice.findFirst({
    where: { id: invoiceId, deletedAt: null },
    include: {
      project: { select: { id: true, organizationId: true } },
    },
  });

  if (!invoice || invoice.project.organizationId !== user.organizationId) {
    return { success: false, error: "Invoice not found." };
  }

  if (invoice.status !== InvoiceStatus.OVERDUE) {
    return { success: false, error: "Only overdue invoices can be written off." };
  }

  await prisma.invoice.update({
    where: { id: invoiceId },
    data: {
      status: InvoiceStatus.WRITTEN_OFF,
      balanceDueCents: 0,
    },
  });

  await createFinancialAuditLog({
    organizationId: user.organizationId,
    userId: user.userId,
    action: "invoice.written_off",
    entityType: "Invoice",
    entityId: invoiceId,
    beforeData: {
      status: InvoiceStatus.OVERDUE,
      balanceDueCents: invoice.balanceDueCents,
    },
    afterData: {
      status: InvoiceStatus.WRITTEN_OFF,
      balanceDueCents: 0,
    },
  });

  revalidatePath(`/projects/${invoice.project.id}/invoices`);

  return { success: true };
}

/**
 * Soft-delete an invoice.
 * Only DRAFT invoices can be deleted.
 * Requires MANAGER or FINANCE role.
 */
export async function deleteInvoiceAction(
  invoiceId: string,
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

  const invoice = await prisma.invoice.findFirst({
    where: { id: invoiceId, deletedAt: null },
    include: {
      project: { select: { id: true, organizationId: true } },
    },
  });

  if (!invoice || invoice.project.organizationId !== user.organizationId) {
    return { success: false, error: "Invoice not found." };
  }

  if (invoice.status !== InvoiceStatus.DRAFT) {
    return { success: false, error: "Only draft invoices can be deleted." };
  }

  await prisma.invoice.update({
    where: { id: invoiceId },
    data: { deletedAt: new Date() },
  });

  await createFinancialAuditLog({
    organizationId: user.organizationId,
    userId: user.userId,
    action: "invoice.deleted",
    entityType: "Invoice",
    entityId: invoiceId,
    beforeData: {
      invoiceNumber: invoice.invoiceNumber,
      totalCents: invoice.totalCents,
    },
  });

  revalidatePath(`/projects/${invoice.project.id}/invoices`);

  return { success: true };
}
