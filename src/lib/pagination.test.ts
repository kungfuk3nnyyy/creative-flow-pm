import { describe, it, expect } from "vitest";
import {
  parseCursorParams,
  buildCursorArgs,
  processCursorResults,
  parseOffsetParams,
  buildOffsetArgs,
} from "./pagination";

describe("parseCursorParams", () => {
  it("parses defaults when no params provided", () => {
    const params = new URLSearchParams();
    const result = parseCursorParams(params);
    expect(result.cursor).toBeUndefined();
    expect(result.limit).toBe(20);
    expect(result.direction).toBe("forward");
  });

  it("parses all params", () => {
    const params = new URLSearchParams({
      cursor: "abc123",
      limit: "10",
      direction: "backward",
    });
    const result = parseCursorParams(params);
    expect(result.cursor).toBe("abc123");
    expect(result.limit).toBe(10);
    expect(result.direction).toBe("backward");
  });

  it("clamps limit to max 100", () => {
    const params = new URLSearchParams({ limit: "500" });
    expect(parseCursorParams(params).limit).toBe(100);
  });

  it("clamps limit to min 1", () => {
    const params = new URLSearchParams({ limit: "-5" });
    expect(parseCursorParams(params).limit).toBe(1);
  });
});

describe("buildCursorArgs", () => {
  it("builds args without cursor", () => {
    const args = buildCursorArgs({ limit: 10 });
    expect(args.take).toBe(11); // limit + 1 for hasMore check
    expect(args.cursor).toBeUndefined();
    expect(args.skip).toBeUndefined();
  });

  it("builds args with cursor", () => {
    const args = buildCursorArgs({ cursor: "abc", limit: 10 });
    expect(args.take).toBe(11);
    expect(args.cursor).toEqual({ id: "abc" });
    expect(args.skip).toBe(1);
  });

  it("uses negative take for backward direction", () => {
    const args = buildCursorArgs({ limit: 10, direction: "backward" });
    expect(args.take).toBe(-11);
  });
});

describe("processCursorResults", () => {
  const makeItems = (count: number) =>
    Array.from({ length: count }, (_, i) => ({ id: `item-${i}` }));

  it("returns hasMore=false when items <= limit", () => {
    const result = processCursorResults(makeItems(5), 10);
    expect(result.hasMore).toBe(false);
    expect(result.items).toHaveLength(5);
    expect(result.nextCursor).toBeNull();
  });

  it("returns hasMore=true when items > limit", () => {
    const result = processCursorResults(makeItems(11), 10);
    expect(result.hasMore).toBe(true);
    expect(result.items).toHaveLength(10); // trimmed
    expect(result.nextCursor).toBe("item-9");
  });

  it("returns prevCursor when cursor was provided", () => {
    const result = processCursorResults(makeItems(5), 10, "forward", "prev-cursor");
    expect(result.prevCursor).toBe("item-0");
  });

  it("returns null prevCursor when no cursor provided", () => {
    const result = processCursorResults(makeItems(5), 10);
    expect(result.prevCursor).toBeNull();
  });

  it("handles empty results", () => {
    const result = processCursorResults([], 10);
    expect(result.items).toHaveLength(0);
    expect(result.hasMore).toBe(false);
    expect(result.nextCursor).toBeNull();
  });
});

describe("parseOffsetParams", () => {
  it("parses defaults", () => {
    const params = new URLSearchParams();
    const result = parseOffsetParams(params);
    expect(result.page).toBe(1);
    expect(result.perPage).toBe(20);
  });

  it("parses custom values", () => {
    const params = new URLSearchParams({ page: "3", perPage: "50" });
    const result = parseOffsetParams(params);
    expect(result.page).toBe(3);
    expect(result.perPage).toBe(50);
  });

  it("clamps page to min 1", () => {
    const params = new URLSearchParams({ page: "-1" });
    expect(parseOffsetParams(params).page).toBe(1);
  });
});

describe("buildOffsetArgs", () => {
  it("calculates skip and take", () => {
    expect(buildOffsetArgs({ page: 1, perPage: 20 })).toEqual({
      skip: 0,
      take: 20,
    });
    expect(buildOffsetArgs({ page: 3, perPage: 10 })).toEqual({
      skip: 20,
      take: 10,
    });
  });
});
