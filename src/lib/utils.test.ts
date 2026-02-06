import { describe, it, expect } from "vitest";
import { cn, formatMoney, formatDate } from "./utils";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("px-4", "py-2")).toBe("px-4 py-2");
  });

  it("handles conditional classes", () => {
    expect(cn("base", false && "hidden", "visible")).toBe("base visible");
  });

  it("deduplicates tailwind classes", () => {
    expect(cn("px-4", "px-6")).toBe("px-6");
  });

  it("handles undefined and null", () => {
    expect(cn("base", undefined, null, "end")).toBe("base end");
  });
});

describe("formatMoney", () => {
  it("formats positive cents to KES", () => {
    expect(formatMoney(15099)).toBe("Ksh\u00a0150.99");
  });

  it("formats zero", () => {
    expect(formatMoney(0)).toBe("Ksh\u00a00.00");
  });

  it("formats large amounts with commas", () => {
    expect(formatMoney(10000000)).toBe("Ksh\u00a0100,000.00");
  });

  it("formats negative amounts", () => {
    expect(formatMoney(-500)).toBe("-Ksh\u00a05.00");
  });
});

describe("formatDate", () => {
  it("formats Date object", () => {
    const result = formatDate(new Date("2026-01-15"));
    expect(result).toContain("Jan");
    expect(result).toContain("15");
    expect(result).toContain("2026");
  });

  it("formats date string", () => {
    const result = formatDate("2026-06-30");
    expect(result).toContain("Jun");
    expect(result).toContain("30");
    expect(result).toContain("2026");
  });
});
