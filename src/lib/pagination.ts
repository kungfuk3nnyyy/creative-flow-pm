/**
 * Cursor-based pagination utilities for Prisma queries.
 * More performant than offset-based for large datasets.
 */

export interface CursorPaginationInput {
  cursor?: string;
  limit?: number;
  direction?: "forward" | "backward";
}

export interface CursorPaginationResult<T> {
  items: T[];
  nextCursor: string | null;
  prevCursor: string | null;
  hasMore: boolean;
}

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

/**
 * Parse and validate cursor pagination params from URL search params.
 */
export function parseCursorParams(
  searchParams: URLSearchParams,
): CursorPaginationInput {
  const cursor = searchParams.get("cursor") ?? undefined;
  const rawLimit = parseInt(searchParams.get("limit") ?? String(DEFAULT_LIMIT), 10);
  const limit = Math.min(Math.max(1, rawLimit), MAX_LIMIT);
  const direction =
    searchParams.get("direction") === "backward" ? "backward" : "forward";

  return { cursor, limit, direction };
}

/**
 * Build Prisma cursor pagination args.
 * Returns { take, skip, cursor, orderBy } to spread into a Prisma query.
 */
export function buildCursorArgs(input: CursorPaginationInput) {
  const { cursor, limit = DEFAULT_LIMIT, direction = "forward" } = input;

  const args: {
    take: number;
    skip?: number;
    cursor?: { id: string };
  } = {
    take: (direction === "forward" ? 1 : -1) * (limit + 1), // fetch one extra to check hasMore
  };

  if (cursor) {
    args.cursor = { id: cursor };
    args.skip = 1; // skip the cursor item itself
  }

  return args;
}

/**
 * Process Prisma results into a CursorPaginationResult.
 */
export function processCursorResults<T extends { id: string }>(
  items: T[],
  limit: number,
  direction: "forward" | "backward" = "forward",
  cursor?: string,
): CursorPaginationResult<T> {
  const hasMore = items.length > limit;
  const trimmed = hasMore ? items.slice(0, limit) : items;

  // For backward direction, reverse to maintain consistent order
  if (direction === "backward") {
    trimmed.reverse();
  }

  const firstItem = trimmed[0];
  const lastItem = trimmed[trimmed.length - 1];

  return {
    items: trimmed,
    nextCursor: hasMore && lastItem ? lastItem.id : null,
    prevCursor: cursor && firstItem ? firstItem.id : null,
    hasMore,
  };
}

/**
 * Standard offset-based pagination params parser.
 */
export interface OffsetPaginationInput {
  page: number;
  perPage: number;
}

export function parseOffsetParams(
  searchParams: URLSearchParams,
): OffsetPaginationInput {
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const rawPerPage = parseInt(searchParams.get("perPage") ?? "20", 10);
  const perPage = Math.min(Math.max(1, rawPerPage), MAX_LIMIT);
  return { page, perPage };
}

export function buildOffsetArgs(input: OffsetPaginationInput) {
  return {
    skip: (input.page - 1) * input.perPage,
    take: input.perPage,
  };
}
