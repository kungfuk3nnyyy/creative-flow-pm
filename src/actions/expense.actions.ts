"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole, AuthError } from "@/lib/auth-utils";
import { logActivity } from "@/lib/activity";
import { createFinancialAuditLog } from "@/lib/services/audit.service";
import { getStorageProvider, MAX_FILE_SIZE, ALLOWED_MIME_TYPES } from "@/lib/storage";
import {
  createExpenseSchema,
  updateExpenseSchema,
  submitExpenseSchema,
  approveExpenseSchema,
  rejectExpenseSchema,
} from "@/lib/validations/expense";
import { ExpenseStatus, UserRole } from "@prisma/client";

type ActionResult = {
  success: boolean;
  error?: string;
  data?: { id: string };
};

/**
 * Create a new expense (starts as DRAFT).
 * Any authenticated member can create expenses.
 */
export async function createExpenseAction(
  input: {
    projectId: string;
    budgetCategoryId?: string;
    vendorId?: string;
    description: string;
    amountCents: number;
    date: Date;
    notes?: string;
  },
): Promise<ActionResult> {
  let user;
  try {
    user = await requireAuth();
  } catch (error) {
    if (error instanceof AuthError) {
      return { success: false, error: error.message };
    }
    throw error;
  }

  const parsed = createExpenseSchema.safeParse(input);
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

  // Validate budget category if provided
  if (parsed.data.budgetCategoryId) {
    const category = await prisma.budgetCategory.findFirst({
      where: {
        id: parsed.data.budgetCategoryId,
        budget: { projectId: parsed.data.projectId },
      },
    });
    if (!category) {
      return { success: false, error: "Budget category not found." };
    }
  }

  // Validate vendor if provided
  if (parsed.data.vendorId) {
    const vendor = await prisma.vendor.findFirst({
      where: {
        id: parsed.data.vendorId,
        organizationId: user.organizationId,
      },
    });
    if (!vendor) {
      return { success: false, error: "Vendor not found." };
    }
  }

  const expense = await prisma.expense.create({
    data: {
      organizationId: user.organizationId,
      projectId: parsed.data.projectId,
      budgetCategoryId: parsed.data.budgetCategoryId || null,
      vendorId: parsed.data.vendorId || null,
      description: parsed.data.description,
      amountCents: parsed.data.amountCents,
      date: parsed.data.date,
      status: ExpenseStatus.DRAFT,
      submittedById: user.userId,
      notes: parsed.data.notes || null,
    },
  });

  await createFinancialAuditLog({
    organizationId: user.organizationId,
    userId: user.userId,
    action: "expense.created",
    entityType: "Expense",
    entityId: expense.id,
    afterData: {
      description: expense.description,
      amountCents: expense.amountCents,
      date: expense.date.toISOString(),
    },
  });

  await logActivity({
    organizationId: user.organizationId,
    userId: user.userId,
    action: "expense.created",
    entityType: "Expense",
    entityId: expense.id,
    projectId: parsed.data.projectId,
    metadata: {
      description: expense.description,
      amountCents: expense.amountCents,
    },
  });

  revalidatePath(`/projects/${parsed.data.projectId}/expenses`);

  return { success: true, data: { id: expense.id } };
}

/**
 * Update an expense (only while in DRAFT status).
 * Only the submitter can update their own draft expenses.
 */
export async function updateExpenseAction(
  input: {
    expenseId: string;
    budgetCategoryId?: string | null;
    vendorId?: string | null;
    description?: string;
    amountCents?: number;
    date?: Date;
    notes?: string | null;
  },
): Promise<ActionResult> {
  let user;
  try {
    user = await requireAuth();
  } catch (error) {
    if (error instanceof AuthError) {
      return { success: false, error: error.message };
    }
    throw error;
  }

  const parsed = updateExpenseSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message ?? "Invalid input.",
    };
  }

  const expense = await prisma.expense.findFirst({
    where: { id: parsed.data.expenseId, deletedAt: null },
    include: {
      project: { select: { id: true, organizationId: true } },
    },
  });

  if (!expense || expense.project.organizationId !== user.organizationId) {
    return { success: false, error: "Expense not found." };
  }

  if (expense.status !== ExpenseStatus.DRAFT) {
    return { success: false, error: "Only draft expenses can be edited." };
  }

  if (expense.submittedById !== user.userId) {
    return { success: false, error: "You can only edit your own expenses." };
  }

  const { expenseId, ...data } = parsed.data;

  const beforeData = {
    description: expense.description,
    amountCents: expense.amountCents,
    budgetCategoryId: expense.budgetCategoryId,
    vendorId: expense.vendorId,
  };

  await prisma.expense.update({
    where: { id: expenseId },
    data,
  });

  await createFinancialAuditLog({
    organizationId: user.organizationId,
    userId: user.userId,
    action: "expense.updated",
    entityType: "Expense",
    entityId: expenseId,
    beforeData,
    afterData: data,
  });

  revalidatePath(`/projects/${expense.project.id}/expenses`);

  return { success: true };
}

