import {
  Decimal,
  type Cents,
  type BasisPoints,
  type QuantityThousandths,
  cents,
} from "./types";
import { lineItemAmount, applyRate, sumCents } from "./money";

interface LineItemInput {
  unitPriceCents: number;
  quantityThousandths: number;
}

interface InvoiceTotals {
  subtotalCents: Cents;
  taxAmountCents: Cents;
  totalCents: Cents;
}

/**
 * Calculate invoice totals from line items and tax rate.
 * Server always recalculates - client-submitted totals are ignored.
 */
export function calculateInvoiceTotals(
  lineItems: LineItemInput[],
  taxRateBasisPoints: number,
): InvoiceTotals {
  const itemAmounts = lineItems.map((item) =>
    lineItemAmount(
      cents(item.unitPriceCents),
      item.quantityThousandths as QuantityThousandths,
    ),
  );

  const subtotalCents = sumCents(itemAmounts);
  const taxAmountCents = applyRate(subtotalCents, taxRateBasisPoints as BasisPoints);
  const totalCents = cents(subtotalCents + taxAmountCents);

  return { subtotalCents, taxAmountCents, totalCents };
}

/**
 * Validate that an invoice's stored totals match recalculated values.
 * Returns true if totals are consistent, false if discrepancy found.
 */
export function validateInvoiceIntegrity(
  storedSubtotalCents: number,
  storedTaxAmountCents: number,
  storedTotalCents: number,
  lineItems: LineItemInput[],
  taxRateBasisPoints: number,
): boolean {
  const calculated = calculateInvoiceTotals(lineItems, taxRateBasisPoints);
  return (
    calculated.subtotalCents === storedSubtotalCents &&
    calculated.taxAmountCents === storedTaxAmountCents &&
    calculated.totalCents === storedTotalCents
  );
}

/**
 * Generate a sequential invoice number for an organization.
 * Format: INV-YYYYMM-NNNN (e.g., INV-202602-0001)
 */
export function generateInvoiceNumber(
  yearMonth: string,
  sequenceNumber: number,
): string {
  const padded = String(sequenceNumber).padStart(4, "0");
  return `INV-${yearMonth}-${padded}`;
}

/**
 * Calculate the due date based on payment terms from the issue date.
 */
export function calculateDueDate(
  issueDate: Date,
  paymentTerms: string,
): Date {
  const due = new Date(issueDate);

  switch (paymentTerms) {
    case "DUE_ON_RECEIPT":
      return due;
    case "NET_15":
      due.setDate(due.getDate() + 15);
      return due;
    case "NET_30":
      due.setDate(due.getDate() + 30);
      return due;
    case "NET_60":
      due.setDate(due.getDate() + 60);
      return due;
    case "MILESTONE":
      due.setDate(due.getDate() + 30); // default fallback
      return due;
    default:
      due.setDate(due.getDate() + 30);
      return due;
  }
}

/**
 * Format a quantity from thousandths to a human-readable string.
 * 2500 -> "2.5", 1000 -> "1", 10500 -> "10.5"
 */
export function formatQuantity(thousandths: number): string {
  const value = new Decimal(thousandths).div(1000);
  // Remove trailing zeros
  return value.toFixed(value.mod(1).isZero() ? 0 : value.mod(0.1).isZero() ? 1 : 3);
}
