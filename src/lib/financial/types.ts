import Decimal from "decimal.js";

// Configure Decimal.js for financial calculations
Decimal.set({
  precision: 20,
  rounding: Decimal.ROUND_HALF_UP,
});

/**
 * Branded type for monetary values stored as integer cents.
 * Prevents accidental mixing of cents with other integers.
 */
export type Cents = number & { readonly __brand: "Cents" };

/**
 * Branded type for percentage values stored as basis points.
 * 1600 = 16.00%, 100 = 1.00%, 1 = 0.01%
 */
export type BasisPoints = number & { readonly __brand: "BasisPoints" };

/**
 * Branded type for quantities stored as thousandths.
 * 2500 = 2.5 units, 1000 = 1.0 units
 */
export type QuantityThousandths = number & {
  readonly __brand: "QuantityThousandths";
};

/** Create a Cents value from a raw number */
export function cents(value: number): Cents {
  if (!Number.isInteger(value)) {
    throw new Error(`Cents must be an integer, got ${value}`);
  }
  return value as Cents;
}

/** Create a BasisPoints value from a raw number */
export function basisPoints(value: number): BasisPoints {
  if (!Number.isInteger(value)) {
    throw new Error(`BasisPoints must be an integer, got ${value}`);
  }
  return value as BasisPoints;
}

/** Create a QuantityThousandths value from a raw number */
export function quantityThousandths(value: number): QuantityThousandths {
  if (!Number.isInteger(value)) {
    throw new Error(`QuantityThousandths must be an integer, got ${value}`);
  }
  return value as QuantityThousandths;
}

export { Decimal };