/**
 * Submit an expense for approval.
 * Transitions DRAFT -> SUBMITTED.
 * Only the submitter can submit their own expense.
 */
export async function submitExpenseAction(
  input: { expenseId: string },
): Promise<ActionResult> {
  let user;
  try {
    user = await requireAuth();
  } catch (error) {
    if (error instanceof AuthError) {
      return { success: false, error: error.message };
    }
    throw error;
  }

  const parsed = submitExpenseSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message ?? "Invalid input.",
    };
  }

  const expense = await prisma.expense.findFirst({
    where: { id: parsed.data.expenseId, deletedAt: null },
    include: {
      project: { select: { id: true, organizationId: true } },
    },
  });

  if (!expense || expense.project.organizationId !== user.organizationId) {
    return { success: false, error: "Expense not found." };
  }

  if (expense.status !== ExpenseStatus.DRAFT) {
    return { success: false, error: "Only draft expenses can be submitted." };
  }

  if (expense.submittedById !== user.userId) {
    return { success: false, error: "You can only submit your own expenses." };
  }

  await prisma.expense.update({
    where: { id: parsed.data.expenseId },
    data: { status: ExpenseStatus.SUBMITTED },
  });

  await createFinancialAuditLog({
    organizationId: user.organizationId,
    userId: user.userId,
    action: "expense.submitted",
    entityType: "Expense",
    entityId: parsed.data.expenseId,
    beforeData: { status: ExpenseStatus.DRAFT },
    afterData: { status: ExpenseStatus.SUBMITTED },
  });

  await logActivity({
    organizationId: user.organizationId,
    userId: user.userId,
    action: "expense.submitted",
    entityType: "Expense",
    entityId: parsed.data.expenseId,
    projectId: expense.project.id,
    metadata: {
      description: expense.description,
      amountCents: expense.amountCents,
    },
  });

  revalidatePath(`/projects/${expense.project.id}/expenses`);

  return { success: true };
}

/**
 * Approve an expense.
 * Transitions SUBMITTED -> APPROVED.
 * Requires MANAGER role.
 * Self-approval prevention: submitter cannot approve their own expense.
 */
export async function approveExpenseAction(
  input: { expenseId: string },
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

  const parsed = approveExpenseSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message ?? "Invalid input.",
    };
  }

  const expense = await prisma.expense.findFirst({
    where: { id: parsed.data.expenseId, deletedAt: null },
    include: {
      project: { select: { id: true, organizationId: true } },
    },
  });

  if (!expense || expense.project.organizationId !== user.organizationId) {
    return { success: false, error: "Expense not found." };
  }

  if (expense.status !== ExpenseStatus.SUBMITTED) {
    return { success: false, error: "Only submitted expenses can be approved." };
  }

  // Self-approval prevention
  if (expense.submittedById === user.userId) {
    return { success: false, error: "You cannot approve your own expense." };
  }

  await prisma.expense.update({
    where: { id: parsed.data.expenseId },
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
    entityId: parsed.data.expenseId,
    beforeData: { status: ExpenseStatus.SUBMITTED },
    afterData: {
      status: ExpenseStatus.APPROVED,
      approvedById: user.userId,
    },
  });

  await logActivity({
    organizationId: user.organizationId,
    userId: user.userId,
    action: "expense.approved",
    entityType: "Expense",
    entityId: parsed.data.expenseId,
    projectId: expense.project.id,
    metadata: {
      description: expense.description,
      amountCents: expense.amountCents,
    },
  });

  revalidatePath(`/projects/${expense.project.id}/expenses`);

  return { success: true };
}

/**
 * Reject an expense.
 * Transitions SUBMITTED -> REJECTED.
 * Requires MANAGER role.
 * Self-rejection prevention: submitter cannot reject their own expense.
 */
export async function rejectExpenseAction(
  input: { expenseId: string; rejectionReason: string },
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

  const parsed = rejectExpenseSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message ?? "Invalid input.",
    };
  }

  const expense = await prisma.expense.findFirst({
    where: { id: parsed.data.expenseId, deletedAt: null },
    include: {
      project: { select: { id: true, organizationId: true } },
    },
  });

  if (!expense || expense.project.organizationId !== user.organizationId) {
    return { success: false, error: "Expense not found." };
  }

  if (expense.status !== ExpenseStatus.SUBMITTED) {
    return { success: false, error: "Only submitted expenses can be rejected." };
  }

  if (expense.submittedById === user.userId) {
    return { success: false, error: "You cannot reject your own expense." };
  }

  await prisma.expense.update({
    where: { id: parsed.data.expenseId },
    data: {
      status: ExpenseStatus.REJECTED,
      approvedById: user.userId,
      approvedAt: new Date(),
      rejectionReason: parsed.data.rejectionReason,
    },
  });

  await createFinancialAuditLog({
    organizationId: user.organizationId,
    userId: user.userId,
    action: "expense.rejected",
    entityType: "Expense",
    entityId: parsed.data.expenseId,
    beforeData: { status: ExpenseStatus.SUBMITTED },
    afterData: {
      status: ExpenseStatus.REJECTED,
      rejectionReason: parsed.data.rejectionReason,
    },
  });

  await logActivity({
    organizationId: user.organizationId,
    userId: user.userId,
    action: "expense.rejected",
    entityType: "Expense",
    entityId: parsed.data.expenseId,
    projectId: expense.project.id,
    metadata: {
      description: expense.description,
      amountCents: expense.amountCents,
      rejectionReason: parsed.data.rejectionReason,
    },
  });

  revalidatePath(`/projects/${expense.project.id}/expenses`);

  return { success: true };
}

