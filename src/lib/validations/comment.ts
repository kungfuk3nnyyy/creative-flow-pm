import { z } from "zod";

export const createCommentSchema = z.object({
  projectId: z.string().cuid(),
  content: z
    .string()
    .min(1, "Comment cannot be empty.")
    .max(5000, "Comment must be 5000 characters or fewer."),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;
