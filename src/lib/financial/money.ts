import {
  Decimal,
  type Cents,
  type BasisPoints,
  type QuantityThousandths,
  cents,
} from "./types";

/**
 * Add two Cents values safely.
 */
export function addCents(a: Cents, b: Cents): Cents {
  return cents(a + b);
}

/**
 * Subtract b from a in Cents.
 */
export function subtractCents(a: Cents, b: Cents): Cents {
  return cents(a - b);
}

/**
 * Sum an array of Cents values.
 */
export function sumCents(values: Cents[]): Cents {
  return cents(values.reduce((acc, val) => acc + val, 0));
}

/**
 * Calculate a line item amount: unitPriceCents * quantityThousandths / 1000
 * Uses Decimal.js for intermediate math, rounds half up.
 */
export function lineItemAmount(
  unitPriceCents: Cents,
  quantityThousandths: QuantityThousandths,
): Cents {
  const result = new Decimal(unitPriceCents)
    .mul(new Decimal(quantityThousandths))
    .div(1000)
    .toDecimalPlaces(0, Decimal.ROUND_HALF_UP);

  return cents(result.toNumber());
}

/**
 * Apply a basis points rate to a Cents amount.
 * Example: applyRate(10000, 1600) = 10000 * 16.00% = 1600
 */
export function applyRate(amount: Cents, rate: BasisPoints): Cents {
  const result = new Decimal(amount)
    .mul(new Decimal(rate))
    .div(10000)
    .toDecimalPlaces(0, Decimal.ROUND_HALF_UP);

  return cents(result.toNumber());
}

/**
 * Calculate percentage of total as basis points.
 * Example: toPercentage(2500, 10000) = 2500 (25.00%)
 */
export function toPercentage(part: Cents, total: Cents): BasisPoints {
  if (total === 0) return 0 as BasisPoints;

  const result = new Decimal(part)
    .mul(10000)
    .div(new Decimal(total))
    .toDecimalPlaces(0, Decimal.ROUND_HALF_UP);

  return result.toNumber() as BasisPoints;
}

/**
 * Format basis points as a human-readable percentage string.
 * Example: 1600 -> "16.00%"
 */
export function formatBasisPoints(bp: BasisPoints): string {
  const percent = new Decimal(bp).div(100).toFixed(2);
  return `${percent}%`;
}
