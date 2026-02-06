import { z } from "zod";

export const createVendorSchema = z.object({
  name: z
    .string()
    .min(1, "Vendor name is required.")
    .max(200, "Vendor name must be 200 characters or fewer."),
  category: z.enum([
    "FABRICATION",
    "PRINTING",
    "CATERING",
    "AV",
    "FLORAL",
    "LIGHTING",
    "FURNITURE",
    "STAFFING",
    "TRANSPORT",
    "PHOTOGRAPHY",
    "SIGNAGE",
    "OTHER",
  ]),
  email: z
    .string()
    .email("Enter a valid email address.")
    .optional()
    .or(z.literal("")),
  phone: z
    .string()
    .max(50, "Phone must be 50 characters or fewer.")
    .optional(),
  address: z
    .string()
    .max(500, "Address must be 500 characters or fewer.")
    .optional(),
  website: z
    .string()
    .url("Enter a valid URL.")
    .optional()
    .or(z.literal("")),
  contactName: z
    .string()
    .max(200, "Contact name must be 200 characters or fewer.")
    .optional(),
  notes: z
    .string()
    .max(2000, "Notes must be 2000 characters or fewer.")
    .optional(),
  rating: z.coerce
    .number()
    .int()
    .min(1, "Rating must be 1-5.")
    .max(5, "Rating must be 1-5.")
    .optional(),
});

export const updateVendorSchema = createVendorSchema.partial().extend({
  id: z.string().cuid(),
});

export const vendorFilterSchema = z.object({
  search: z.string().optional(),
  category: z
    .enum([
      "FABRICATION",
      "PRINTING",
      "CATERING",
      "AV",
      "FLORAL",
      "LIGHTING",
      "FURNITURE",
      "STAFFING",
      "TRANSPORT",
      "PHOTOGRAPHY",
      "SIGNAGE",
      "OTHER",
    ])
    .optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  perPage: z.coerce.number().int().positive().max(100).optional().default(20),
});

export type CreateVendorInput = z.infer<typeof createVendorSchema>;
export type UpdateVendorInput = z.infer<typeof updateVendorSchema>;
export type VendorFilterInput = z.infer<typeof vendorFilterSchema>;

export const VENDOR_CATEGORY_LABELS: Record<string, string> = {
  FABRICATION: "Fabrication",
  PRINTING: "Printing",
  CATERING: "Catering",
  AV: "AV / Audio-Visual",
  FLORAL: "Floral",
  LIGHTING: "Lighting",
  FURNITURE: "Furniture",
  STAFFING: "Staffing",
  TRANSPORT: "Transport",
  PHOTOGRAPHY: "Photography",
  SIGNAGE: "Signage",
  OTHER: "Other",
};
