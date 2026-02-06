import { z } from "zod";

export const createTaskSchema = z.object({
  milestoneId: z.string().cuid(),
  title: z
    .string()
    .min(1, "Task title is required.")
    .max(300, "Task title must be 300 characters or fewer."),
  description: z
    .string()
    .max(5000, "Description must be 5000 characters or fewer.")
    .optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
  assigneeId: z.string().cuid().optional(),
  dueDate: z.coerce.date().optional(),
});

export const updateTaskSchema = z.object({
  id: z.string().cuid(),
  title: z
    .string()
    .min(1, "Task title is required.")
    .max(300, "Task title must be 300 characters or fewer.")
    .optional(),
  description: z
    .string()
    .max(5000, "Description must be 5000 characters or fewer.")
    .optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "REVIEW", "DONE"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  assigneeId: z.string().cuid().optional().nullable(),
  dueDate: z.coerce.date().optional().nullable(),
});

export const moveTaskSchema = z.object({
  taskId: z.string().cuid(),
  newStatus: z.enum(["TODO", "IN_PROGRESS", "REVIEW", "DONE"]),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type MoveTaskInput = z.infer<typeof moveTaskSchema>;

export const TASK_STATUS_LABELS: Record<string, string> = {
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  REVIEW: "Review",
  DONE: "Done",
};

export const TASK_PRIORITY_LABELS: Record<string, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  URGENT: "Urgent",
};

export const TASK_PRIORITY_COLORS: Record<string, string> = {
  LOW: "text-slate",
  MEDIUM: "text-info",
  HIGH: "text-warning",
  URGENT: "text-error",
};
