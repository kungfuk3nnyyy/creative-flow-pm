"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole, AuthError } from "@/lib/auth-utils";
import { logActivity } from "@/lib/activity";
import {
  createMilestoneSchema,
  updateMilestoneSchema,
  reorderMilestonesSchema,
} from "@/lib/validations/milestone";
import { UserRole } from "@prisma/client";

type ActionResult = {
  success: boolean;
  error?: string;
  data?: { id: string };
};

/**
 * Verify a project belongs to the user's organization.
 * Returns the project or null.
 */
async function verifyProjectAccess(projectId: string, organizationId: string) {
  return prisma.project.findFirst({
    where: { id: projectId, organizationId },
    select: { id: true, organizationId: true },
  });
}

/**
 * Create a milestone within a project.
 * Requires MEMBER role or higher.
 */
export async function createMilestoneAction(
  input: {
    projectId: string;
    name: string;
    description?: string;
    dueDate?: string;
  },
): Promise<ActionResult> {
  let user;
  try {
    user = await requireRole(UserRole.MEMBER);
  } catch (error) {
    if (error instanceof AuthError) {
      return { success: false, error: error.message };
    }
    throw error;
  }

  const parsed = createMilestoneSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message ?? "Invalid input.",
    };
  }

  const project = await verifyProjectAccess(
    parsed.data.projectId,
    user.organizationId,
  );
  if (!project) {
    return { success: false, error: "Project not found." };
  }

  // Get the next sort order
  const lastMilestone = await prisma.milestone.findFirst({
    where: { projectId: parsed.data.projectId },
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });
  const nextSortOrder = (lastMilestone?.sortOrder ?? -1) + 1;

  const milestone = await prisma.milestone.create({
    data: {
      projectId: parsed.data.projectId,
      name: parsed.data.name,
      description: parsed.data.description || null,
      dueDate: parsed.data.dueDate ?? null,
      sortOrder: nextSortOrder,
    },
  });

  await logActivity({
    organizationId: user.organizationId,
    userId: user.userId,
    action: "milestone.created",
    entityType: "Milestone",
    entityId: milestone.id,
    projectId: parsed.data.projectId,
    metadata: { name: milestone.name },
  });

  revalidatePath(`/projects/${parsed.data.projectId}/milestones`);

  return { success: true, data: { id: milestone.id } };
}

/**
 * Update a milestone.
 * Requires MEMBER role or higher.
 */
export async function updateMilestoneAction(
  input: {
    id: string;
    name?: string;
    description?: string;
    dueDate?: string | null;
  },
): Promise<ActionResult> {
  let user;
  try {
    user = await requireRole(UserRole.MEMBER);
  } catch (error) {
    if (error instanceof AuthError) {
      return { success: false, error: error.message };
    }
    throw error;
  }

  const parsed = updateMilestoneSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message ?? "Invalid input.",
    };
  }

  const milestone = await prisma.milestone.findFirst({
    where: { id: parsed.data.id },
    include: {
      project: { select: { organizationId: true, id: true } },
    },
  });

  if (!milestone || milestone.project.organizationId !== user.organizationId) {
    return { success: false, error: "Milestone not found." };
  }

  const { id, ...data } = parsed.data;

  await prisma.milestone.update({
    where: { id },
    data,
  });

  await logActivity({
    organizationId: user.organizationId,
    userId: user.userId,
    action: "milestone.updated",
    entityType: "Milestone",
    entityId: id,
    projectId: milestone.project.id,
    metadata: { fields: Object.keys(data) },
  });

  revalidatePath(`/projects/${milestone.project.id}/milestones`);

  return { success: true, data: { id } };
}

/**
 * Toggle milestone completion.
 */
export async function toggleMilestoneCompleteAction(
  milestoneId: string,
): Promise<ActionResult> {
  let user;
  try {
    user = await requireRole(UserRole.MEMBER);
  } catch (error) {
    if (error instanceof AuthError) {
      return { success: false, error: error.message };
    }
    throw error;
  }

  const milestone = await prisma.milestone.findFirst({
    where: { id: milestoneId },
    include: {
      project: { select: { organizationId: true, id: true } },
    },
  });

  if (!milestone || milestone.project.organizationId !== user.organizationId) {
    return { success: false, error: "Milestone not found." };
  }

  const isCompleting = !milestone.completedAt;

  await prisma.milestone.update({
    where: { id: milestoneId },
    data: {
      completedAt: isCompleting ? new Date() : null,
    },
  });

  await logActivity({
    organizationId: user.organizationId,
    userId: user.userId,
    action: isCompleting ? "milestone.completed" : "milestone.reopened",
    entityType: "Milestone",
    entityId: milestoneId,
    projectId: milestone.project.id,
    metadata: { name: milestone.name },
  });

  revalidatePath(`/projects/${milestone.project.id}/milestones`);

  return { success: true };
}

/**
 * Delete a milestone (cascades to tasks).
 * Requires MANAGER role or higher.
 */
export async function deleteMilestoneAction(
  milestoneId: string,
): Promise<ActionResult> {
  let user;
  try {
    user = await requireRole(UserRole.MANAGER);
  } catch (error) {
    if (error instanceof AuthError) {
      return { success: false, error: error.message };
    }
    throw error;
  }

  const milestone = await prisma.milestone.findFirst({
    where: { id: milestoneId },
    include: {
      project: { select: { organizationId: true, id: true } },
    },
  });

  if (!milestone || milestone.project.organizationId !== user.organizationId) {
    return { success: false, error: "Milestone not found." };
  }

  await prisma.milestone.delete({ where: { id: milestoneId } });

  await logActivity({
    organizationId: user.organizationId,
    userId: user.userId,
    action: "milestone.deleted",
    entityType: "Milestone",
    entityId: milestoneId,
    projectId: milestone.project.id,
    metadata: { name: milestone.name },
  });

  revalidatePath(`/projects/${milestone.project.id}/milestones`);

  return { success: true };
}

/**
 * Reorder milestones via drag-and-drop.
 * Requires MEMBER role or higher.
 */
export async function reorderMilestonesAction(
  input: { projectId: string; milestoneIds: string[] },
): Promise<ActionResult> {
  let user;
  try {
    user = await requireRole(UserRole.MEMBER);
  } catch (error) {
    if (error instanceof AuthError) {
      return { success: false, error: error.message };
    }
    throw error;
  }

  const parsed = reorderMilestonesSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message ?? "Invalid input.",
    };
  }

  const project = await verifyProjectAccess(
    parsed.data.projectId,
    user.organizationId,
  );
  if (!project) {
    return { success: false, error: "Project not found." };
  }

  // Update sort orders in a transaction
  await prisma.$transaction(
    parsed.data.milestoneIds.map((id, index) =>
      prisma.milestone.update({
        where: { id },
        data: { sortOrder: index },
      }),
    ),
  );

  revalidatePath(`/projects/${parsed.data.projectId}/milestones`);

  return { success: true };
}
