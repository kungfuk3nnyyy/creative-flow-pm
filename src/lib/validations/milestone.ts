import { z } from "zod";

export const createMilestoneSchema = z.object({
  projectId: z.string().cuid(),
  name: z
    .string()
    .min(1, "Milestone name is required.")
    .max(200, "Milestone name must be 200 characters or fewer."),
  description: z
    .string()
    .max(2000, "Description must be 2000 characters or fewer.")
    .optional(),
  dueDate: z.coerce.date().optional(),
});

export const updateMilestoneSchema = z.object({
  id: z.string().cuid(),
  name: z
    .string()
    .min(1, "Milestone name is required.")
    .max(200, "Milestone name must be 200 characters or fewer.")
    .optional(),
  description: z
    .string()
    .max(2000, "Description must be 2000 characters or fewer.")
    .optional(),
  dueDate: z.coerce.date().optional().nullable(),
});

export const reorderMilestonesSchema = z.object({
  projectId: z.string().cuid(),
  milestoneIds: z.array(z.string().cuid()).min(1),
});

export type CreateMilestoneInput = z.infer<typeof createMilestoneSchema>;
export type UpdateMilestoneInput = z.infer<typeof updateMilestoneSchema>;
export type ReorderMilestonesInput = z.infer<typeof reorderMilestonesSchema>;
