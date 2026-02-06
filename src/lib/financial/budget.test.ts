import { describe, it, expect } from "vitest";
import {
  allocateFromTemplate,
  calculateVariance,
  formatCents,
  parseDollarsToCents,
} from "./budget";
import { cents } from "./types";
import { BUDGET_TEMPLATES } from "./constants";

describe("allocateFromTemplate", () => {
  it("allocates exactly to total using largest remainder method", () => {
    const result = allocateFromTemplate(
      cents(100000), // $1,000.00
      BUDGET_TEMPLATES.INTERIOR_DESIGN.categories,
    );

    const sum = result.reduce((s, r) => s + r.allocatedCents, 0);
    expect(sum).toBe(100000);
  });

  it("handles odd amounts without losing pennies", () => {
    const result = allocateFromTemplate(
      cents(33333), // $333.33
      BUDGET_TEMPLATES.INTERIOR_DESIGN.categories,
    );

    const sum = result.reduce((s, r) => s + r.allocatedCents, 0);
    expect(sum).toBe(33333);
  });

  it("handles single-cent budget", () => {
    const result = allocateFromTemplate(cents(1), BUDGET_TEMPLATES.OTHER.categories);

    const sum = result.reduce((s, r) => s + r.allocatedCents, 0);
    expect(sum).toBe(1);
  });

  it("handles zero budget", () => {
    const result = allocateFromTemplate(cents(0), BUDGET_TEMPLATES.OTHER.categories);

    const sum = result.reduce((s, r) => s + r.allocatedCents, 0);
    expect(sum).toBe(0);
  });

  it("returns empty array for empty categories", () => {
    const result = allocateFromTemplate(cents(10000), []);
    expect(result).toEqual([]);
  });

  it("preserves category names and order", () => {
    const template = BUDGET_TEMPLATES.CONFERENCE_DECOR;
    const result = allocateFromTemplate(cents(50000), template.categories);

    expect(result.map((r) => r.name)).toEqual(template.categories.map((c) => c.name));
  });

  it("allocates correctly for all project type templates", () => {
    for (const [key, template] of Object.entries(BUDGET_TEMPLATES)) {
      // Verify template basis points sum to 10000
      const totalBp = template.categories.reduce((s, c) => s + c.allocationBasisPoints, 0);
      expect(totalBp).toBe(10000);

      // Verify allocation sums exactly
      const result = allocateFromTemplate(cents(999999), template.categories);
      const sum = result.reduce((s, r) => s + r.allocatedCents, 0);
      expect(sum).toBe(999999);
    }
  });

  it("handles large budget without overflow", () => {
    const result = allocateFromTemplate(
      cents(50000000), // $500,000.00
      BUDGET_TEMPLATES.EXHIBITION.categories,
    );

    const sum = result.reduce((s, r) => s + r.allocatedCents, 0);
    expect(sum).toBe(50000000);
  });
});

describe("calculateVariance", () => {
  it("shows under budget correctly", () => {
    const result = calculateVariance(cents(10000), cents(7000));
    expect(result.remainingCents).toBe(3000);
    expect(result.variancePercent).toBe(30);
    expect(result.isOverBudget).toBe(false);
  });

  it("shows over budget correctly", () => {
    const result = calculateVariance(cents(10000), cents(12000));
    expect(result.remainingCents).toBe(-2000);
    expect(result.variancePercent).toBe(-20);
    expect(result.isOverBudget).toBe(true);
  });

  it("shows exact budget match", () => {
    const result = calculateVariance(cents(10000), cents(10000));
    expect(result.remainingCents).toBe(0);
    expect(result.variancePercent).toBe(0);
    expect(result.isOverBudget).toBe(false);
  });

  it("handles zero allocated budget", () => {
    const result = calculateVariance(cents(0), cents(500));
    expect(result.remainingCents).toBe(-500);
    expect(result.variancePercent).toBe(0);
    expect(result.isOverBudget).toBe(true);
  });

  it("handles zero spent", () => {
    const result = calculateVariance(cents(10000), cents(0));
    expect(result.remainingCents).toBe(10000);
    expect(result.variancePercent).toBe(100);
    expect(result.isOverBudget).toBe(false);
  });
});

describe("formatCents", () => {
  it("formats positive amounts", () => {
    expect(formatCents(150075)).toBe("Ksh\u00a01,500.75");
    expect(formatCents(100)).toBe("Ksh\u00a01.00");
    expect(formatCents(1)).toBe("Ksh\u00a00.01");
  });

  it("formats zero", () => {
    expect(formatCents(0)).toBe("Ksh\u00a00.00");
  });

  it("formats negative amounts", () => {
    expect(formatCents(-500)).toBe("-Ksh\u00a05.00");
  });

  it("formats large amounts with commas", () => {
    expect(formatCents(10000000)).toBe("Ksh\u00a0100,000.00");
  });
});

describe("parseDollarsToCents", () => {
  it("parses simple dollar amounts", () => {
    expect(parseDollarsToCents("150")).toBe(15000);
    expect(parseDollarsToCents("1500.75")).toBe(150075);
  });

  it("strips currency symbols and commas", () => {
    expect(parseDollarsToCents("$1,500.75")).toBe(150075);
    expect(parseDollarsToCents("$100")).toBe(10000);
    expect(parseDollarsToCents("Ksh 1,500.75")).toBe(150075);
    expect(parseDollarsToCents("KSh 100")).toBe(10000);
  });

  it("rounds half up", () => {
    expect(parseDollarsToCents("10.005")).toBe(1001);
    expect(parseDollarsToCents("10.004")).toBe(1000);
  });

  it("handles zero", () => {
    expect(parseDollarsToCents("0")).toBe(0);
    expect(parseDollarsToCents("0.00")).toBe(0);
  });

  it("throws on invalid input", () => {
    expect(() => parseDollarsToCents("abc")).toThrow();
    expect(() => parseDollarsToCents("")).toThrow();
  });
});
