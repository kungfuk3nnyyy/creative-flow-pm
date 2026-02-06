import { describe, it, expect } from "vitest";
import {
  calculateInvoiceTotals,
  validateInvoiceIntegrity,
  generateInvoiceNumber,
  calculateDueDate,
  formatQuantity,
} from "./invoice";

describe("calculateInvoiceTotals", () => {
  it("calculates totals for simple line items", () => {
    const result = calculateInvoiceTotals(
      [
        { unitPriceCents: 10000, quantityThousandths: 1000 }, // $100 * 1 = $100
        { unitPriceCents: 5000, quantityThousandths: 2000 }, // $50 * 2 = $100
      ],
      0, // no tax
    );

    expect(result.subtotalCents).toBe(20000);
    expect(result.taxAmountCents).toBe(0);
    expect(result.totalCents).toBe(20000);
  });

  it("applies tax correctly", () => {
    const result = calculateInvoiceTotals(
      [{ unitPriceCents: 10000, quantityThousandths: 1000 }], // $100
      1000, // 10% tax
    );

    expect(result.subtotalCents).toBe(10000);
    expect(result.taxAmountCents).toBe(1000);
    expect(result.totalCents).toBe(11000);
  });

  it("handles fractional quantities with tax", () => {
    const result = calculateInvoiceTotals(
      [{ unitPriceCents: 3333, quantityThousandths: 2500 }], // $33.33 * 2.5 = $83.325 -> $83.33
      1600, // 16% tax
    );

    // Subtotal: 3333 * 2500 / 1000 = 8332.5 -> 8333 (round half up)
    expect(result.subtotalCents).toBe(8333);
    // Tax: 8333 * 1600 / 10000 = 1333.28 -> 1333
    expect(result.taxAmountCents).toBe(1333);
    // Total: 8333 + 1333 = 9666
    expect(result.totalCents).toBe(9666);
  });

  it("handles empty line items", () => {
    const result = calculateInvoiceTotals([], 1000);
    expect(result.subtotalCents).toBe(0);
    expect(result.taxAmountCents).toBe(0);
    expect(result.totalCents).toBe(0);
  });

  it("maintains consistency: total = subtotal + tax", () => {
    const lineItems = [
      { unitPriceCents: 9999, quantityThousandths: 3333 },
      { unitPriceCents: 1234, quantityThousandths: 5678 },
      { unitPriceCents: 77777, quantityThousandths: 100 },
    ];

    const result = calculateInvoiceTotals(lineItems, 875);
    expect(result.totalCents).toBe(result.subtotalCents + result.taxAmountCents);
  });

  it("recalculated totals are deterministic", () => {
    const lineItems = [
      { unitPriceCents: 5599, quantityThousandths: 1500 },
      { unitPriceCents: 12000, quantityThousandths: 750 },
    ];

    const first = calculateInvoiceTotals(lineItems, 800);
    const second = calculateInvoiceTotals(lineItems, 800);
    expect(first).toEqual(second);
  });
});

describe("validateInvoiceIntegrity", () => {
  it("returns true when totals match", () => {
    const lineItems = [
      { unitPriceCents: 10000, quantityThousandths: 1000 },
    ];
    const totals = calculateInvoiceTotals(lineItems, 1000);

    expect(
      validateInvoiceIntegrity(
        totals.subtotalCents,
        totals.taxAmountCents,
        totals.totalCents,
        lineItems,
        1000,
      ),
    ).toBe(true);
  });

  it("returns false when subtotal is wrong", () => {
    expect(
      validateInvoiceIntegrity(
        9999, // wrong
        1000,
        10999,
        [{ unitPriceCents: 10000, quantityThousandths: 1000 }],
        1000,
      ),
    ).toBe(false);
  });

  it("returns false when tax is wrong", () => {
    expect(
      validateInvoiceIntegrity(
        10000,
        999, // wrong
        10999,
        [{ unitPriceCents: 10000, quantityThousandths: 1000 }],
        1000,
      ),
    ).toBe(false);
  });
});

describe("generateInvoiceNumber", () => {
  it("generates correct format", () => {
    expect(generateInvoiceNumber("202602", 1)).toBe("INV-202602-0001");
    expect(generateInvoiceNumber("202612", 42)).toBe("INV-202612-0042");
    expect(generateInvoiceNumber("202601", 999)).toBe("INV-202601-0999");
  });

  it("handles large sequence numbers", () => {
    expect(generateInvoiceNumber("202602", 10000)).toBe("INV-202602-10000");
  });
});

describe("calculateDueDate", () => {
  const issueDate = new Date("2026-02-01");

  it("DUE_ON_RECEIPT returns same date", () => {
    const result = calculateDueDate(issueDate, "DUE_ON_RECEIPT");
    expect(result.toISOString().split("T")[0]).toBe("2026-02-01");
  });

  it("NET_15 adds 15 days", () => {
    const result = calculateDueDate(issueDate, "NET_15");
    expect(result.toISOString().split("T")[0]).toBe("2026-02-16");
  });

  it("NET_30 adds 30 days", () => {
    const result = calculateDueDate(issueDate, "NET_30");
    expect(result.toISOString().split("T")[0]).toBe("2026-03-03");
  });

  it("NET_60 adds 60 days", () => {
    const result = calculateDueDate(issueDate, "NET_60");
    expect(result.toISOString().split("T")[0]).toBe("2026-04-02");
  });

  it("MILESTONE defaults to 30 days", () => {
    const result = calculateDueDate(issueDate, "MILESTONE");
    expect(result.toISOString().split("T")[0]).toBe("2026-03-03");
  });

  it("unknown terms default to 30 days", () => {
    const result = calculateDueDate(issueDate, "CUSTOM");
    expect(result.toISOString().split("T")[0]).toBe("2026-03-03");
  });
});

describe("formatQuantity", () => {
  it("formats whole numbers without decimal", () => {
    expect(formatQuantity(1000)).toBe("1");
    expect(formatQuantity(5000)).toBe("5");
    expect(formatQuantity(10000)).toBe("10");
  });

  it("formats fractional quantities", () => {
    expect(formatQuantity(2500)).toBe("2.5");
    expect(formatQuantity(1500)).toBe("1.5");
  });

  it("formats zero", () => {
    expect(formatQuantity(0)).toBe("0");
  });
});
