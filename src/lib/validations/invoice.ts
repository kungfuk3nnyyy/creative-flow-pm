import { z } from "zod";
import { InvoiceStatus, PaymentTerms } from "@prisma/client";

export const invoiceLineItemSchema = z.object({
  description: z
    .string()
    .min(1, "Line item description is required.")
    .max(500),
  quantityThousandths: z.coerce
    .number()
    .int()
    .positive("Quantity must be positive."),
  unitPriceCents: z.coerce
    .number()
    .int()
    .min(0, "Unit price cannot be negative."),
});

export const createInvoiceSchema = z.object({
  projectId: z.string().cuid(),
  clientName: z.string().min(1, "Client name is required.").max(200),
  clientEmail: z.string().email().optional().or(z.literal("")),
  clientAddress: z.string().max(1000).optional(),
  issueDate: z.coerce.date(),
  paymentTerms: z.nativeEnum(PaymentTerms).optional().default(PaymentTerms.NET_30),
  taxRateBasisPoints: z.coerce
    .number()
    .int()
    .min(0, "Tax rate cannot be negative.")
    .max(10000, "Tax rate cannot exceed 100%.")
    .optional()
    .default(0),
  notes: z.string().max(2000).optional(),
  lineItems: z
    .array(invoiceLineItemSchema)
    .min(1, "At least one line item is required."),
});

export const updateInvoiceSchema = z.object({
  invoiceId: z.string().cuid(),
  clientName: z.string().min(1).max(200).optional(),
  clientEmail: z.string().email().optional().or(z.literal("")).nullable(),
  clientAddress: z.string().max(1000).optional().nullable(),
  paymentTerms: z.nativeEnum(PaymentTerms).optional(),
  taxRateBasisPoints: z.coerce
    .number()
    .int()
    .min(0)
    .max(10000)
    .optional(),
  notes: z.string().max(2000).optional().nullable(),
  lineItems: z.array(invoiceLineItemSchema).min(1).optional(),
});

export const invoiceFilterSchema = z.object({
  status: z.nativeEnum(InvoiceStatus).optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  pageSize: z.coerce.number().int().positive().max(100).optional().default(20),
});

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  DRAFT: "Draft",
  SENT: "Sent",
  VIEWED: "Viewed",
  PARTIALLY_PAID: "Partial",
  PAID: "Paid",
  OVERDUE: "Overdue",
  WRITTEN_OFF: "Written Off",
};

export const PAYMENT_TERMS_LABELS: Record<PaymentTerms, string> = {
  DUE_ON_RECEIPT: "Due on Receipt",
  NET_15: "Net 15",
  NET_30: "Net 30",
  NET_60: "Net 60",
  MILESTONE: "Milestone-based",
};

export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
export type UpdateInvoiceInput = z.infer<typeof updateInvoiceSchema>;
export type InvoiceFilterInput = z.infer<typeof invoiceFilterSchema>;
