import { z } from "zod";

export const recordPaymentSchema = z.object({
  invoiceId: z.string().cuid(),
  amountCents: z.coerce
    .number()
    .int()
    .positive("Payment amount must be positive."),
  paymentDate: z.coerce.date(),
  paymentMethod: z.string().max(100).optional(),
  reference: z.string().max(200).optional(),
  notes: z.string().max(2000).optional(),
});

export const PAYMENT_METHOD_OPTIONS = [
  { label: "Bank Transfer", value: "bank_transfer" },
  { label: "Check", value: "check" },
  { label: "Credit Card", value: "credit_card" },
  { label: "Cash", value: "cash" },
  { label: "Mobile Payment", value: "mobile_payment" },
  { label: "Other", value: "other" },
];

export type RecordPaymentInput = z.infer<typeof recordPaymentSchema>;
