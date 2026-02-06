import { describe, it, expect } from "vitest";
import { calculateAgingBuckets, findOverdueInvoices } from "./ar-aging";

describe("calculateAgingBuckets", () => {
  const asOfDate = new Date("2026-02-05");

  it("places current (not yet due) invoices in first bucket", () => {
    const result = calculateAgingBuckets(
      [
        {
          balanceDueCents: 10000,
          dueDate: new Date("2026-02-10"), // 5 days in the future
          status: "SENT",
        },
      ],
      asOfDate,
    );

    expect(result.buckets[0].label).toBe("Current");
    expect(result.buckets[0].totalCents).toBe(10000);
    expect(result.buckets[0].invoiceCount).toBe(1);
    expect(result.totalOutstandingCents).toBe(10000);
    expect(result.totalOverdueCount).toBe(0);
  });

  it("places 1-30 day overdue invoices in second bucket", () => {
    const result = calculateAgingBuckets(
      [
        {
          balanceDueCents: 5000,
          dueDate: new Date("2026-01-20"), // 16 days overdue
          status: "SENT",
        },
      ],
      asOfDate,
    );

    expect(result.buckets[1].label).toBe("1-30 days");
    expect(result.buckets[1].totalCents).toBe(5000);
    expect(result.buckets[1].invoiceCount).toBe(1);
    expect(result.totalOverdueCount).toBe(1);
  });

  it("places 31-60 day overdue invoices in third bucket", () => {
    const result = calculateAgingBuckets(
      [
        {
          balanceDueCents: 7500,
          dueDate: new Date("2025-12-20"), // 47 days overdue
          status: "OVERDUE",
        },
      ],
      asOfDate,
    );

    expect(result.buckets[2].label).toBe("31-60 days");
    expect(result.buckets[2].totalCents).toBe(7500);
    expect(result.totalOverdueCount).toBe(1);
  });

  it("places 61-90 day overdue invoices in fourth bucket", () => {
    const result = calculateAgingBuckets(
      [
        {
          balanceDueCents: 15000,
          dueDate: new Date("2025-11-15"), // 82 days overdue
          status: "OVERDUE",
        },
      ],
      asOfDate,
    );

    expect(result.buckets[3].label).toBe("61-90 days");
    expect(result.buckets[3].totalCents).toBe(15000);
  });

  it("places 90+ day overdue invoices in fifth bucket", () => {
    const result = calculateAgingBuckets(
      [
        {
          balanceDueCents: 20000,
          dueDate: new Date("2025-10-01"), // 127 days overdue
          status: "OVERDUE",
        },
      ],
      asOfDate,
    );

    expect(result.buckets[4].label).toBe("90+ days");
    expect(result.buckets[4].totalCents).toBe(20000);
  });

  it("handles boundary: exactly 30 days overdue goes in 1-30 bucket", () => {
    const result = calculateAgingBuckets(
      [
        {
          balanceDueCents: 3000,
          dueDate: new Date("2026-01-06"), // exactly 30 days
          status: "SENT",
        },
      ],
      asOfDate,
    );

    expect(result.buckets[1].totalCents).toBe(3000);
  });

  it("handles boundary: exactly 31 days overdue goes in 31-60 bucket", () => {
    const result = calculateAgingBuckets(
      [
        {
          balanceDueCents: 3000,
          dueDate: new Date("2026-01-05"), // exactly 31 days
          status: "SENT",
        },
      ],
      asOfDate,
    );

    expect(result.buckets[2].totalCents).toBe(3000);
  });

  it("handles boundary: exactly 90 days overdue goes in 61-90 bucket", () => {
    const result = calculateAgingBuckets(
      [
        {
          balanceDueCents: 3000,
          dueDate: new Date("2025-11-07"), // exactly 90 days
          status: "SENT",
        },
      ],
      asOfDate,
    );

    expect(result.buckets[3].totalCents).toBe(3000);
  });

  it("handles boundary: exactly 91 days overdue goes in 90+ bucket", () => {
    const result = calculateAgingBuckets(
      [
        {
          balanceDueCents: 3000,
          dueDate: new Date("2025-11-06"), // exactly 91 days
          status: "SENT",
        },
      ],
      asOfDate,
    );

    expect(result.buckets[4].totalCents).toBe(3000);
  });

  it("skips invoices with zero balance", () => {
    const result = calculateAgingBuckets(
      [
        {
          balanceDueCents: 0,
          dueDate: new Date("2025-12-01"),
          status: "PAID",
        },
      ],
      asOfDate,
    );

    expect(result.totalOutstandingCents).toBe(0);
    expect(result.buckets.every((b) => b.invoiceCount === 0)).toBe(true);
  });

  it("aggregates multiple invoices across buckets", () => {
    const result = calculateAgingBuckets(
      [
        { balanceDueCents: 1000, dueDate: new Date("2026-02-10"), status: "SENT" }, // current
        { balanceDueCents: 2000, dueDate: new Date("2026-01-20"), status: "SENT" }, // 1-30
        { balanceDueCents: 3000, dueDate: new Date("2026-01-15"), status: "SENT" }, // 1-30
        { balanceDueCents: 4000, dueDate: new Date("2025-12-10"), status: "OVERDUE" }, // 31-60
      ],
      asOfDate,
    );

    expect(result.buckets[0].totalCents).toBe(1000);
    expect(result.buckets[1].totalCents).toBe(5000);
    expect(result.buckets[2].totalCents).toBe(4000);
    expect(result.totalOutstandingCents).toBe(10000);
    expect(result.totalOverdueCount).toBe(3);
  });

  it("returns empty buckets for empty input", () => {
    const result = calculateAgingBuckets([], asOfDate);
    expect(result.totalOutstandingCents).toBe(0);
    expect(result.totalOverdueCount).toBe(0);
    expect(result.buckets).toHaveLength(5);
  });
});

