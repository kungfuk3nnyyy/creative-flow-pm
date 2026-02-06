import { z } from "zod";

export const createTeamSchema = z.object({
  name: z
    .string()
    .min(1, "Team name is required.")
    .max(100, "Team name must be 100 characters or fewer."),
  description: z
    .string()
    .max(500, "Description must be 500 characters or fewer.")
    .optional(),
});

export const updateTeamSchema = createTeamSchema.partial().extend({
  id: z.string().cuid(),
});

export const addTeamMemberSchema = z.object({
  teamId: z.string().cuid(),
  userId: z.string().cuid(),
});

export const removeTeamMemberSchema = z.object({
  teamId: z.string().cuid(),
  userId: z.string().cuid(),
});

export type CreateTeamInput = z.infer<typeof createTeamSchema>;
export type UpdateTeamInput = z.infer<typeof updateTeamSchema>;
