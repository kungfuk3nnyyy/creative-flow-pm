import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

interface LogActivityParams {
  organizationId: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  projectId?: string;
  metadata?: Prisma.InputJsonValue;
}

/**
 * Log an activity event. Called from server actions after mutations.
 * Non-blocking - failures are logged but do not throw.
 */
export async function logActivity(params: LogActivityParams): Promise<void> {
  try {
    await prisma.activityLog.create({
      data: {
        organizationId: params.organizationId,
        userId: params.userId,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        projectId: params.projectId,
        metadata: params.metadata ?? undefined,
      },
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
}
