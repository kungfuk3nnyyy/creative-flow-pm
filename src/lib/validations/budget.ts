import { z } from "zod";

export const createBudgetSchema = z.object({
  projectId: z.string().cuid(),
  totalAmountCents: z.coerce
    .number()
    .int()
    .positive("Total amount must be positive."),
  notes: z.string().max(2000).optional(),
  useTemplate: z.boolean().optional().default(true),
});

export const updateBudgetTotalSchema = z.object({
  budgetId: z.string().cuid(),
  totalAmountCents: z.coerce
    .number()
    .int()
    .positive("Total amount must be positive."),
});

export const addCategorySchema = z.object({
  budgetId: z.string().cuid(),
  name: z
    .string()
    .min(1, "Category name is required.")
    .max(100, "Category name must be 100 characters or fewer."),
  allocatedCents: z.coerce
    .number()
    .int()
    .min(0, "Allocation cannot be negative."),
});

export const updateCategorySchema = z.object({
  categoryId: z.string().cuid(),
  name: z
    .string()
    .min(1, "Category name is required.")
    .max(100)
    .optional(),
  allocatedCents: z.coerce
    .number()
    .int()
    .min(0, "Allocation cannot be negative.")
    .optional(),
});

export type CreateBudgetInput = z.infer<typeof createBudgetSchema>;
export type UpdateBudgetTotalInput = z.infer<typeof updateBudgetTotalSchema>;
export type AddCategoryInput = z.infer<typeof addCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
