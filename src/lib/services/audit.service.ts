import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

interface AuditLogParams {
  organizationId: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  beforeData?: Prisma.InputJsonValue;
  afterData?: Prisma.InputJsonValue;
}

/**
 * Create an immutable financial audit log entry.
 * Separate from ActivityLog for compliance purposes.
 * Never updated, never deleted.
 */
export async function createFinancialAuditLog(
  params: AuditLogParams,
): Promise<void> {
  await prisma.financialAuditLog.create({
    data: {
      organizationId: params.organizationId,
      userId: params.userId,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      beforeData: params.beforeData ?? undefined,
      afterData: params.afterData ?? undefined,
    },
  });
}
