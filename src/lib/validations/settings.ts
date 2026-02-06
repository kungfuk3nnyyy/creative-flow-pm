import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().min(1, "Name is required.").max(100),
});

export const updateOrgSettingsSchema = z.object({
  name: z.string().min(1, "Organization name is required.").max(200),
  address: z.string().max(500).optional().or(z.literal("")),
  phone: z.string().max(30).optional().or(z.literal("")),
  email: z.string().email("Invalid email address.").optional().or(z.literal("")),
  website: z.string().url("Invalid URL.").optional().or(z.literal("")),
  taxRatePercent: z.coerce
    .number()
    .min(0, "Tax rate cannot be negative.")
    .max(100, "Tax rate cannot exceed 100%.")
    .optional()
    .default(0)
    .transform((val) => Math.round(val * 100)),
  invoicePrefix: z
    .string()
    .min(1, "Invoice prefix is required.")
    .max(10)
    .regex(/^[A-Za-z0-9-]+$/, "Only letters, numbers, and hyphens allowed."),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UpdateOrgSettingsInput = z.infer<typeof updateOrgSettingsSchema>;
