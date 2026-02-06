import { describe, it, expect } from "vitest";
import { cents, basisPoints, quantityThousandths } from "./types";

describe("Branded type constructors", () => {
  describe("cents()", () => {
    it("accepts valid integers", () => {
      expect(cents(0)).toBe(0);
      expect(cents(100)).toBe(100);
      expect(cents(-500)).toBe(-500);
      expect(cents(99999999)).toBe(99999999);
    });

    it("rejects non-integer values", () => {
      expect(() => cents(1.5)).toThrow("Cents must be an integer");
      expect(() => cents(0.01)).toThrow("Cents must be an integer");
      expect(() => cents(100.001)).toThrow("Cents must be an integer");
    });

    it("rejects NaN and Infinity", () => {
      expect(() => cents(NaN)).toThrow("Cents must be an integer");
      expect(() => cents(Infinity)).toThrow("Cents must be an integer");
    });
  });

  describe("basisPoints()", () => {
    it("accepts valid integers", () => {
      expect(basisPoints(0)).toBe(0);
      expect(basisPoints(1600)).toBe(1600); // 16.00%
      expect(basisPoints(10000)).toBe(10000); // 100%
    });

    it("rejects non-integer values", () => {
      expect(() => basisPoints(16.5)).toThrow("BasisPoints must be an integer");
    });
  });

  describe("quantityThousandths()", () => {
    it("accepts valid integers", () => {
      expect(quantityThousandths(1000)).toBe(1000); // 1.0
      expect(quantityThousandths(2500)).toBe(2500); // 2.5
      expect(quantityThousandths(500)).toBe(500); // 0.5
    });

    it("rejects non-integer values", () => {
      expect(() => quantityThousandths(2.5)).toThrow(
        "QuantityThousandths must be an integer",
      );
    });
  });
});
