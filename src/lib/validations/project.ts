import { z } from "zod";

export const createProjectSchema = z.object({
  name: z
    .string()
    .min(1, "Project name is required.")
    .max(200, "Project name must be 200 characters or fewer."),
  description: z
    .string()
    .max(2000, "Description must be 2000 characters or fewer.")
    .optional(),
  type: z.enum([
    "INTERIOR_DESIGN",
    "CONFERENCE_DECOR",
    "EXHIBITION",
    "INSTALLATION",
    "EXPERIENTIAL",
    "OTHER",
  ]),
  clientName: z
    .string()
    .max(200, "Client name must be 200 characters or fewer.")
    .optional(),
  clientEmail: z
    .string()
    .email("Enter a valid email address.")
    .optional()
    .or(z.literal("")),
  clientPhone: z
    .string()
    .max(50, "Phone number must be 50 characters or fewer.")
    .optional(),
  clientAddress: z
    .string()
    .max(500, "Address must be 500 characters or fewer.")
    .optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

export const updateProjectSchema = createProjectSchema.partial().extend({
  id: z.string().cuid(),
});

export const projectFilterSchema = z.object({
  search: z.string().optional(),
  status: z
    .enum(["DRAFT", "ACTIVE", "ON_HOLD", "COMPLETED", "ARCHIVED"])
    .optional(),
  type: z
    .enum([
      "INTERIOR_DESIGN",
      "CONFERENCE_DECOR",
      "EXHIBITION",
      "INSTALLATION",
      "EXPERIENTIAL",
      "OTHER",
    ])
    .optional(),
  sortBy: z
    .enum(["name", "createdAt", "updatedAt", "startDate", "status"])
    .optional()
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
  page: z.coerce.number().int().positive().optional().default(1),
  perPage: z.coerce
    .number()
    .int()
    .positive()
    .max(100)
    .optional()
    .default(20),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type ProjectFilterInput = z.infer<typeof projectFilterSchema>;

export const PROJECT_TYPE_LABELS: Record<string, string> = {
  INTERIOR_DESIGN: "Interior Design",
  CONFERENCE_DECOR: "Conference Decor",
  EXHIBITION: "Exhibition",
  INSTALLATION: "Installation",
  EXPERIENTIAL: "Experiential",
  OTHER: "Other",
};

export const PROJECT_STATUS_LABELS: Record<string, string> = {
  DRAFT: "Draft",
  ACTIVE: "Active",
  ON_HOLD: "On Hold",
  COMPLETED: "Completed",
  ARCHIVED: "Archived",
};
