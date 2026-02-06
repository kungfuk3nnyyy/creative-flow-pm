import { describe, it, expect } from "vitest";
import {
  addCents,
  subtractCents,
  sumCents,
  lineItemAmount,
  applyRate,
  toPercentage,
  formatBasisPoints,
} from "./money";
import { cents, basisPoints, quantityThousandths } from "./types";
import type { Cents, BasisPoints, QuantityThousandths } from "./types";

describe("addCents", () => {
  it("adds two cent values", () => {
    expect(addCents(cents(100), cents(200))).toBe(300);
  });

  it("handles zero", () => {
    expect(addCents(cents(0), cents(500))).toBe(500);
  });

  it("handles negative values", () => {
    expect(addCents(cents(100), cents(-50))).toBe(50);
  });
});

describe("subtractCents", () => {
  it("subtracts b from a", () => {
    expect(subtractCents(cents(500), cents(200))).toBe(300);
  });

  it("can produce negative result", () => {
    expect(subtractCents(cents(100), cents(250))).toBe(-150);
  });
});

describe("sumCents", () => {
  it("sums an array of cent values", () => {
    expect(sumCents([cents(100), cents(200), cents(300)])).toBe(600);
  });

  it("returns zero for empty array", () => {
    expect(sumCents([])).toBe(0);
  });

  it("handles single element", () => {
    expect(sumCents([cents(42)])).toBe(42);
  });
});

describe("lineItemAmount", () => {
  it("calculates simple whole quantity", () => {
    // $100.00 * 2.0 = $200.00
    expect(
      lineItemAmount(cents(10000), quantityThousandths(2000)),
    ).toBe(20000);
  });

  it("calculates fractional quantity", () => {
    // $100.00 * 2.5 = $250.00
    expect(
      lineItemAmount(cents(10000), quantityThousandths(2500)),
    ).toBe(25000);
  });

  it("rounds half up on fractional cent results", () => {
    // $10.00 * 3.333 = $33.33 (rounds from 33.33)
    // 1000 cents * 3333 thousandths / 1000 = 3333.0 cents
    expect(
      lineItemAmount(cents(1000), quantityThousandths(3333)),
    ).toBe(3333);
  });

  it("handles the penny problem - fractional cent rounding", () => {
    // $33.33 * 3 thousandths = $33.33 * 0.003 = $0.09999 -> rounds to $0.10
    // 3333 cents * 3 thousandths / 1000 = 9.999 -> rounds to 10
    expect(
      lineItemAmount(cents(3333), quantityThousandths(3)),
    ).toBe(10);
  });

  it("handles unit quantity", () => {
    // $50.00 * 1.0 = $50.00
    expect(
      lineItemAmount(cents(5000), quantityThousandths(1000)),
    ).toBe(5000);
  });

  it("handles zero quantity", () => {
    expect(
      lineItemAmount(cents(5000), quantityThousandths(0)),
    ).toBe(0);
  });

  it("handles zero price", () => {
    expect(
      lineItemAmount(cents(0), quantityThousandths(2500)),
    ).toBe(0);
  });
});

describe("applyRate", () => {
  it("calculates 16% of $100.00", () => {
    // 10000 cents * 1600bp / 10000 = 1600 cents = $16.00
    expect(applyRate(cents(10000), basisPoints(1600))).toBe(1600);
  });

  it("calculates 10% tax", () => {
    // 25000 cents * 1000bp / 10000 = 2500 cents = $25.00
    expect(applyRate(cents(25000), basisPoints(1000))).toBe(2500);
  });

  it("rounds half up on fractional result", () => {
    // 1001 cents * 1000bp / 10000 = 100.1 -> rounds to 100
    expect(applyRate(cents(1001), basisPoints(1000))).toBe(100);
    // 1005 cents * 1000bp / 10000 = 100.5 -> rounds to 101 (half up)
    expect(applyRate(cents(1005), basisPoints(1000))).toBe(101);
  });

  it("handles zero rate", () => {
    expect(applyRate(cents(10000), basisPoints(0))).toBe(0);
  });

  it("handles zero amount", () => {
    expect(applyRate(cents(0), basisPoints(1600))).toBe(0);
  });

  it("handles 100% rate", () => {
    expect(applyRate(cents(5000), basisPoints(10000))).toBe(5000);
  });
});

describe("toPercentage", () => {
  it("calculates 25% as basis points", () => {
    expect(toPercentage(cents(2500), cents(10000))).toBe(2500);
  });

  it("calculates 100% as basis points", () => {
    expect(toPercentage(cents(10000), cents(10000))).toBe(10000);
  });

  it("handles zero total gracefully", () => {
    expect(toPercentage(cents(100), cents(0))).toBe(0);
  });

  it("handles fractional percentages with rounding", () => {
    // 1 / 3 = 33.33...% = 3333bp (rounded)
    expect(toPercentage(cents(1), cents(3))).toBe(3333);
  });
});

describe("formatBasisPoints", () => {
  it("formats 1600bp as 16.00%", () => {
    expect(formatBasisPoints(basisPoints(1600))).toBe("16.00%");
  });

  it("formats 100bp as 1.00%", () => {
    expect(formatBasisPoints(basisPoints(100))).toBe("1.00%");
  });

  it("formats 0bp as 0.00%", () => {
    expect(formatBasisPoints(basisPoints(0))).toBe("0.00%");
  });

  it("formats 10000bp as 100.00%", () => {
    expect(formatBasisPoints(basisPoints(10000))).toBe("100.00%");
  });

  it("formats 50bp as 0.50%", () => {
    expect(formatBasisPoints(basisPoints(50))).toBe("0.50%");
  });
});