describe("findOverdueInvoices", () => {
  const asOfDate = new Date("2026-02-05");

  it("identifies overdue SENT invoices", () => {
    const result = findOverdueInvoices(
      [
        { id: "inv-1", status: "SENT", dueDate: new Date("2026-01-01"), balanceDueCents: 5000 },
        { id: "inv-2", status: "SENT", dueDate: new Date("2026-02-10"), balanceDueCents: 5000 }, // not yet due
      ],
      asOfDate,
    );

    expect(result).toEqual(["inv-1"]);
  });

  it("identifies overdue PARTIALLY_PAID invoices", () => {
    const result = findOverdueInvoices(
      [
        { id: "inv-1", status: "PARTIALLY_PAID", dueDate: new Date("2026-01-15"), balanceDueCents: 3000 },
      ],
      asOfDate,
    );

    expect(result).toEqual(["inv-1"]);
  });

  it("identifies overdue VIEWED invoices", () => {
    const result = findOverdueInvoices(
      [
        { id: "inv-1", status: "VIEWED", dueDate: new Date("2026-01-20"), balanceDueCents: 2000 },
      ],
      asOfDate,
    );

    expect(result).toEqual(["inv-1"]);
  });

  it("excludes DRAFT invoices even if past due", () => {
    const result = findOverdueInvoices(
      [
        { id: "inv-1", status: "DRAFT", dueDate: new Date("2025-12-01"), balanceDueCents: 5000 },
      ],
      asOfDate,
    );

    expect(result).toEqual([]);
  });

  it("excludes PAID invoices", () => {
    const result = findOverdueInvoices(
      [
        { id: "inv-1", status: "PAID", dueDate: new Date("2025-12-01"), balanceDueCents: 0 },
      ],
      asOfDate,
    );

    expect(result).toEqual([]);
  });

  it("excludes invoices with zero balance", () => {
    const result = findOverdueInvoices(
      [
        { id: "inv-1", status: "SENT", dueDate: new Date("2025-12-01"), balanceDueCents: 0 },
      ],
      asOfDate,
    );

    expect(result).toEqual([]);
  });

  it("returns empty array for no invoices", () => {
    expect(findOverdueInvoices([], asOfDate)).toEqual([]);
  });
});
