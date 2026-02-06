"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole, AuthError } from "@/lib/auth-utils";
import { logActivity } from "@/lib/activity";
import {
  createTaskSchema,
  updateTaskSchema,
  moveTaskSchema,
} from "@/lib/validations/task";
import { UserRole } from "@prisma/client";

type ActionResult = {
  success: boolean;
  error?: string;
  data?: { id: string };
};

/**
 * Verify a milestone belongs to the user's organization.
 * Returns the milestone with project info or null.
 */
async function verifyMilestoneAccess(
  milestoneId: string,
  organizationId: string,
) {
  return prisma.milestone.findFirst({
    where: { id: milestoneId },
    include: {
      project: { select: { id: true, organizationId: true } },
    },
  });
}

/**
 * Create a task within a milestone.
 */
export async function createTaskAction(
  input: {
    milestoneId: string;
    title: string;
    description?: string;
    priority?: string;
    assigneeId?: string;
    dueDate?: string;
  },
): Promise<ActionResult> {
  let user;
  try {
    user = await requireAuth();
  } catch (error) {
    if (error instanceof AuthError) {
      return { success: false, error: error.message };
    }
    throw error;
  }

  const parsed = createTaskSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message ?? "Invalid input.",
    };
  }

  const milestone = await verifyMilestoneAccess(
    parsed.data.milestoneId,
    user.organizationId,
  );
  if (
    !milestone ||
    milestone.project.organizationId !== user.organizationId
  ) {
    return { success: false, error: "Milestone not found." };
  }

  // If assigneeId is provided, verify they belong to the same org
  if (parsed.data.assigneeId) {
    const assignee = await prisma.user.findFirst({
      where: {
        id: parsed.data.assigneeId,
        organizationId: user.organizationId,
        isActive: true,
      },
    });
    if (!assignee) {
      return { success: false, error: "Assignee not found." };
    }
  }

  // Get the next sort order
  const lastTask = await prisma.task.findFirst({
    where: { milestoneId: parsed.data.milestoneId },
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });

  const task = await prisma.task.create({
    data: {
      milestoneId: parsed.data.milestoneId,
      title: parsed.data.title,
      description: parsed.data.description || null,
      priority: parsed.data.priority,
      assigneeId: parsed.data.assigneeId || null,
      creatorId: user.userId,
      dueDate: parsed.data.dueDate ?? null,
      sortOrder: (lastTask?.sortOrder ?? -1) + 1,
    },
  });

  await logActivity({
    organizationId: user.organizationId,
    userId: user.userId,
    action: "task.created",
    entityType: "Task",
    entityId: task.id,
    projectId: milestone.project.id,
    metadata: { title: task.title, milestoneId: milestone.id },
  });

  revalidatePath(`/projects/${milestone.project.id}/milestones`);

  return { success: true, data: { id: task.id } };
}

/**
 * Update a task (title, description, priority, assignee, due date).
 */
export async function updateTaskAction(
  input: {
    id: string;
    title?: string;
    description?: string;
    status?: string;
    priority?: string;
    assigneeId?: string | null;
    dueDate?: string | null;
  },
): Promise<ActionResult> {
  let user;
  try {
    user = await requireAuth();
  } catch (error) {
    if (error instanceof AuthError) {
      return { success: false, error: error.message };
    }
    throw error;
  }

  const parsed = updateTaskSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message ?? "Invalid input.",
    };
  }

  const task = await prisma.task.findFirst({
    where: { id: parsed.data.id },
    include: {
      milestone: {
        include: {
          project: { select: { id: true, organizationId: true } },
        },
      },
    },
  });

  if (
    !task ||
    task.milestone.project.organizationId !== user.organizationId
  ) {
    return { success: false, error: "Task not found." };
  }

  const { id, ...data } = parsed.data;

  // If assigning, verify assignee is in same org
  if (data.assigneeId) {
    const assignee = await prisma.user.findFirst({
      where: {
        id: data.assigneeId,
        organizationId: user.organizationId,
        isActive: true,
      },
    });
    if (!assignee) {
      return { success: false, error: "Assignee not found." };
    }
  }

  await prisma.task.update({
    where: { id },
    data: {
      ...data,
      completedAt:
        data.status === "DONE" && !task.completedAt
          ? new Date()
          : data.status && data.status !== "DONE"
            ? null
            : undefined,
    },
  });

  await logActivity({
    organizationId: user.organizationId,
    userId: user.userId,
    action: "task.updated",
    entityType: "Task",
    entityId: id,
    projectId: task.milestone.project.id,
    metadata: { fields: Object.keys(data) },
  });

  revalidatePath(`/projects/${task.milestone.project.id}/milestones`);

  return { success: true, data: { id } };
}

/**
 * Move a task to a new status (used by kanban drag-and-drop).
 */
export async function moveTaskAction(
  input: { taskId: string; newStatus: string },
): Promise<ActionResult> {
  let user;
  try {
    user = await requireAuth();
  } catch (error) {
    if (error instanceof AuthError) {
      return { success: false, error: error.message };
    }
    throw error;
  }

  const parsed = moveTaskSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message ?? "Invalid input.",
    };
  }

  const task = await prisma.task.findFirst({
    where: { id: parsed.data.taskId },
    include: {
      milestone: {
        include: {
          project: { select: { id: true, organizationId: true } },
        },
      },
    },
  });

  if (
    !task ||
    task.milestone.project.organizationId !== user.organizationId
  ) {
    return { success: false, error: "Task not found." };
  }

  const oldStatus = task.status;

  await prisma.task.update({
    where: { id: parsed.data.taskId },
    data: {
      status: parsed.data.newStatus,
      completedAt:
        parsed.data.newStatus === "DONE" ? new Date() : null,
    },
  });

  await logActivity({
    organizationId: user.organizationId,
    userId: user.userId,
    action: "task.status_changed",
    entityType: "Task",
    entityId: parsed.data.taskId,
    projectId: task.milestone.project.id,
    metadata: { from: oldStatus, to: parsed.data.newStatus },
  });

  revalidatePath(`/projects/${task.milestone.project.id}/milestones`);

  return { success: true };
}

/**
 * Delete a task.
 * Requires MEMBER role or higher.
 */
export async function deleteTaskAction(
  taskId: string,
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

  const task = await prisma.task.findFirst({
    where: { id: taskId },
    include: {
      milestone: {
        include: {
          project: { select: { id: true, organizationId: true } },
        },
      },
    },
  });

  if (
    !task ||
    task.milestone.project.organizationId !== user.organizationId
  ) {
    return { success: false, error: "Task not found." };
  }

  await prisma.task.delete({ where: { id: taskId } });

  await logActivity({
    organizationId: user.organizationId,
    userId: user.userId,
    action: "task.deleted",
    entityType: "Task",
    entityId: taskId,
    projectId: task.milestone.project.id,
    metadata: { title: task.title },
  });

  revalidatePath(`/projects/${task.milestone.project.id}/milestones`);

  return { success: true };
}
