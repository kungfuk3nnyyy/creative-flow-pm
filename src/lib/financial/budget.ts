import { Decimal, type Cents, cents } from "./types";
import type { BudgetTemplate } from "./constants";

/**
 * Allocate a total budget amount across categories using their basis point weights.
 * Uses the largest remainder method to ensure allocations sum exactly to total.
 *
 * @param totalCents - The total budget in cents
 * @param categories - Array of { name, allocationBasisPoints }
 * @returns Array of { name, allocatedCents } that sum exactly to totalCents
 */
export function allocateFromTemplate(
  totalCents: Cents,
  categories: BudgetTemplate["categories"],
): { name: string; allocatedCents: Cents }[] {
  if (categories.length === 0) return [];

  const totalBasisPoints = categories.reduce((sum, cat) => sum + cat.allocationBasisPoints, 0);

  // Calculate exact allocations using Decimal.js
  const exactAllocations = categories.map((cat) => {
    const exact = new Decimal(totalCents).mul(cat.allocationBasisPoints).div(totalBasisPoints);
    const floored = exact.floor().toNumber();
    const remainder = exact.minus(floored).toNumber();

    return {
      name: cat.name,
      floored,
      remainder,
    };
  });

  // Distribute remaining cents using largest remainder method
  const totalFloored = exactAllocations.reduce((sum, a) => sum + a.floored, 0);
  let remaining = totalCents - totalFloored;

  // Sort by remainder descending to assign extra cents
  const sorted = [...exactAllocations].sort((a, b) => b.remainder - a.remainder);

  const result = new Map<string, number>();
  for (const alloc of exactAllocations) {
    result.set(alloc.name, alloc.floored);
  }

  for (const alloc of sorted) {
    if (remaining <= 0) break;
    result.set(alloc.name, (result.get(alloc.name) ?? 0) + 1);
    remaining--;
  }

  return categories.map((cat) => ({
    name: cat.name,
    allocatedCents: cents(result.get(cat.name) ?? 0),
  }));
}

/**
 * Calculate budget variance for a category.
 * Positive = under budget, Negative = over budget.
 */
export function calculateVariance(
  allocatedCents: Cents,
  spentCents: Cents,
): {
  remainingCents: Cents;
  variancePercent: number;
  isOverBudget: boolean;
} {
  const remaining = allocatedCents - spentCents;
  const variancePercent =
    allocatedCents > 0
      ? new Decimal(remaining).div(allocatedCents).mul(100).toDecimalPlaces(1).toNumber()
      : 0;

  return {
    remainingCents: cents(remaining),
    variancePercent,
    isOverBudget: remaining < 0,
  };
}

/**
 * Format cents as a KES currency string.
 * Example: 150075 -> "KSh 1,500.75"
 */
export function formatCents(value: number): string {
  const major = value / 100;
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    minimumFractionDigits: 2,
  }).format(major);
}

/**
 * Parse a dollar string input to cents.
 * Example: "1500.75" -> 150075
 * Example: "1,500" -> 150000
 */
export function parseDollarsToCents(input: string): Cents {
  const cleaned = input.replace(/Ksh|KSh|[,$\s]/gi, "");
  const dollars = new Decimal(cleaned);
  const result = dollars.mul(100).toDecimalPlaces(0, Decimal.ROUND_HALF_UP);
  return cents(result.toNumber());
}
