"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole, AuthError } from "@/lib/auth-utils";
import { logActivity } from "@/lib/activity";
import {
  createProjectSchema,
  updateProjectSchema,
} from "@/lib/validations/project";
import { isValidTransition } from "@/lib/project-status";
import type { ProjectStatus } from "@prisma/client";
import { UserRole } from "@prisma/client";

type ActionResult = {
  success: boolean;
  error?: string;
  data?: { id: string };
};

/**
 * Create a new project.
 * Requires MEMBER role or higher.
 */
export async function createProjectAction(
  _prevState: ActionResult | null,
  formData: FormData,
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

  const rawData = {
    name: formData.get("name") as string,
    description: formData.get("description") as string | undefined,
    type: formData.get("type") as string,
    clientName: formData.get("clientName") as string | undefined,
    clientEmail: formData.get("clientEmail") as string | undefined,
    clientPhone: formData.get("clientPhone") as string | undefined,
    clientAddress: formData.get("clientAddress") as string | undefined,
    startDate: formData.get("startDate") as string | undefined,
    endDate: formData.get("endDate") as string | undefined,
  };

  const parsed = createProjectSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message ?? "Invalid input.",
    };
  }

  const data = parsed.data;

  // Validate date range
  if (data.startDate && data.endDate && data.endDate < data.startDate) {
    return {
      success: false,
      error: "End date must be after start date.",
    };
  }

  const project = await prisma.project.create({
    data: {
      organizationId: user.organizationId,
      name: data.name,
      description: data.description || null,
      type: data.type,
      clientName: data.clientName || null,
      clientEmail: data.clientEmail || null,
      clientPhone: data.clientPhone || null,
      clientAddress: data.clientAddress || null,
      startDate: data.startDate ?? null,
      endDate: data.endDate ?? null,
    },
  });

  await logActivity({
    organizationId: user.organizationId,
    userId: user.userId,
    action: "project.created",
    entityType: "Project",
    entityId: project.id,
    projectId: project.id,
    metadata: { name: project.name, type: project.type },
  });

  revalidatePath("/projects");
  revalidatePath("/dashboard");

  redirect(`/projects/${project.id}`);
}

/**
 * Update an existing project.
 * Requires MEMBER role or higher.
 */
export async function updateProjectAction(
  _prevState: ActionResult | null,
  formData: FormData,
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

  const rawData = {
    id: formData.get("id") as string,
    name: formData.get("name") as string | undefined,
    description: formData.get("description") as string | undefined,
    type: formData.get("type") as string | undefined,
    clientName: formData.get("clientName") as string | undefined,
    clientEmail: formData.get("clientEmail") as string | undefined,
    clientPhone: formData.get("clientPhone") as string | undefined,
    clientAddress: formData.get("clientAddress") as string | undefined,
    startDate: formData.get("startDate") as string | undefined,
    endDate: formData.get("endDate") as string | undefined,
  };

  const parsed = updateProjectSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message ?? "Invalid input.",
    };
  }

  const { id, ...data } = parsed.data;

  // Verify project belongs to user's organization
  const existing = await prisma.project.findFirst({
    where: { id, organizationId: user.organizationId },
  });

  if (!existing) {
    return { success: false, error: "Project not found." };
  }

  // Validate date range if both dates are provided
  const startDate = data.startDate ?? existing.startDate;
  const endDate = data.endDate ?? existing.endDate;
  if (startDate && endDate && endDate < startDate) {
    return {
      success: false,
      error: "End date must be after start date.",
    };
  }

  await prisma.project.update({
    where: { id },
    data: {
      ...data,
      clientEmail: data.clientEmail || null,
    },
  });

  await logActivity({
    organizationId: user.organizationId,
    userId: user.userId,
    action: "project.updated",
    entityType: "Project",
    entityId: id,
    projectId: id,
    metadata: { fields: Object.keys(data) },
  });

  revalidatePath(`/projects/${id}`);
  revalidatePath("/projects");
  revalidatePath("/dashboard");

  return { success: true, data: { id } };
}

/**
 * Transition a project to a new status.
 * Validates the transition is allowed.
 * Requires MANAGER role or higher.
 */
export async function transitionProjectStatusAction(
  projectId: string,
  newStatus: ProjectStatus,
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

  const project = await prisma.project.findFirst({
    where: { id: projectId, organizationId: user.organizationId },
  });

  if (!project) {
    return { success: false, error: "Project not found." };
  }

  if (!isValidTransition(project.status, newStatus)) {
    return {
      success: false,
      error: `Cannot transition from ${project.status} to ${newStatus}.`,
    };
  }

  await prisma.project.update({
    where: { id: projectId },
    data: {
      status: newStatus,
      archivedAt: newStatus === "ARCHIVED" ? new Date() : undefined,
    },
  });

  await logActivity({
    organizationId: user.organizationId,
    userId: user.userId,
    action: "project.status_changed",
    entityType: "Project",
    entityId: projectId,
    projectId,
    metadata: { from: project.status, to: newStatus },
  });

  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/projects");
  revalidatePath("/dashboard");

  return { success: true };
}

/**
 * Delete a project (hard delete for drafts, archive for active).
 * Only ADMIN can hard delete. MANAGER can archive.
 */
export async function deleteProjectAction(
  projectId: string,
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

  const project = await prisma.project.findFirst({
    where: { id: projectId, organizationId: user.organizationId },
  });

  if (!project) {
    return { success: false, error: "Project not found." };
  }

  // Only ADMIN can hard-delete, and only DRAFT projects
  if (project.status === "DRAFT" && user.role === UserRole.ADMIN) {
    await prisma.project.delete({ where: { id: projectId } });

    await logActivity({
      organizationId: user.organizationId,
      userId: user.userId,
      action: "project.deleted",
      entityType: "Project",
      entityId: projectId,
      metadata: { name: project.name },
    });
  } else {
    // For non-draft projects, archive instead
    if (project.status === "ARCHIVED") {
      return { success: false, error: "Project is already archived." };
    }

    // Transition to archived if valid
    if (!isValidTransition(project.status, "ARCHIVED")) {
      // Must complete first, then archive
      return {
        success: false,
        error: `Cannot archive a project in ${project.status} status. Complete it first.`,
      };
    }

    await prisma.project.update({
      where: { id: projectId },
      data: { status: "ARCHIVED", archivedAt: new Date() },
    });

    await logActivity({
      organizationId: user.organizationId,
      userId: user.userId,
      action: "project.archived",
      entityType: "Project",
      entityId: projectId,
      projectId,
      metadata: { name: project.name },
    });
  }

  revalidatePath("/projects");
  revalidatePath("/dashboard");

  return { success: true };
}
