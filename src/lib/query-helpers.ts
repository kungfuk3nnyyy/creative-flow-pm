/**
 * Query optimization helpers.
 * Prevents N+1 queries and provides common Prisma include patterns.
 */

/**
 * Standard project list includes to prevent N+1 on counts.
 */
export const PROJECT_LIST_INCLUDE = {
  _count: {
    select: {
      milestones: true,
      expenses: true,
      invoices: true,
      files: true,
      comments: true,
    },
  },
} as const;

/**
 * Standard expense list includes to prevent N+1 on relations.
 */
export const EXPENSE_LIST_INCLUDE = {
  submittedBy: { select: { id: true, name: true } },
  approvedBy: { select: { id: true, name: true } },
  budgetCategory: { select: { id: true, name: true } },
  vendor: { select: { id: true, name: true } },
  _count: { select: { attachments: true } },
} as const;

/**
 * Standard invoice list includes.
 */
export const INVOICE_LIST_INCLUDE = {
  lineItems: {
    select: {
      id: true,
      description: true,
      quantityThousandths: true,
      unitPriceCents: true,
      amountCents: true,
      sortOrder: true,
    },
    orderBy: { sortOrder: "asc" as const },
  },
  _count: { select: { payments: true } },
} as const;

/**
 * Standard payment list includes.
 */
export const PAYMENT_LIST_INCLUDE = {
  invoice: {
    select: {
      id: true,
      invoiceNumber: true,
      clientName: true,
      totalCents: true,
      balanceDueCents: true,
    },
  },
} as const;

/**
 * Select only the fields needed for search results.
 * Prevents fetching large text fields unnecessarily.
 */
export const PROJECT_SEARCH_SELECT = {
  id: true,
  name: true,
  clientName: true,
  status: true,
  type: true,
} as const;

export const INVOICE_SEARCH_SELECT = {
  id: true,
  invoiceNumber: true,
  clientName: true,
  status: true,
  totalCents: true,
  projectId: true,
} as const;

/**
 * Batch multiple related queries in a single Prisma transaction.
 * Reduces round-trips to the database.
 */
export function batchQueries<T extends readonly unknown[]>(
  ...queries: [...T]
): Promise<{ [K in keyof T]: Awaited<T[K]> }> {
  return Promise.all(queries) as Promise<{ [K in keyof T]: Awaited<T[K]> }>;
}