/**
 * Soft-delete an expense.
 * Only DRAFT or REJECTED expenses can be deleted.
 * Only the submitter or an ADMIN can delete.
 */
export async function deleteExpenseAction(
  expenseId: string,
): Promise<ActionResult> {
  let user;
  try {
    user = await requireAuth();
  } catch (error) {
    if (error instanceof AuthError) {
      return { success: false, error: error.message };
    }
    throw error;
  }

  const expense = await prisma.expense.findFirst({
    where: { id: expenseId, deletedAt: null },
    include: {
      project: { select: { id: true, organizationId: true } },
    },
  });

  if (!expense || expense.project.organizationId !== user.organizationId) {
    return { success: false, error: "Expense not found." };
  }

  if (expense.status !== ExpenseStatus.DRAFT && expense.status !== ExpenseStatus.REJECTED) {
    return {
      success: false,
      error: "Only draft or rejected expenses can be deleted.",
    };
  }

  if (expense.submittedById !== user.userId && user.role !== UserRole.ADMIN) {
    return {
      success: false,
      error: "You can only delete your own expenses.",
    };
  }

  // Soft-delete for financial record integrity
  await prisma.expense.update({
    where: { id: expenseId },
    data: { deletedAt: new Date() },
  });

  await createFinancialAuditLog({
    organizationId: user.organizationId,
    userId: user.userId,
    action: "expense.deleted",
    entityType: "Expense",
    entityId: expenseId,
    beforeData: {
      description: expense.description,
      amountCents: expense.amountCents,
      status: expense.status,
    },
  });

  revalidatePath(`/projects/${expense.project.id}/expenses`);

  return { success: true };
}

/**
 * Upload a receipt attachment to an expense.
 * Only the submitter can add receipts to their own expenses.
 */
export async function uploadExpenseReceiptAction(
  formData: FormData,
): Promise<ActionResult> {
  let user;
  try {
    user = await requireAuth();
  } catch (error) {
    if (error instanceof AuthError) {
      return { success: false, error: error.message };
    }
    throw error;
  }

  const expenseId = formData.get("expenseId") as string;
  const file = formData.get("file") as File | null;

  if (!expenseId) {
    return { success: false, error: "Expense ID is required." };
  }

  if (!file || !(file instanceof File)) {
    return { success: false, error: "No file provided." };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { success: false, error: "File must be 10MB or smaller." };
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return { success: false, error: "File type not supported." };
  }

  const expense = await prisma.expense.findFirst({
    where: { id: expenseId, deletedAt: null },
    include: {
      project: { select: { id: true, organizationId: true } },
    },
  });

  if (!expense || expense.project.organizationId !== user.organizationId) {
    return { success: false, error: "Expense not found." };
  }

  if (expense.submittedById !== user.userId) {
    return { success: false, error: "You can only add receipts to your own expenses." };
  }

  const timestamp = Date.now();
  const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const storageKey = `${user.organizationId}/receipts/${expenseId}/${timestamp}-${safeFileName}`;

  const storage = getStorageProvider();
  const buffer = Buffer.from(await file.arrayBuffer());
  await storage.upload(storageKey, buffer, file.type);

  const attachment = await prisma.expenseAttachment.create({
    data: {
      expenseId,
      name: file.name,
      mimeType: file.type,
      sizeBytes: file.size,
      storageKey,
    },
  });

  revalidatePath(`/projects/${expense.project.id}/expenses`);

  return { success: true, data: { id: attachment.id } };
}

/**
 * Delete a receipt attachment from an expense.
 */
export async function deleteExpenseReceiptAction(
  attachmentId: string,
): Promise<ActionResult> {
  let user;
  try {
    user = await requireAuth();
  } catch (error) {
    if (error instanceof AuthError) {
      return { success: false, error: error.message };
    }
    throw error;
  }

  const attachment = await prisma.expenseAttachment.findFirst({
    where: { id: attachmentId },
    include: {
      expense: {
        include: {
          project: { select: { id: true, organizationId: true } },
        },
      },
    },
  });

  if (!attachment || attachment.expense.project.organizationId !== user.organizationId) {
    return { success: false, error: "Attachment not found." };
  }

  if (attachment.expense.submittedById !== user.userId && user.role !== UserRole.ADMIN) {
    return { success: false, error: "You can only delete your own receipts." };
  }

  const storage = getStorageProvider();
  await storage.delete(attachment.storageKey);

  await prisma.expenseAttachment.delete({ where: { id: attachmentId } });

  revalidatePath(`/projects/${attachment.expense.project.id}/expenses`);

  return { success: true };
}
