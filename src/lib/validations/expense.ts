import { z } from "zod";
import { ExpenseStatus } from "@prisma/client";

export const createExpenseSchema = z.object({
  projectId: z.string().cuid(),
  budgetCategoryId: z.string().cuid().optional(),
  vendorId: z.string().cuid().optional(),
  description: z
    .string()
    .min(1, "Description is required.")
    .max(500, "Description must be 500 characters or fewer."),
  amountCents: z.coerce
    .number()
    .int()
    .positive("Amount must be positive."),
  date: z.coerce.date(),
  notes: z.string().max(2000).optional(),
});

export const updateExpenseSchema = z.object({
  expenseId: z.string().cuid(),
  budgetCategoryId: z.string().cuid().optional().nullable(),
  vendorId: z.string().cuid().optional().nullable(),
  description: z
    .string()
    .min(1)
    .max(500)
    .optional(),
  amountCents: z.coerce
    .number()
    .int()
    .positive("Amount must be positive.")
    .optional(),
  date: z.coerce.date().optional(),
  notes: z.string().max(2000).optional().nullable(),
});

export const submitExpenseSchema = z.object({
  expenseId: z.string().cuid(),
});

export const approveExpenseSchema = z.object({
  expenseId: z.string().cuid(),
});

export const rejectExpenseSchema = z.object({
  expenseId: z.string().cuid(),
  rejectionReason: z
    .string()
    .min(1, "Rejection reason is required.")
    .max(1000, "Rejection reason must be 1000 characters or fewer."),
});

export const expenseFilterSchema = z.object({
  status: z.nativeEnum(ExpenseStatus).optional(),
  budgetCategoryId: z.string().cuid().optional(),
  vendorId: z.string().cuid().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  pageSize: z.coerce.number().int().positive().max(100).optional().default(20),
});

export const EXPENSE_STATUS_LABELS: Record<ExpenseStatus, string> = {
  DRAFT: "Draft",
  SUBMITTED: "Submitted",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  REIMBURSED: "Reimbursed",
};

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;
export type ExpenseFilterInput = z.infer<typeof expenseFilterSchema>;
